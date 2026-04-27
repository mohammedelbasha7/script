const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const CARDCOM_API = 'https://secure.cardcom.solutions/api/v11/LowProfile/Create';
const CARDCOM_TERMINAL = process.env.CARDCOM_TERMINAL;
const CARDCOM_USERNAME = process.env.CARDCOM_USERNAME;

const products = [
  { id: 1, name: 'סט כלי עבודה 39 חלקים', price: 189, category: 'כלי עבודה' },
  { id: 2, name: 'כיסא גן אלומיניום', price: 249, category: 'ריהוט גן' },
  { id: 3, name: 'מנורת תלייה מעוצבת', price: 139, category: 'תאורה' },
  { id: 4, name: 'מדף קיר דקורטיבי', price: 99, category: 'דקורציה' }
];

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'storefront-backend' });
});

app.post('/api/search', (req, res) => {
  const query = (req.body?.query || '').trim();
  if (!query) {
    return res.json({ query: '', items: products });
  }

  const q = query.toLowerCase();
  const items = products.filter(
    (item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
  );

  return res.json({ query, items });
});

app.post('/api/ui-action', (req, res) => {
  const action = req.body?.action;
  const messages = {
    account: 'כניסה לחשבון תוגדר מול מערכת משתמשים.',
    favorites: 'המועדפים נשמרו בצד השרת.',
    promotions: 'מבצעי היום נטענו מהשרת בהצלחה.'
  };

  if (!messages[action]) {
    return res.status(400).json({ error: 'Unknown UI action.' });
  }

  return res.json({ ok: true, action, message: messages[action] });
});

app.post('/api/newsletter/subscribe', (req, res) => {
  const email = (req.body?.email || '').trim();
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email.' });
  }

  return res.json({ ok: true, message: `הכתובת ${email} נרשמה בהצלחה.` });
});

app.post('/api/cardcom/lowprofile', async (req, res) => {
  if (!CARDCOM_TERMINAL || !CARDCOM_USERNAME) {
    return res.status(500).json({
      error: 'Missing CardCom configuration. Set CARDCOM_TERMINAL and CARDCOM_USERNAME in .env.'
    });
  }

  const { amount, orderId, customerName } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount.' });
  }

  const payload = {
    TerminalNumber: CARDCOM_TERMINAL,
    UserName: CARDCOM_USERNAME,
    Operation: 1,
    Amount: Number(amount).toFixed(2),
    ISOCoinId: 1,
    ReturnValue: orderId || `order-${Date.now()}`,
    ProductName: 'Leroy Style Order',
    IndicatorUrl: `${req.protocol}://${req.get('host')}/payment-indicator`,
    SuccessRedirectUrl: `${req.protocol}://${req.get('host')}/payment-success.html`,
    FailedRedirectUrl: `${req.protocol}://${req.get('host')}/payment-failed.html`,
    APILevel: 11,
    Language: 'he',
    CoinID: 1,
    CustomerName: customerName || 'Online Customer'
  };

  try {
    const response = await fetch(CARDCOM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'CardCom request failed.', details: text });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected CardCom error.', details: error.message });
  }
});

app.post('/payment-indicator', (req, res) => {
  console.log('CardCom indicator callback:', req.body);
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Storefront running on http://localhost:${PORT}`);
});
