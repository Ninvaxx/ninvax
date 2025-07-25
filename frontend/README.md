# Ninvax Frontend

This directory contains a minimal Next.js setup for the modernized Ninvax site. The frontend now includes a small blog, a products page and a contact form.

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
- `NEXT_PUBLIC_CALENDAR_URL`
- `BACKEND_URL`

Copy this file to `.env.local` and provide the values for local development.
