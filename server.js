const express = require("express");
const path = require("path");
const util = require("util");
const app = express();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const session = require("express-session");

// Database connection
const dbConn = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bakery_management",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "Korir@01",
  port: Number(process.env.DB_PORT || 3306),
});
const dbQuery = util.promisify(dbConn.query).bind(dbConn);

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middleware
app.use(express.static(path.join(__dirname, "public"))); // static files will be served from the 'public' directory/folder
app.use(express.urlencoded({ extended: true })); // body parser to decrypt incoming data to req.body
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_this_dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true if behind HTTPS/proxy
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Expose user to templates
app.use((req, res, next) => {
  res.locals.sessionUser = req.session.user || null;
  next();
});

// Auth middleware
function requireStaff(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect("/staff/login");
}

// Routes (public)
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/order", (req, res) => {
  res.render("order");
});

// Staff auth routes
app.get("/staff/login", (req, res) => {
  const { error } = req.query;
  res.render("staff-login", { error });
});

app.post("/staff/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect("/staff/login?error=" + encodeURIComponent("Missing credentials"));
  }
  try {
    const rows = await dbQuery(
      "SELECT id, username, password_hash, role FROM staff_users WHERE username = ? LIMIT 1",
      [username]
    );
    if (!rows || rows.length === 0) {
      return res.redirect("/staff/login?error=" + encodeURIComponent("Invalid credentials"));
    }
    const user = rows[0];
    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.redirect("/staff/login?error=" + encodeURIComponent("Invalid credentials"));
    }
    req.session.user = { id: user.id, username: user.username, role: user.role };
    return res.redirect("/admin");
  } catch (err) {
    console.error("Login error:", err);
    return res.redirect("/staff/login?error=" + encodeURIComponent("Server error"));
  }
});

app.post("/staff/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Admin routes
app.get("/admin", requireStaff, (req, res) => {
  res.redirect("/admin/orders");
});

app.get("/admin/orders", requireStaff, async (req, res) => {
  try {
    const orders = await dbQuery(
      "SELECT id, customer_name, customer_email, customer_phone, order_type, total, created_at FROM orders ORDER BY created_at DESC"
    );
    res.render("admin-dashboard", { orders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.render("admin-dashboard", { orders: [], error: "Could not load orders" });
  }
});

// Database initialization
async function initializeDatabase() {
  // Connect
  await new Promise((resolve) => {
    dbConn.connect((err) => {
      if (err) {
        console.error("MySQL connection failed:", err.message);
      } else {
        console.log("MySQL connected");
      }
      resolve(); // Resolve regardless to avoid blocking server
    });
  });

  try {
    await dbQuery(
      `CREATE TABLE IF NOT EXISTS staff_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    );

    await dbQuery(
      `CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        customer_email VARCHAR(150),
        customer_phone VARCHAR(50),
        order_type ENUM('pickup','delivery') NOT NULL DEFAULT 'pickup',
        delivery_address TEXT,
        order_date DATE,
        order_time VARCHAR(20),
        items JSON,
        subtotal DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) DEFAULT 0,
        special_instructions TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    );

    // Seed admin user if none exists
    const [{ count }] = await dbQuery(
      "SELECT COUNT(*) as count FROM staff_users WHERE role = 'admin'"
    );
    if (Number(count) === 0) {
      const defaultAdminUser = process.env.ADMIN_USER || "admin";
      const defaultAdminPass = process.env.ADMIN_PASSWORD || "ChangeMe123!";
      const hash = await bcrypt.hash(defaultAdminPass, 12);
      await dbQuery(
        "INSERT INTO staff_users (username, password_hash, role) VALUES (?, ?, 'admin')",
        [defaultAdminUser, hash]
      );
      console.log(
        `Seeded admin user '${defaultAdminUser}'. Please change the password immediately.`
      );
    }
  } catch (err) {
    console.error("Database initialization error:", err.message);
  }
}

initializeDatabase().catch((e) => console.error(e));

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
