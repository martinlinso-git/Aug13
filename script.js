let allPhones = [];
let cart = [];

// Initialize data and dark mode listeners when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadPhones();
});

/* ==========================================================================
   Dark Mode Logic
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');

  // Check saved preference or system setting
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setTheme('dark');
  } else {
    setTheme('light');
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

function setTheme(theme) {
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.innerText = '☀️';
    themeText.innerText = 'Light Mode';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeIcon.innerText = '🌙';
    themeText.innerText = 'Dark Mode';
    localStorage.setItem('theme', 'light');
  }
}

/* ==========================================================================
   Store & Cart Logic
   ========================================================================== */
async function loadPhones() {
  const listDiv = document.getElementById('phoneList');
  try {
    const response = await fetch('db.json');
    if (!response.ok) throw new Error('Failed to fetch product data');
    const data = await response.json();
    allPhones = data.phones;
    displayPhones(allPhones);
  } catch (error) {
    listDiv.innerHTML = `<p style="color:var(--danger);">Error loading phones. Please try again later.</p>`;
    console.error(error);
  }
}

function displayPhones(phones) {
  const listDiv = document.getElementById('phoneList');

  if (phones.length === 0) {
    listDiv.innerHTML = '<p class="empty-msg">No phones match your search.</p>';
    return;
  }

  listDiv.innerHTML = phones.map(phone => `
    <div class="card">
      <div>
        <img src="${phone.image}" alt="${phone.name}" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
        <h3>${phone.name}</h3>
        <p><b>Color:</b> ${phone.color}</p>
        <p><b>Storage:</b> ${phone.storage}</p>
        <p class="price">₹${phone.price.toLocaleString('en-IN')}</p>
      </div>
      <button onclick="addToCart(${phone.id})">Add to Cart</button>
    </div>
  `).join('');
}

function searchPhones() {
  const searchText = document.getElementById('searchBox').value.trim().toLowerCase();
  const filtered = allPhones.filter(phone =>
    phone.name.toLowerCase().includes(searchText) ||
    phone.color.toLowerCase().includes(searchText)
  );
  displayPhones(filtered);
}

function addToCart(phoneId) {
  const phone = allPhones.find(p => p.id === phoneId);
  if (!phone) return;

  const existingItem = cart.find(item => item.id === phoneId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...phone, quantity: 1 });
  }

  updateCart();
}

function removeFromCart(phoneId) {
  cart = cart.filter(item => item.id !== phoneId);
  updateCart();
}

function updateCart() {
  const cartItemsDiv = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    cartCountEl.innerText = '0';
    cartTotalEl.innerText = '0';
    return;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartItemsDiv.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong> (${item.quantity}x)<br>
        <small>₹${(item.price * item.quantity).toLocaleString('en-IN')}</small>
      </div>
      <button onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join('');

  cartCountEl.innerText = totalItems;
  cartTotalEl.innerText = totalPrice.toLocaleString('en-IN');
}