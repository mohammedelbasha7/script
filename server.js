const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const CARDCOM_API = 'https://secure.cardcom.solutions/api/v11/LowProfile/Create';
const CARDCOM_TERMINAL = process.env.CARDCOM_TERMINAL;
const CARDCOM_USERNAME = process.env.CARDCOM_USERNAME;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

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
