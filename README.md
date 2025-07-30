# Ninvax Monorepo

This repository hosts all projects that make up the Ninvax platform. Runtime applications live inside the `apps/` folder while reusable libraries are kept in `packages/`.

## Applications

| Path | Description | How to Run |
|------|-------------|------------|
| [`apps/ios`](apps/ios) | Swift iOS application | Open `NinvaxApp.xcodeproj` in Xcode |
| [`apps/android`](apps/android) | Kotlin Android application | Open in Android Studio |
| [`apps/web`](apps/web) | Next.js frontend | `npm install && npm run dev` |
| [`apps/react-native`](apps/react-native) | React Native mobile app | `npm install && npm start` |
| [`apps/backend`](apps/backend) | FastAPI backend (`ninvax`) and legacy Express server | `uvicorn ninvax.app.api:app` or `cd express && npm start` |
| [`apps/bot`](apps/bot) | Python AI bot utilities | `pip install -r requirements.txt && python bootstrap.py` |
| [`apps/site`](apps/site) | Landing site and contact form | `node assets/js/server.js` or open `index.html` |

## Packages

| Path | Description |
|------|-------------|
| [`packages/code-engine-core`](packages/code-engine-core) | Rust game/loop engine |
| [`packages/shared-utils`](packages/shared-utils) | Shared helpers (placeholder) |

## Getting Started

Copy the provided `.env.example` files where available and supply the required values. Run the applications with the commands listed above.


## AI Ensemble

The bot application can query multiple language models (OpenAI, Gemini, Claude, and Cohere) and combine their responses to improve accuracy. Run `python apps/bot/ask.py "your question"` to try it. This project credits [Major League Hacking](https://mlh.io) for community support.
