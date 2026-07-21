# CargoIQ

South Africa's first AI-powered compliance and cost-containment platform for freight forwarders and customs clearing agents running CargoWise.

## Architecture

AI-Native Enterprise Full-Stack Standard v4.1

- **Framework:** Next.js App Router (TypeScript strict)
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Auth:** Better Auth
- **AI:** Vercel AI SDK + Google Gemini
- **Realtime:** Ably
- **Background Jobs:** Inngest + Vercel Cron
- **Portal Automation:** Render Worker (Node.js + Playwright)
- **WhatsApp:** Evolution API (Render)
- **Payments:** PayFast (Phase 2)
- **Deployment:** Vercel (app) + Render (worker)

## Getting Started

1. Copy `.env.example` to `.env` and fill in credentials
2. `npm install`
3. `npx drizzle-kit push` (apply schema to Neon)
4. `npm run dev`

## Deployment

- **Vercel:** Import repo → Set env vars → Deploy
- **Render Worker:** New Web Service → Root: `render-worker` → Build: `npm install && npx playwright install chromium --with-deps` → Start: `npm start` → Free tier

## Modules (14 total)

| # | Module | Status |
|---|--------|--------|
| 1 | Compliance Shield | Built |
| 2 | Carrier Invoice Auditor | Next |
| 3 | Driver Check-In | Built |
| 4 | RLA Sentinel | Next |
| 5 | HS Code Classifier | Next |
| 6 | Section 99(2) Tracker | Next |
| 7 | Email Intelligence | Next |
| 8 | Shadow Audit | Next |
| 9 | VOC Tracker | Next |
| 10 | Invoice Generator | Next |
| 11 | TMS Pre-Declaration | Next |
| 12 | Container Tracking | Next |
| 13 | Savings Certificate | Next |
| 14 | Deal Hunter CRM | Next |

---

NahaLabs (Pty) Ltd | Confidential
