# Express Backend

This subfolder contains the legacy Node.js server used for prototypes.

This directory provides a basic Express server skeleton intended for Supabase and Stripe integration.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```

Environment variables used are documented in `.env.example`:

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `STRIPE_SECRET`

Copy this file to `.env` and fill in your keys before starting the server.

### API Endpoints

The server exposes a few endpoints related to Stripe Terminal "Tap to Pay":

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/terminal/connection_token` | Create a connection token for the SDK |
| `POST` | `/terminal/create_payment_intent` | Create a PaymentIntent |
| `POST` | `/terminal/capture_payment_intent` | Capture a PaymentIntent |
