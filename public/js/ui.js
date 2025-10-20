import { cart, getCartTotals, updateQuantity, removeFromCart } from "./cart.js";

export function renderProducts(products, container) {
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `<p>No products found in this category.</p>`;
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <div class="product-img" style="background-image: url('${product.image}')"></div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p class="product-price">Ksh ${product.price.toLocaleString()}</p>
        <button class="cta-button add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });
}

export function renderCart(cartContainer) {
  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="empty-cart-message">Your cart is empty.</p>`;
    return;
  }

  cartContainer.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>Ksh ${item.price.toLocaleString()} × ${item.quantity}</p>
        </div>
        <div class="cart-item-actions">
          <button class="decrease" data-id="${item.id}">-</button>
          <button class="increase" data-id="${item.id}">+</button>
          <button class="remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>`
    )
    .join("");
}

export function updateCartTotalsUI({ subtotal, tax, total }, elements) {
  const { subtotalEl, taxEl, totalEl, cartCount } = elements;
  subtotalEl.textContent = `Ksh ${subtotal.toLocaleString()}`;
  taxEl.textContent = `Ksh ${tax.toFixed(2)}`;
  totalEl.textContent = `Ksh ${total.toLocaleString()}`;
  cartCount.textContent = cart.reduce((count, item) => count + item.quantity, 0);
}

export function setupRemoveButtons(cartContainer, onUpdate) {
  cartContainer.addEventListener("click", (e) => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains("remove")) removeFromCart(id);
    if (e.target.classList.contains("increase")) updateQuantity(id, "increase");
    if (e.target.classList.contains("decrease")) updateQuantity(id, "decrease");
    onUpdate();
  });
}

export function setupFilters(buttons, products, container, callback) {
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.dataset.category;
      const filtered =
        category === "all"
          ? products
          : products.filter((p) => p.category === category);
      callback(filtered);
    });
  });
}

export function setupDeliveryToggle(options, deliveryFeeLine, updateTotals) {
  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");

      const deliverySelected = option.dataset.type === "delivery";
      deliveryFeeLine.style.display = deliverySelected ? "flex" : "none";

      updateTotals(deliverySelected);
    });
  });
}
