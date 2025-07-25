# Ninvax Monorepo

This repository houses the various components of the Ninvax project. Each directory contains a separate piece of the stack.

## Directory Overview

- `site/` – static HTML content deployed to GitHub Pages via [`.github/workflows/static.yml`](.github/workflows/static.yml).
- `frontend/` – Next.js application. Install dependencies with `npm install` and start with `npm run dev`.
- `backend/` – Express server. Requires environment variables such as `PORT`, `SUPABASE_URL`, `SUPABASE_KEY` and `STRIPE_SECRET`.
- `NinvaxApp/` – Swift project opened in Xcode (`NinvaxApp.xcodeproj`).
- `code-engine-core/` – Rust engine built with `cargo build`.
- `ai_bot/` – Python utilities run via `python ai_bot/bootstrap.py`.

## Getting Started

1. Clone the repository and configure environment variables:
   - Backend: set `PORT`, `SUPABASE_URL`, `SUPABASE_KEY`, `STRIPE_SECRET` (e.g. in a `.env` file).
   - Frontend: for the contact API route define `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `CONTACT_EMAIL` (place them in `.env.local`).
2. Build or run components as needed:
   ```bash
   # Static site preview
   open site/index.html

   # Frontend
   cd frontend && npm install && npm run dev

   # Backend
   cd backend && npm install && npm start

   # iOS App
   cd NinvaxApp && open NinvaxApp.xcodeproj

   # Rust engine
   cd code-engine-core && cargo build

   # AI utilities
   python ai_bot/bootstrap.py
   ```


## Environment setup

Both the `frontend` and `backend` folders contain a `.env.example` file.
Copy these templates to `.env.local` or `.env` and provide the required values
before running the applications.

This overview should help you get each part of the project running locally.


## AI bot dependencies

The AI bot modules rely on a few Python packages. Install them with:

```bash
pip install -r ai_bot/requirements.txt
```

