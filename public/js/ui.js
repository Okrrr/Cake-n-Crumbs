import { cart, getCartTotal, removeFromCart } from "./cart.js";

export function renderProducts(products, container) {
  container.innerHTML = "";
  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Ksh ${product.price}</p>
      <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

export function renderCart(container) {
  container.innerHTML = "";
  cart.forEach((item) => {
    const row = document.createElement("div");
    row.classList.add("cart-item");
    row.innerHTML = `
      <span>${item.name} (${item.quantity})</span>
      <span>Ksh ${item.price * item.quantity}</span>
      <button class="remove" data-id="${item.id}">Remove</button>
    `;
    container.appendChild(row);
  });
}

export function updateCartTotal(container) {
  container.textContent = `Total: Ksh ${getCartTotal()}`;
}

export function setupRemoveButtons(container, onRemove) {
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove")) {
      const id = parseInt(e.target.dataset.id);
      onRemove(id);
    }
  });
}

// Filter and render products based on category
export function setupFilters(products, productContainer, onFilter) {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active from all
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const category = button.dataset.category;
      const filtered =
        category === "all"
          ? products
          : products.filter((p) => p.category === category);

      onFilter(filtered); // callback to re-render products
    });
  });
}