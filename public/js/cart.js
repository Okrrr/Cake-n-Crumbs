export let cart = [];

export function loadCart() {
  const saved = localStorage.getItem("cart");
  cart = saved ? JSON.parse(saved) : [];
}

export function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  saveCart();
}

export function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
}

export function updateQuantity(id, type) {
  const item = cart.find((p) => p.id === id);
  if (!item) return;
  if (type === "increase") item.quantity++;
  if (type === "decrease") {
    item.quantity--;
    if (item.quantity <= 0) removeFromCart(id);
  }
  saveCart();
}

export function clearCart() {
  cart = [];
  saveCart();
}

export function getCartTotals(TAX_RATE = 0.08, DELIVERY_FEE = 0, deliverySelected = false) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + (deliverySelected ? DELIVERY_FEE : 0);
  return { subtotal, tax, total };
}