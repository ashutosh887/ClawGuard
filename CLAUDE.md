# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## LATEST 2026 STACK

| Package | Version | Notes |
|---|---|---|
| Next.js | **16.2.2** | App Router, Turbopack, `jsx: "react-jsx"` |
| React | **19.2.4** | |
| TypeScript | **^5.8** | |
| Tailwind CSS | **v4** | `@import "tailwindcss"` + `@theme inline` syntax |
| @auth0/nextjs-auth0 | **4.16.1** | Auth0 SDK for Next.js |
| @auth0/ai | **6.0.0** | Auth0 AI SDK — Token Vault, CIBA, Device Flow |
| @auth0/ai-langchain | **5.0.0** | LangChain bindings for Auth0 AI |
| @langchain/langgraph | **0.4.9** | LangGraph agent framework |
| @langchain/core | **0.3.80** | LangChain core |
| zod | **3.25.76** | Schema validation |
| lucide-react | **1.7.0** | Icons |
| ESLint | **9.x** | Flat config (`eslint.config.mjs`) |

**No `src/` directory** — Next.js 16 scaffolds `app/`, `lib/`, `components/` at root.

## Project Overview

ClawGuard is a sovereign AI agent platform where core AI reasoning runs **locally** (on-device) while a lightweight cloud intermediary handles secure external API access via Auth0 Token Vault. The key insight: local AI never touches OAuth tokens — the cloud intermediary fetches scoped tokens from Auth0, calls external APIs, and streams results back.

## Architecture (with Fail-Safe Pipeline)

```
┌──────────────────┐                              ┌─────────────────────────────────┐
│  Local Sovereign  │       POST/WebSocket        │  Cloud Intermediary (Next.js 16)│
│  AI (browser/app) │ ◄─────────────────────────► │                                 │
│                   │   JSON tool requests/results │  ┌─────────────┐               │
│  ┌─────────────┐ │                              │  │ 1. Preview   │ (dry-run)     │
│  │ Offline Queue│ │                              │  └──────┬──────┘               │
│  │ (IndexedDB)  │ │                              │         ▼                       │
│  └─────────────┘ │                              │  ┌─────────────┐               │
│                   │                              │  │ 2. Anomaly   │ (rate+pattern)│
│  ┌─────────────┐ │                              │  │    Shield    │               │
│  │ Panic Button │ │ ────── POST /api/revoke ──► │  └──────┬──────┘               │
│  └─────────────┘ │                              │         ▼                       │
└──────────────────┘                              │  ┌─────────────┐               │
                                                  │  │ 3. Token     │ Auth0 AI SDK  │
                                                  │  │    Vault     │ withTokenVault│
                                                  │  └──────┬──────┘               │
                                                  │         ▼                       │
                                                  │  ┌─────────────┐               │
                                                  │  │ 4. CIBA      │ withAsync-    │
                                                  │  │    Consent   │ Authorization │
                                                  │  └──────┬──────┘               │
                                                  │         ▼                       │
                                                  │  ┌─────────────┐               │
                                                  │  │ 5. External  │               │
                                                  │  │    API Call  │               │
                                                  │  └──────┬──────┘               │
                                                  │         ▼                       │
                                                  │  ┌─────────────┐               │
                                                  │  │ 6. Audit Log │ (SSE stream)  │
                                                  │  └─────────────┘               │
                                                  └─────────────────────────────────┘
```

**Request flow:** Local prompt → Permission Preview (dry-run) → Queue if offline → Anomaly Shield check → Token Vault scoped exchange (`Auth0AI.withTokenVault()`) → Optional CIBA step-up (`Auth0AI.withAsyncAuthorization()`) → External API → Audit entry → Result streams back → One-click revoke available at any time.

## Build & Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server (Turbopack)
npm run build            # Production build
npm start                # Start production server
npm run lint             # ESLint 9 flat config
```

## Project Structure

```
app/
├── api/
│   ├── tool-request/route.ts   # Main entry: local AI → cloud intermediary
│   ├── revoke/route.ts         # Fail-Safe #1: bulk token revocation
│   ├── preview/route.ts        # Fail-Safe #4: dry-run permission check
│   ├── audit/route.ts          # Fail-Safe #5: SSE audit stream
│   ├── queue/route.ts          # Fail-Safe #3: offline queue replay
│   └── simulate/route.ts      # Attack simulation engine API
├── dashboard/page.tsx          # Security ops dashboard (audit + simulator + lifecycle)
├── chat/page.tsx               # Sovereign AI chat interface
├── layout.tsx                  # Root layout (Geist fonts, Nav, dark mode)
└── page.tsx                    # Landing page with animated hero + feature grid
components/
├── audit-dashboard.tsx         # Real-time audit trail (SSE) with filters + pause
├── local-chat.tsx              # Chat UI with typing indicator + tool-call cards
├── permission-preview.tsx      # Dry-run permission card with risk meter
├── revoke-button.tsx           # Kill All Tokens with confirmation flow
├── attack-simulator.tsx        # Red team attack simulation panel
├── token-lifecycle.tsx         # Interactive token flow visualizer
├── status-card.tsx             # Dashboard status indicators with glow
└── nav.tsx                     # Sticky nav with connection status dots
lib/
├── auth0.ts                    # Auth0 client + management token cache
├── token-vault.ts              # Risk assessment, dry-run preview, bulk revocation
├── anomaly-shield.ts           # Rate limiting + pattern detection + CIBA trigger
├── audit-log.ts                # In-memory audit log with SSE pub/sub
├── queue.ts                    # Server-side request queue
├── simulator.ts                # Attack simulation engine (5 scenarios)
├── utils.ts                    # cn() helper
└── langgraph/
    ├── agent.ts                # Auth0AI.withTokenVault() + CIBA wrappers (lazy init)
    └── tools.ts                # LangChain tools using getAccessTokenFromTokenVault()
```

## Auth0 AI SDK Integration (Key Patterns)

Tools are wrapped with Token Vault at the agent level — **not** in API routes:

```ts
import { Auth0AI } from "@auth0/ai-langchain";
import { getAccessTokenFromTokenVault } from "@auth0/ai-langchain";

// Wrap a LangChain tool with Token Vault authorization
const calendarTool = auth0AI.withTokenVault(
  { scopes: ["calendar.events"], connection: "google-oauth2" },
  myLangChainTool
);

// Inside the tool handler, get the scoped access token:
const accessToken = getAccessTokenFromTokenVault();
```

CIBA (Client-Initiated Backchannel Authentication) step-up:
```ts
const cibaTool = auth0AI.withAsyncAuthorization(
  { scopes, audience, userID: (_, config) => config.userId, bindingMessage: () => "Approve action" },
  auth0AI.withTokenVault({ scopes, connection }, tool)
);
```

**Lazy initialization:** `Auth0AI` reads env vars at construction time. The agent module uses lazy getters (`getCalendarTool()`, etc.) so it doesn't fail during `next build` when env vars aren't available.

## Fail-Safe Extensions (5 Token Vault–Deep Features)

### 1. Instant Revoke + Live Session Kill
- **Endpoint:** `POST /api/revoke`
- **Code:** `lib/token-vault.ts:revokeAllTokens()` — Auth0 Management API `DELETE /api/v2/users/{id}/federated-connections/{conn}/tokens`
- One-click severs all agent access to external APIs in <2 seconds
- Panic button available in both dashboard and local chat UI

### 2. Anomaly Shield (Auto-Pause on Suspicious Patterns)
- **Code:** `lib/anomaly-shield.ts`
- Rate limits: max 5 writes/min per connection, 20 total calls/min
- Suspicious hour detection (1am-6am UTC) → auto-triggers CIBA step-up
- High-risk actions (delete, admin, transfer) → always require CIBA
- On violation: agent pauses, user gets push consent notification

### 3. Offline Queue + Graceful Degradation
- **Endpoint:** `POST /api/queue` (replay), `GET /api/queue` (status)
- **Client:** `components/local-chat.tsx` queues requests when offline
- On reconnect: replays through full Token Vault + Anomaly Shield flow with fresh tokens

### 4. Permission Preview + Dry-Run Mode
- **Endpoint:** `POST /api/preview`
- **Code:** `lib/token-vault.ts:previewExchange()`
- Validates scopes without exchanging tokens or calling external APIs
- Returns risk level (low/medium/high) + whether CIBA is required

### 5. Live Audit Trail Dashboard
- **Endpoint:** `GET /api/audit?stream=true` (SSE)
- **Code:** `lib/audit-log.ts` (singleton pub/sub), `components/audit-dashboard.tsx`
- Every Token Vault exchange, revocation, CIBA request, and anomaly appears in real time

### 6. Attack Simulation Mode (Red Team Demo)
- **Endpoint:** `POST /api/simulate` (run), `GET /api/simulate` (list scenarios)
- **Code:** `lib/simulator.ts`, `components/attack-simulator.tsx`
- 5 built-in attack scenarios: Token Replay, Scope Escalation, Rate Limit Breach, Suspicious Hour, Bulk Delete
- Each simulation generates real audit entries visible in the Live Audit Trail
- Visual feedback: blocked/passed badges, expandable details, risk-colored cards

### 7. Token Lifecycle Visualizer
- **Code:** `components/token-lifecycle.tsx`
- Interactive animated flow: Request → Preview → Shield → Token Vault → CIBA → API → Audit → Revocable
- 5 scenario modes: Normal Flow, Blocked by Shield, CIBA Approved, CIBA Denied, Token Revoked
- Step-by-step animation with glow effects on active stage

## UI Design System

- **Accent:** Auth0-inspired purple (#635DFF light / #818cf8 dark)
- **Animations:** fadeIn, slideDown, pulse-glow, flash-red/green, typing dots, shimmer
- **Glassmorphism:** backdrop-blur cards with translucent backgrounds
- **Staggered animations:** `.stagger-1` through `.stagger-6` for cascade effects
- **Gradient text:** `.gradient-text` for hero headings

## Critical Design Constraints

1. **Token Vault is non-negotiable.** Every external API call must route through Auth0AI.withTokenVault().
2. **Tokens never leave the server.** `getAccessTokenFromTokenVault()` is server-side only.
3. **Anomaly Shield gates every Token Vault exchange.** It runs before the tool is invoked.
4. **Audit log captures everything.** Every exchange, revocation, CIBA event, and anomaly is logged.
5. **Lazy agent init.** Auth0AI construction is deferred to first request to avoid build failures.

## Environment Variables

Copy `.env.example` to `.env.local`. Required:
- `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`
- `AUTH0_GOOGLE_CONNECTION`, `AUTH0_SLACK_CONNECTION`, `AUTH0_GITHUB_CONNECTION`

## Reference Repos

- Auth0 sample (LangGraph + Next.js): `auth0-samples/auth0-assistant0`
- OpenClaw: `openclaw/openclaw`
- WebLLM: MLC WebLLM official demo
