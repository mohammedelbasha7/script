const productData = [
  {
    id: 1,
    name: 'סט כלי עבודה 39 חלקים',
    price: 189,
    img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    name: 'כיסא גן אלומיניום',
    price: 249,
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    name: 'מנורת תלייה מעוצבת',
    price: 139,
    img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    name: 'מדף קיר דקורטיבי',
    price: 99,
    img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=80'
  }
];

const productsEl = document.getElementById('products');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cart = [];

function renderProducts() {
  productsEl.innerHTML = productData
    .map(
      (p) => `
      <article class="product">
        <img src="${p.img}" alt="${p.name}" />
        <div class="product__body">
          <h3>${p.name}</h3>
          <div class="product__meta">
            <strong>₪${p.price}</strong>
            <small>במלאי</small>
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
}

productsEl.addEventListener('click', (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;
  const product = productData.find((item) => item.id === id);
  cart.push(product);
  renderCart();
});

document.getElementById('cartToggle').addEventListener('click', () => {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
});

document.getElementById('cartClose').addEventListener('click', () => {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
});

renderProducts();
renderCart();
