# Leroy-style storefront with CardCom checkout

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Fill in your real CardCom values:
   - `CARDCOM_TERMINAL`
   - `CARDCOM_USERNAME`
3. Run:
   ```bash
   npm start
   ```
4. Open http://localhost:3000

## Backend-connected buttons

The following UI actions are connected to backend APIs:
- Search button -> `POST /api/search`
- Account button -> `POST /api/ui-action` (`account`)
- Favorites button -> `POST /api/ui-action` (`favorites`)
- Promotions button -> `POST /api/ui-action` (`promotions`)
- Newsletter subscribe button -> `POST /api/newsletter/subscribe`
- Checkout button -> `POST /api/cardcom/lowprofile`

## QA smoke check

After the server is running:
```bash
npm run qa
```

This validates the search endpoint and all non-payment button APIs.
