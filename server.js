const express = require("express");
const path = require("path");
const app = express();
const mysql = require("mysql");
const dbConn = mysql.createConnection({
  host: "localhost",
  database: "bakery_management",
  user: "root",
  password: "Korir@01",
  port: 3306,
});
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(13);
const session = require("express-session");
// const sqlQueries = require("./sqlStatement.js");
// const utils = require("./utils.js");

// middleware
app.use(express.static(path.join(__dirname, "public"))); // static files will be served from the 'public' directory/folder
app.use(express.urlencoded({ extended: true })); // body parser to decrypt incoming data to req.body
app.use(
  session({
    secret: "korirjuan",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/order", (req, res) => {
  res.render("order", { products: [] });
}); 

app.post("/order", (req, res) => {
  const { customerName, item, quantity } = req.body;
  dbConn.query(
    "INSERT INTO orders (customer_name, item, quantity) VALUES (?, ?, ?)",
    [customerName, item, quantity],
    (err, result) => {
      if (err) return res.status(500).send("Database error");
      res.redirect("/");
    }
  );
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

