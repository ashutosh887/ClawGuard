# ClawGuard

**Local AI that safely touches the world — with zero token exposure.**

Sovereign AI agent platform where core reasoning runs locally while a cloud intermediary securely handles external API access via Auth0 Token Vault. Tokens never touch the local machine.

## Features

- **Permission Preview** — Dry-run permission check with risk assessment before any action fires
- **Anomaly Shield** — Rate limiting, suspicious-pattern detection, and CIBA step-up for high-risk actions
- **Live Audit Trail** — Real-time SSE dashboard for Token Vault exchanges, anomalies, and consent events
- **Offline Queue** — Requests queue when disconnected and replay through the full security pipeline on reconnect
- **Instant Revoke** — One-click bulk token revocation across all connections
- **Sovereign Architecture** — Local AI never sees OAuth tokens or refresh tokens

## Architecture

```
Local AI (OpenClaw / WebLLM)
        |
        | JSON request only
        v
Cloud Intermediary (Next.js 16 + LangGraph)
        |
        | Auth0 AI SDK
        v
Token Vault --> Scoped tokens + CIBA
        |
        v
External APIs (Google Calendar, Gmail, Slack, GitHub)
```

## Tech Stack

| Package | Version |
|---|---|
| Next.js | 16.2.2 |
| React | 19.2.4 |
| TypeScript | 5.x |
| Tailwind CSS | v4 |
| @auth0/ai | 6.0.0 |
| @auth0/ai-langchain | 5.0.0 |
| @auth0/nextjs-auth0 | 4.16.1 |
| @langchain/langgraph | 0.4.9 |

## Getting Started

```bash
git clone https://github.com/ashutosh887/ClawGuard.git
cd ClawGuard
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `AUTH0_SECRET` | Session encryption secret |
| `AUTH0_BASE_URL` | App base URL |
| `AUTH0_ISSUER_BASE_URL` | Auth0 tenant URL |
| `AUTH0_CLIENT_ID` | Application client ID |
| `AUTH0_CLIENT_SECRET` | Application client secret |
| `AUTH0_DOMAIN` | Auth0 domain |
| `AUTH0_AUDIENCE` | API audience identifier |
| `AUTH0_GOOGLE_CONNECTION` | Google OAuth2 connection ID |
| `AUTH0_SLACK_CONNECTION` | Slack connection ID |
| `AUTH0_GITHUB_CONNECTION` | GitHub connection ID |

## Project Structure

```
app/
  api/
    tool-request/route.ts
    revoke/route.ts
    preview/route.ts
    audit/route.ts
    queue/route.ts
  dashboard/page.tsx
  chat/page.tsx
  layout.tsx
  page.tsx

components/
  audit-dashboard.tsx
  local-chat.tsx
  permission-preview.tsx
  revoke-button.tsx
  status-card.tsx
  nav.tsx

lib/
  auth0.ts
  token-vault.ts
  anomaly-shield.ts
  audit-log.ts
  queue.ts
  utils.ts
  langgraph/
    agent.ts
    tools.ts
```

## Security

- All external API calls route through `Auth0AI.withTokenVault()`
- Scoped, short-lived tokens only
- CIBA step-up authentication for high-risk actions
- Bulk revocation via Auth0 Management API
- Anomaly Shield gates every Token Vault exchange
- Tokens never reach the browser or local AI

## License

MIT
