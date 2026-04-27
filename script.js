const productData = [
  {
    id: 1,
    name: 'סט כלי עבודה 39 חלקים',
    price: 189,
    category: 'כלי עבודה',
    img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'כיסא גן אלומיניום',
    price: 249,
    category: 'ריהוט גן',
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'מנורת תלייה מעוצבת',
    price: 139,
    category: 'תאורה',
    img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    name: 'מדף קיר דקורטיבי',
    price: 99,
    category: 'דקורציה',
    img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80'
  }
];

const productsEl = document.getElementById('products');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutStatus = document.getElementById('checkoutStatus');
const pageStatus = document.getElementById('pageStatus');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const newsletterForm = document.getElementById('newsletterForm');
const cart = [];

function showStatus(message, isError = false) {
  pageStatus.textContent = message;
  pageStatus.classList.toggle('error', isError);
}

function renderProducts(products = productData) {
  productsEl.innerHTML = products
    .map(
      (p) => `
      <article class="product">
        <img src="${p.img}" alt="${p.name}" />
        <div class="product__body">
          <h3>${p.name}</h3>
          <div class="product__meta">
            <strong>₪${p.price}</strong>
            <small>${p.category || 'במלאי'}</small>
          </div>
          <button data-id="${p.id}">הוספה לעגלה</button>
        </div>
      </article>
    `
    )
    .join('');
}

function renderCart() {
  cartItemsEl.innerHTML = cart.length
    ? cart
        .map((item) => `<li><span>${item.name}</span><strong>₪${item.price}</strong></li>`)
        .join('')
    : '<li>העגלה ריקה כרגע</li>';

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotalEl.textContent = total;
  cartCountEl.textContent = cart.length;
  checkoutBtn.disabled = cart.length === 0;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Backend error');
  }
  return data;
}

async function beginCardcomCheckout() {
  if (!cart.length) return;

  checkoutBtn.disabled = true;
  checkoutStatus.textContent = 'מכינים עמוד תשלום מאובטח...';

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  try {
    const result = await postJson('/api/cardcom/lowprofile', {
      amount: total,
      orderId: `web-${Date.now()}`,
      customerName: 'לקוח מהאתר'
    });

    const lowProfileCode = result?.LowProfileCode || result?.lowprofilecode;
    if (!lowProfileCode) {
      throw new Error('לא התקבל LowProfileCode מ-CardCom');
    }

    window.location.href = `https://secure.cardcom.solutions/Interface/LowProfile.aspx?LowProfileCode=${encodeURIComponent(lowProfileCode)}`;
  } catch (error) {
    checkoutBtn.disabled = false;
    checkoutStatus.textContent = `שגיאה בחיבור ל-CardCom: ${error.message}`;
  }
}

productsEl.addEventListener('click', (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;
  const product = productData.find((item) => item.id === id);
  cart.push(product);
  checkoutStatus.textContent = '';
  showStatus(`נוסף לעגלה: ${product.name}`);
  renderCart();
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const result = await postJson('/api/search', { query: searchInput.value.trim() });
    renderProducts(result.items);
    showStatus(`נמצאו ${result.items.length} מוצרים עבור "${result.query || 'כל המוצרים'}"`);
  } catch (error) {
    showStatus(`שגיאת חיפוש: ${error.message}`, true);
  }
});

document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      const result = await postJson('/api/ui-action', { action: btn.dataset.action });
      showStatus(result.message);
    } catch (error) {
      showStatus(`שגיאה בפעולה: ${error.message}`, true);
    }
  });
});

function bindCategoryClicks(selector) {
  document.querySelectorAll(selector).forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      try {
        const result = await postJson('/api/search', { query: category });
        renderProducts(result.items);
        showStatus(`קטגוריה: ${category} (${result.items.length} תוצאות)`);
      } catch (error) {
        showStatus(`שגיאת קטגוריה: ${error.message}`, true);
      }
    });
  });
}

bindCategoryClicks('#topCategories a');
bindCategoryClicks('#featuredCategories a');

newsletterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const email = document.getElementById('newsletterEmail').value.trim();
    const result = await postJson('/api/newsletter/subscribe', { email });
    showStatus(result.message);
    newsletterForm.reset();
  } catch (error) {
    showStatus(`שגיאת הרשמה: ${error.message}`, true);
  }
});

document.getElementById('cartToggle').addEventListener('click', () => {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
});

document.getElementById('cartClose').addEventListener('click', () => {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
});

checkoutBtn.addEventListener('click', beginCardcomCheckout);

renderProducts();
renderCart();
showStatus('המערכת מחוברת לשרת. אפשר לבדוק את כל הכפתורים.');
