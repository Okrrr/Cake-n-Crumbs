import { products } from "./product.js";
import {
  cart,
  loadCart,
  addToCart,
  getCartTotals,
} from "./cart.js";
import {
  renderProducts,
  renderCart,
  updateCartTotalsUI,
  setupFilters,
  setupRemoveButtons,
  setupDeliveryToggle,
} from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.querySelector("#products-grid");
  const cartContainer = document.querySelector("#cart-items");
  const totalDisplay = document.querySelector("#total");
  const subtotalEl = document.querySelector("#subtotal");
  const taxEl = document.querySelector("#tax");
  const deliveryFeeEl = document.querySelector("#delivery-fee");
  const deliveryFeeLine = document.querySelector("#delivery-fee-line");
  const cartCount = document.querySelector(".cart-count");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const deliveryOptions = document.querySelectorAll(".option");

  const TAX_RATE = 0.08;
  const DELIVERY_FEE = 3.99;
  let deliverySelected = false;

  loadCart();

  function refreshCartDisplay() {
    renderCart(cartContainer);
    const totals = getCartTotals(TAX_RATE, DELIVERY_FEE, deliverySelected);
    updateCartTotalsUI(
      { ...totals },
      { subtotalEl, taxEl, totalEl: totalDisplay, cartCount }
    );
  }

  // Initial setup
  renderProducts(products, productContainer);
  refreshCartDisplay();
  setupFilters(filterButtons, products, productContainer, (filtered) => {
    renderProducts(filtered, productContainer);
  });

  // Add-to-cart
  productContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const id = parseInt(e.target.dataset.id);
      const product = products.find((p) => p.id === id);
      addToCart(product);
      refreshCartDisplay();
    }
  });

  // Cart quantity/remove
  setupRemoveButtons(cartContainer, refreshCartDisplay);

  // Delivery toggle
  setupDeliveryToggle(deliveryOptions, deliveryFeeLine, (isDelivery) => {
    deliverySelected = isDelivery;
    refreshCartDisplay();
    deliveryFeeEl.textContent = `Ksh ${DELIVERY_FEE.toFixed(2)}`;
  });
});