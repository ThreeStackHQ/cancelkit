# CancelKit

> Cancel flow wizard for SaaS retention. When users try to cancel, show a multi-step flow (survey → retention offer → redirect).

Like Profitwell Retain, but for the rest of us.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** NextAuth.js v5 (GitHub + Google OAuth)
- **Styling:** TailwindCSS + Radix UI
- **Monorepo:** pnpm workspaces + Turborepo

## Packages

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js 14 application |
| `packages/db` | Drizzle ORM schema + client |
| `packages/widget` | Embeddable cancel flow widget (Sprint 2+) |
| `packages/config` | Shared TypeScript + ESLint config |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env vars
cp apps/web/.env.example apps/web/.env.local

# Run database migrations
pnpm db:migrate

# Start dev server
pnpm dev
```

## Database Schema

- **users** — OAuth users
- **flows** — Cancel flow configurations  
- **flow_steps** — Steps within a flow (survey / offer / redirect)
- **flow_events** — Analytics events (impression, step_completed, saved, cancelled)
- **subscriptions** — Stripe billing (free / pro / business)

## Sprints

- [x] 1.1 Monorepo Setup
- [x] 1.2 Database Schema
- [x] 1.3 App Shell
- [x] 1.4 Authentication (GitHub + Google OAuth)
- [ ] 2.1 Flow CRUD API
- [ ] 2.2 Step Builder UI
- [ ] 3.1 Widget Embed
- [ ] 3.2 Analytics
- [ ] 4.1 Stripe Billing
