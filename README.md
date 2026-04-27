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

## CardCom flow

- Frontend sends cart total to `POST /api/cardcom/lowprofile`.
- Server calls CardCom `LowProfile/Create` API.
- On success, frontend redirects customer to CardCom secure payment page.
- CardCom returns customer to `payment-success.html` or `payment-failed.html`.
