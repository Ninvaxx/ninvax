# Ninvax Frontend

This directory contains a minimal Next.js setup for the modernized Ninvax site.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

Environment variables for the contact API route are listed in `.env.example`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_EMAIL`

Copy this file to `.env.local` and provide the values for local development.
