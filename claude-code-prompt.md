# Claude Code Prompt: AI Rewrite Anywhere — Chrome Extension (MVP)

## ROLE & MISSION

You are a senior full-stack engineer building a production-ready Chrome Extension called **AI Rewrite Anywhere** — an AI text rewriting tool that works on every website. Build the complete MVP in a single pass: extension frontend, backend API, and database schema.

---

## WHAT YOU ARE BUILDING

A Chrome Extension (Manifest V3) that lets users:
1. **Highlight text** on any webpage → floating button appears → click → AI rewrites it instantly
2. **Right-click** on selected text → context menu → pick rewrite mode
3. **Press `Ctrl+Shift+K`** → command palette opens → type custom instructions

The rewritten text can replace the original, be copied, regenerated, or saved.

---

## COMPLETE TECHNICAL STACK

### Extension
- Manifest V3 (Chrome Extension)
- CRXJS (build tool for Vite + Chrome extensions)
- React 19 + TypeScript
- TailwindCSS v3
- Chrome APIs: `contextMenus`, `sidePanel`, `storage`, `scripting`, `runtime`

### Backend
- Node.js + Express + TypeScript
- Routes: `/api/rewrite`, `/api/auth`, `/api/usage`, `/api/history`
- JWT authentication middleware
- Rate limiting per user (50 rewrites/day for free users)
- AI provider abstraction layer (OpenAI, Anthropic, Google)

### Database
- MongoDB with Mongoose
- Collections: `users`, `usage`, `rewrites`, `subscriptions`

### Analytics
- PostHog (server-side event tracking)

---

## FOLDER STRUCTURE TO CREATE

```
ai-rewrite-anywhere/
├── extension/
│   ├── src/
│   │   ├── background/
│   │   │   ├── index.ts              # Service worker entry
│   │   │   ├── ai/
│   │   │   │   ├── AIProvider.ts     # Interface definition
│   │   │   │   ├── OpenAIProvider.ts
│   │   │   │   ├── ClaudeProvider.ts
│   │   │   │   ├── GeminiProvider.ts
│   │   │   │   └── AIProviderFactory.ts  # With fallback logic
│   │   │   ├── auth/
│   │   │   │   └── googleAuth.ts
│   │   │   └── messaging/
│   │   │       └── messageHandler.ts  # chrome.runtime.onMessage hub
│   │   ├── content/
│   │   │   ├── index.tsx             # Content script entry
│   │   │   ├── selection/
│   │   │   │   └── SelectionTracker.ts  # Detects text selection
│   │   │   ├── injection/
│   │   │   │   ├── FloatingButton.tsx   # Appears on text select
│   │   │   │   └── RewritePopup.tsx     # Main rewrite UI overlay
│   │   │   └── replacement/
│   │   │       └── TextReplacer.ts      # Replaces text in DOM/inputs
│   │   ├── popup/
│   │   │   ├── index.tsx
│   │   │   └── pages/
│   │   │       └── PopupMain.tsx        # Quick status + login state
│   │   ├── sidepanel/
│   │   │   ├── index.tsx
│   │   │   ├── history/
│   │   │   │   └── RewriteHistory.tsx
│   │   │   └── settings/
│   │   │       └── Settings.tsx
│   │   └── shared/
│   │       ├── types/
│   │       │   └── index.ts            # All shared TypeScript types
│   │       ├── constants/
│   │       │   └── rewriteModes.ts
│   │       └── utils/
│   │           └── api.ts              # Fetch wrapper to backend
│   ├── manifest.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Express app entry
│   │   ├── routes/
│   │   │   ├── rewrite.ts
│   │   │   ├── auth.ts
│   │   │   ├── usage.ts
│   │   │   └── history.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification
│   │   │   └── rateLimit.ts          # Per-user daily limit check
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Usage.ts
│   │   │   ├── Rewrite.ts
│   │   │   └── Subscription.ts
│   │   ├── services/
│   │   │   ├── aiService.ts          # Calls AI providers, handles fallback
│   │   │   ├── authService.ts        # Google OAuth token verification
│   │   │   └── analyticsService.ts   # PostHog tracking
│   │   └── utils/
│   │       └── prompts.ts            # System prompts per rewrite mode
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## CORE TYPES (implement in `shared/types/index.ts`)

```typescript
type RewriteMode =
  | 'improve'
  | 'grammar'
  | 'professional'
  | 'friendly'
  | 'formal'
  | 'casual'
  | 'persuasive'
  | 'confident'
  | 'shorten'
  | 'expand'
  | 'simplify'
  | 'humanize'
  | 'custom';

type AIModel = 'gpt-5-mini' | 'claude-sonnet' | 'gemini-2.5-flash';

type UserPlan = 'free' | 'pro';

interface RewriteRequest {
  text: string;
  mode: RewriteMode;
  customPrompt?: string;   // only for mode === 'custom'
  model?: AIModel;
}

interface RewriteResponse {
  output: string;
  modelUsed: AIModel;
  tokensUsed?: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  selectedModel: AIModel;
  dailyUsageCount: number;
}

interface RewriteHistoryItem {
  id: string;
  originalText: string;
  rewrittenText: string;
  mode: RewriteMode;
  modelUsed: AIModel;
  createdAt: string;
}

// Chrome message types
type MessageType =
  | 'REWRITE_TEXT'
  | 'GET_USER'
  | 'GET_HISTORY'
  | 'OPEN_SIDEPANEL'
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT';

interface ChromeMessage {
  type: MessageType;
  payload?: unknown;
}
```

---

## AI PROVIDER LAYER (implement exactly)

```typescript
// AIProvider.ts
interface AIProvider {
  rewrite(text: string, mode: RewriteMode, customPrompt?: string): Promise<string>;
  isAvailable(): Promise<boolean>;
  modelName: AIModel;
}

// AIProviderFactory.ts — fallback chain
// Primary → Fallback 1 → Fallback 2
// Always notify which model was actually used
// NEVER silently switch — return { output, modelUsed } always
```

**Fallback order:**
1. User's selected model (or GPT-5 Mini for Pro, Gemini for Free)
2. Claude Sonnet
3. Gemini 2.5 Flash

On fallback, include a `switchedFrom` field in response so UI can show:
> "GPT-5 Mini unavailable. Switched to Claude Sonnet."

---

## SYSTEM PROMPTS (implement in `backend/src/utils/prompts.ts`)

Map each `RewriteMode` to a precise system prompt. Examples:

```typescript
const PROMPTS: Record<RewriteMode, string> = {
  improve: "Rewrite the following text to improve clarity, flow, readability, and structure. Return only the rewritten text, nothing else.",
  grammar: "Fix all grammar, punctuation, spelling, and sentence construction errors. Return only the corrected text.",
  professional: "Rewrite in a professional business tone. Return only the rewritten text.",
  friendly: "Rewrite in a warm, conversational, and friendly tone. Return only the rewritten text.",
  formal: "Rewrite in a formal, corporate and academic tone. Return only the rewritten text.",
  casual: "Rewrite in a casual, natural everyday tone. Return only the rewritten text.",
  persuasive: "Rewrite to be persuasive and compelling, suitable for marketing or sales. Return only the rewritten text.",
  confident: "Rewrite with strong authority and conviction. Remove any hedging language. Return only the rewritten text.",
  shorten: "Shorten this text while preserving all key meaning. Return only the shortened text.",
  expand: "Expand this text by adding useful, relevant detail. Return only the expanded text.",
  simplify: "Rewrite using simple, plain language that anyone can understand. Return only the simplified text.",
  humanize: "Rewrite this AI-generated text to sound natural and human-written. Vary sentence structure, add natural flow. Return only the rewritten text.",
  custom: "", // replaced at runtime with user's custom prompt
};
```

---

## KEY FEATURES TO IMPLEMENT IN FULL

### 1. FloatingButton (content script)
- Appears 8px above selected text when user selects 10+ characters
- Smooth fade-in animation (150ms)
- Single AI sparkle icon button
- Disappears on click-away or selection clear
- Must NOT interfere with native browser UI
- Position calculation must handle edge cases: near top/bottom/sides of viewport
- Z-index: 2147483647 (max)

### 2. RewritePopup (content script)
- Opens when floating button is clicked
- Shows: original text (collapsible), AI output area, mode selector, action buttons
- Mode selector: pill/chip UI for all 13 modes
- Action buttons: **Replace** | **Copy** | **Regenerate** | **Save**
- Shows selected model name + "Powered by [Model]" badge
- Shows loading spinner during generation
- Shows fallback warning if model switched
- Max width: 480px, positioned smartly near selection
- Close on Escape key

### 3. TextReplacer (content script)
- Must handle: `<input>`, `<textarea>`, `contenteditable` divs
- Must work on: Gmail compose, LinkedIn post box, Twitter/X compose, Notion, Google Docs
- Use `execCommand('insertText')` for input/textarea
- Use `document.execCommand` with Selection API for contenteditable
- Preserve cursor position after replacement

### 4. Context Menu (background service worker)
- Register all rewrite modes as context menu items under "AI Rewrite →"
- Only show when text is selected (`contexts: ['selection']`)
- On click: inject content script if needed, open RewritePopup with pre-selected mode

### 5. Command Palette (`Ctrl+Shift+K`)
- Triggered by keyboard shortcut defined in manifest
- Floating modal with text input
- Placeholder: "e.g. Rewrite for LinkedIn, Make this persuasive..."
- Quick-select chips: "Professional", "Shorter", "Fix Grammar", "Friendly", "Persuasive"
- Submit on Enter

### 6. Side Panel
- **History tab**: List of past rewrites (original → rewritten, mode badge, timestamp, copy button)
- **Settings tab**:
  - Model selector (Pro only, locked for Free with upgrade CTA)
  - Account info (name, email, plan, daily usage counter)
  - Logout button

### 7. Auth Flow
- Google OAuth via `chrome.identity.getAuthToken`
- On login: send token to backend `/api/auth/google`, receive JWT
- Store JWT in `chrome.storage.local`
- Show login prompt in popup if not authenticated

---

## BACKEND API ROUTES

### `POST /api/auth/google`
Body: `{ googleToken: string }`
- Verify token with Google
- Upsert user in MongoDB
- Return JWT + user object

### `POST /api/rewrite`
Headers: `Authorization: Bearer <jwt>`
Body: `{ text, mode, customPrompt?, model? }`
- Check auth
- Check daily limit (50 for free, unlimited for pro)
- Call AI service
- Save to `rewrites` collection
- Increment usage count
- Track PostHog event
- Return `{ output, modelUsed, switchedFrom? }`

### `GET /api/usage`
Returns `{ count, limit, plan, resetAt }`

### `GET /api/history`
Query: `?page=1&limit=20`
Returns paginated rewrite history for user

---

## MONGODB SCHEMAS (implement with Mongoose)

```typescript
// User
{
  _id: ObjectId,
  googleId: string,       // from Google OAuth
  email: string,
  name: string,
  plan: 'free' | 'pro',
  selectedModel: AIModel, // default: 'gemini-2.5-flash' for free, 'gpt-5-mini' for pro
  createdAt: Date
}

// Usage
{
  userId: ObjectId,
  date: string,           // 'YYYY-MM-DD' — one doc per user per day
  rewriteCount: number
}

// Rewrite
{
  userId: ObjectId,
  originalText: string,
  rewrittenText: string,
  mode: RewriteMode,
  modelUsed: AIModel,
  createdAt: Date
}

// Subscription
{
  userId: ObjectId,
  plan: 'free' | 'pro',
  status: 'active' | 'cancelled' | 'expired',
  renewalDate: Date
}
```

---

## UI DESIGN REQUIREMENTS

Visual direction: **dark, modern, minimal** — inspired by developer tools and AI products.

- **Background**: `#0F0F10` (extension panels), `#1A1A1E` (popup cards)
- **Accent**: `#7C6EF8` (purple — primary actions, active states)
- **Text primary**: `#F0F0F2`
- **Text secondary**: `#8B8B9A`
- **Border**: `#2A2A32`
- **Success**: `#4ADE80`
- **Font**: Inter (loaded via CDN or system font stack fallback)

Floating button:
- 36×36px circle, `background: #7C6EF8`, white sparkle SVG icon
- Box shadow: `0 4px 16px rgba(124, 110, 248, 0.4)`
- Hover: scale(1.1) with 150ms ease

Rewrite popup:
- Border radius: 12px
- Box shadow: `0 8px 40px rgba(0,0,0,0.6)`
- Mode chips: pill shape, border on unselected, filled purple on selected
- Smooth skeleton loading state for AI output area

---

## MANIFEST.JSON (create exactly)

```json
{
  "manifest_version": 3,
  "name": "AI Rewrite Anywhere",
  "version": "1.0.0",
  "description": "Highlight text anywhere. Rewrite instantly with AI.",
  "permissions": [
    "activeTab",
    "contextMenus",
    "storage",
    "identity",
    "scripting",
    "sidePanel"
  ],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.tsx"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_title": "AI Rewrite Anywhere"
  },
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "commands": {
    "open-command-palette": {
      "suggested_key": { "default": "Ctrl+Shift+K", "mac": "Command+Shift+K" },
      "description": "Open AI Rewrite command palette"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## ENVIRONMENT VARIABLES

Create `backend/.env.example`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ai-rewrite-anywhere
JWT_SECRET=your-jwt-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key
POSTHOG_API_KEY=your-posthog-key
FREE_DAILY_LIMIT=50
```

---

## PERFORMANCE REQUIREMENTS

- Popup renders in < 300ms
- AI rewrite completes in < 3 seconds (use streaming where possible)
- Extension bundle < 5MB (use code splitting per entry point)
- Content script must NOT block page load — all React injection is lazy

---

## SECURITY REQUIREMENTS

- **No API keys in extension frontend** — all AI calls go through backend
- Backend validates JWT on every `/api/rewrite` request
- Rate limiting: express-rate-limit + per-user daily counter in MongoDB
- Sanitize all text inputs before sending to AI (strip scripts, limit 5000 chars)
- CORS: only allow extension origin

---

## README.md MUST INCLUDE

1. Prerequisites (Node 20+, MongoDB, Chrome)
2. Backend setup steps (env vars, `npm install`, `npm run dev`)
3. Extension build steps (`npm install`, `npm run build`, load unpacked in Chrome)
4. Google OAuth setup instructions
5. Adding API keys
6. Development workflow

---

## WHAT TO BUILD FIRST (order matters)

1. `/shared/types/index.ts` — all types
2. `backend/` — full Express server with all routes, models, services
3. `extension/manifest.json`
4. `extension/src/background/` — service worker, AI providers, message handler
5. `extension/src/content/` — selection tracker, floating button, popup, text replacer
6. `extension/src/popup/` — login state + usage counter
7. `extension/src/sidepanel/` — history + settings
8. `README.md`

---

## FINAL INSTRUCTION

Build the entire project. Write every file. Do not use placeholders or `// TODO` comments — implement every feature described. Where an API key is needed, read from environment variables. Where a UI component is needed, build it fully in React + Tailwind. The output should be a complete, runnable codebase that a developer can clone, add their API keys, and ship.
