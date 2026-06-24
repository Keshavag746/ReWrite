# AI Rewrite Anywhere ✨

A Chrome Extension that lets you highlight text on **any website** and rewrite it instantly with AI — using OpenAI, Anthropic Claude, or Google Gemini, with automatic fallback.

---

## Features

- 🖱️ **Highlight any text** → floating ✨ button appears → click to rewrite
- 🖱️ **Right-click** selected text → "AI Rewrite →" context menu with 13 modes
- ⌨️ **Ctrl+Shift+K** → command palette with quick modes
- 📋 **Side panel** — full rewrite history + settings
- 🔐 **Google Sign-In** with JWT auth
- 🔄 **AI fallback chain** — if your preferred model fails, auto-switches to next
- 🎯 **13 rewrite modes**: Improve, Grammar, Professional, Friendly, Formal, Casual, Persuasive, Confident, Shorten, Expand, Simplify, Humanize, Custom

---

## Prerequisites

- Node.js 20+
- MongoDB 7+ (local or Atlas)
- Google Chrome (latest)
- API keys for at least one AI provider

---

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ai-rewrite-anywhere
JWT_SECRET=<generate a long random string>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
OPENAI_API_KEY=<from platform.openai.com>
ANTHROPIC_API_KEY=<from console.anthropic.com>
GOOGLE_AI_API_KEY=<from aistudio.google.com>
POSTHOG_API_KEY=<from posthog.com — optional>
FREE_DAILY_LIMIT=50
```

### 3. Start the backend

```bash
npm run dev
```

The API will be running at `http://localhost:3001`.
Test it: `curl http://localhost:3001/health`

---

## Extension Build

### 1. Install dependencies

```bash
cd extension
npm install
```

### 2. Build the extension

```bash
npm run build
```

Or for hot-reload development mode:

```bash
npm run dev
```

### 3. Load in Chrome

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/dist` folder

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Create an **OAuth 2.0 Client ID** → type: **Chrome App**
5. Under **Application ID**, enter your Chrome Extension ID (from `chrome://extensions`)
6. Copy the **Client ID** → paste into `backend/.env` as `GOOGLE_CLIENT_ID`
7. Also add the same Client ID to `extension/manifest.json` in the `oauth2` section if needed

---

## Adding API Keys

| Provider | Where to get it | .env key |
|---|---|---|
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) | `OPENAI_API_KEY` |
| Anthropic | [console.anthropic.com](https://console.anthropic.com/) | `ANTHROPIC_API_KEY` |
| Google AI | [aistudio.google.com](https://aistudio.google.com/app/apikey) | `GOOGLE_AI_API_KEY` |
| PostHog | [posthog.com](https://posthog.com) | `POSTHOG_API_KEY` |

> ⚠️ **Security**: API keys are **never** exposed to the extension frontend. All AI calls go through the backend server.

---

## Development Workflow

```
ai-rewrite-anywhere/
├── extension/   ← Chrome Extension (Vite + CRXJS + React + TailwindCSS)
└── backend/     ← Express API (TypeScript + MongoDB)
```

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 — Extension (hot reload):**
```bash
cd extension && npm run dev
```

After running `npm run dev` in the extension, CRXJS will create a `dist/` folder. Load it as an unpacked extension in Chrome. Changes hot-reload automatically.

---

## AI Model Fallback Chain

| Plan | Default Model | Fallback 1 | Fallback 2 |
|---|---|---|---|
| Free | Gemini 2.5 Flash | Claude Sonnet | GPT-5 Mini |
| Pro | GPT-5 Mini | Claude Sonnet | Gemini 2.5 Flash |

When a fallback occurs, the UI shows: _"GPT-5 Mini unavailable. Switched to Claude Sonnet."_

---

## API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/health` | GET | — | Health check |
| `/api/auth/google` | POST | — | Exchange Google token for JWT |
| `/api/rewrite` | POST | ✓ | Rewrite text with AI |
| `/api/usage` | GET | ✓ | Get today's usage stats |
| `/api/history` | GET | ✓ | Get paginated rewrite history |

---

## License

MIT
