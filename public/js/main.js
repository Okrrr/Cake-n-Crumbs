import { products } from "./products.js";
import { cart, loadCart, addToCart, removeFromCart } from "./cart.js";
import { renderProducts, renderCart, updateCartTotal, setupRemoveButtons, setupFilters } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  // Match your EJS IDs
  const productContainer = document.querySelector("#products-grid");
  const cartContainer = document.querySelector("#cart-items");
  const totalDisplay = document.querySelector("#total");

  loadCart();

  // Render products
  renderProducts(products, productContainer);

    // Set up filters
  setupFilters(products, productContainer, (filteredProducts) => {
    renderProducts(filteredProducts, productContainer);
  });

  // Render initial cart
  renderCart(cartContainer);
  updateCartTotal(totalDisplay);

  // Add-to-cart via event delegation
  productContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const id = parseInt(e.target.dataset.id);
      const product = products.find((p) => p.id === id);
      addToCart(product);
      renderCart(cartContainer);
      updateCartTotal(totalDisplay);
    }
  });

  // Remove item
  setupRemoveButtons(cartContainer, (id) => {
    removeFromCart(id);
    renderCart(cartContainer);
    updateCartTotal(totalDisplay);
  });
});