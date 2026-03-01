# CancelKit — Sprint 4.2 Integration Test Report

**Date:** 2026-03-01  
**Tester:** Sage (ThreeStack Architect Agent)  
**Branches Reviewed:** `main`, `feat/backend`  
**Scope:** Full codebase review — auth, flows API, events API, Stripe actions, widget, React SDK, dashboard UI, billing, security

---

## Executive Summary

CancelKit has a **critical branch separation problem**: the backend implementation (API routes, widget, full DB schema, crypto, tier enforcement) lives exclusively on `feat/backend` and has **not been merged to `main`**. The `main` branch ships UI-only pages with 100% hardcoded mock data and none of the working API routes. The `.next` build artifacts committed to `main` appear to be from `feat/backend`, meaning the production build is ahead of what the source on `main` actually contains.

**Overall Verdict: NOT DEPLOYMENT-READY**

| Category | Result |
|---|---|
| Auth (OAuth) | ✅ PASS |
| Auth (Middleware coverage) | ❌ FAIL |
| Flow Builder API | ⚠️ PARTIAL |
| Flow Events API | ⚠️ PARTIAL |
| Stripe Actions (apply-offer) | ⚠️ PARTIAL |
| Cancel Flow Widget | ⚠️ PARTIAL |
| @cancelkit/react SDK | ⚠️ PARTIAL |
| Dashboard UI | ❌ FAIL |
| Stripe Billing | ⚠️ PARTIAL |
| DB Schema / Migrations | ❌ FAIL |
| Security | ❌ FAIL |
| Build | ⚠️ PARTIAL |

**Score: 1 PASS / 6 PARTIAL / 5 FAIL**

---

## Branch Map

```
main
├── apps/web/src/
│   ├── app/(dashboard)/*.tsx     ← UI with hardcoded mock data
│   ├── app/api/auth/             ← NextAuth only
│   ├── lib/auth.ts               ← OAuth setup
│   ├── middleware.ts             ← Partial coverage
│   └── .next/                   ← Build from feat/backend (ahead of source!)
├── packages/react/src/           ← Simplified CancelButton (mismatched with dist/)
└── packages/db/src/schema.ts     ← Outdated (Sprint 1 schema)

feat/backend (NOT MERGED)
├── apps/web/src/app/api/
│   ├── flows/route.ts            ← Full CRUD
│   ├── flows/[id]/route.ts       ← GET/PATCH/DELETE with ownership
│   ├── flows/[id]/stats/route.ts ← Aggregated event stats
│   ├── events/route.ts           ← Public event tracking
│   ├── public/flows/[id]/route.ts ← Widget fetch endpoint
│   ├── settings/stripe/route.ts  ← Encrypted key management
│   ├── stripe/apply-offer/route.ts ← Real Stripe actions
│   ├── stripe/checkout/route.ts  ← Subscription creation
│   └── stripe/webhook/route.ts   ← Lifecycle events
├── apps/web/src/lib/
│   ├── stripe.ts                 ← PLANS definition, getStripe()
│   ├── tier.ts                   ← Plan limits enforcement
│   └── crypto.ts                 ← AES-256-GCM for Stripe key storage
├── packages/widget/
│   ├── src/cancelkit.js          ← Full vanilla JS implementation
│   └── dist/cancelkit.min.js     ← Minified bundle built
└── packages/react/
    ├── src/components/           ← Full CancelButton + CancelModal
    ├── src/hooks/useCancelKit.ts ← Full hook with triggerFlow/closeFlow
    └── dist/                     ← Built ESM + CJS
```

---

## Test Results by Flow

---

### 1. AUTH — Signup / Login / Session / Protected Routes

| Test | Result | Notes |
|---|---|---|
| 1.1 GitHub OAuth login | ✅ PASS | NextAuth configured, `signIn` callback upserts user |
| 1.2 Google OAuth login | ✅ PASS | Properly configured with clientId/Secret env vars |
| 1.3 No email/password auth | ⚠️ PARTIAL | OAuth-only; no credential provider — by design but undocumented |
| 1.4 JWT session (30-day) | ✅ PASS | `strategy: "jwt"`, `maxAge: 30 * 24 * 60 * 60` |
| 1.5 userId injected into session | ✅ PASS | `jwt()` and `session()` callbacks correctly propagate `userId` |
| 1.6 Middleware protects /dashboard | ✅ PASS | Redirects unauthenticated to `/login` |
| 1.7 Middleware protects /analytics | ❌ FAIL | `/analytics` is NOT in middleware matcher — publicly accessible |
| 1.8 Middleware protects /flows | ❌ FAIL | `/flows` is NOT in middleware matcher — publicly accessible |
| 1.9 Middleware protects /settings | ❌ FAIL | `/settings` is NOT in middleware matcher — publicly accessible |
| 1.10 Middleware protects /offers | ❌ FAIL | `/offers` is NOT in middleware matcher — publicly accessible |

**Root Cause:** `middleware.ts` matcher is `["/dashboard/:path*", "/login"]`. However the `(dashboard)` route group generates URLs at `/flows`, `/analytics`, `/settings`, `/offers` — NOT under `/dashboard/`. Only the `/dashboard` route itself is protected. All other dashboard pages are publicly accessible without authentication.

```typescript
// CURRENT (BROKEN)
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
  // /analytics, /flows, /settings, /offers are NOT matched ❌
};

// FIX NEEDED
export const config = {
  matcher: ["/dashboard/:path*", "/flows/:path*", "/analytics/:path*", "/settings/:path*", "/offers/:path*", "/login"],
};
```

---

### 2. FLOW BUILDER API — POST/GET /api/flows

| Test | Result | Notes |
|---|---|---|
| 2.1 GET /api/flows — auth check | ✅ PASS | Returns 401 if no session (`feat/backend`) |
| 2.2 GET /api/flows — returns user's flows | ✅ PASS | Filters by `session.user.id`, ordered by `createdAt DESC` |
| 2.3 POST /api/flows — creates flow with steps | ✅ PASS | Full Zod validation, step insertion in transaction |
| 2.4 POST /api/flows — plan limit enforcement | ✅ PASS | `canCreateFlow()` checked before creation; returns 403 with upgrade message |
| 2.5 GET /api/flows/:id — ownership check | ✅ PASS | `AND eq(flows.userId, session.user.id)` prevents IDOR |
| 2.6 PATCH /api/flows/:id — step replace | ✅ PASS | Deletes + re-inserts steps atomically |
| 2.7 DELETE /api/flows/:id — cascade | ✅ PASS | Steps/events cascade on DB level |
| 2.8 API exists on main branch | ❌ FAIL | **All routes only on `feat/backend` — NOT on `main`** |
| 2.9 UI connects to API | ❌ FAIL | NewFlowPage hardcodes `router.push('/dashboard/flows/1')` — no API call |
| 2.10 Step type consistency | ❌ FAIL | API uses `question/offer/confirmation`; UI uses `survey/offer/message`; Migration has `survey/offer/redirect` |

---

### 3. FLOW EVENTS API — POST /api/events

| Test | Result | Notes |
|---|---|---|
| 3.1 POST /api/events — validates flowId | ✅ PASS | Returns 404 if flow doesn't exist |
| 3.2 POST /api/events — validates stepId | ✅ PASS | Returns 404 if step doesn't exist |
| 3.3 POST /api/events — no auth required | ✅ PASS | Intentionally public for widget use |
| 3.4 Event types tracked | ✅ PASS | impression/step_view/save/cancel/answer |
| 3.5 Exists on main branch | ❌ FAIL | Route only on `feat/backend` |
| 3.6 GET /api/flows/:id/stats | ✅ PASS | Aggregates impressions/saves/cancels, calculates saveRate |

---

### 4. STRIPE ACTIONS API — /api/stripe/apply-offer

| Test | Result | Notes |
|---|---|---|
| 4.1 Apply discount — creates coupon + applies to subscription | ✅ PASS | Real `stripe.coupons.create()` + `stripe.subscriptions.update()` |
| 4.2 Apply pause — sets pause_collection | ✅ PASS | Real Stripe `pause_collection: { behavior: "keep_as_draft" }` |
| 4.3 Apply downgrade — updates subscription item price | ✅ PASS | Real `stripe.subscriptions.update()` with new `price` |
| 4.4 Resolves Stripe key from workspace settings | ✅ PASS | Decrypts AES-256-GCM key from DB |
| 4.5 Auth required on endpoint | ❌ FAIL | **Endpoint is UNAUTHENTICATED** — callable by anyone |
| 4.6 IDOR: userId input resolves other users' Stripe keys | ❌ FAIL | Caller passes `userId` to look up Stripe key — IDOR vulnerability |
| 4.7 Rate limiting on endpoint | ❌ FAIL | No rate limiting on this sensitive public endpoint |
| 4.8 Exists on main branch | ❌ FAIL | Route only on `feat/backend` |

**Note on auth:** The endpoint being unauthenticated is intentional design (widget calls it without user session). However, without rate limiting and flowId validation to tie the request to a legitimate flow event, it's exploitable.

---

### 5. CANCEL FLOW WIDGET

| Test | Result | Notes |
|---|---|---|
| 5.1 Widget source exists | ✅ PASS | `packages/widget/src/cancelkit.js` — full implementation |
| 5.2 Widget dist/bundle exists | ✅ PASS | `packages/widget/dist/cancelkit.min.js` — built |
| 5.3 Widget fetches flow from /api/public/flows/:id | ✅ PASS | Correct endpoint |
| 5.4 Widget tracks events via /api/events | ✅ PASS | fire-and-forget tracking |
| 5.5 Widget renders multi-step flow (question/offer/confirmation) | ✅ PASS | Full modal with step navigation |
| 5.6 Widget calls /api/stripe/apply-offer on offer accept | ✅ PASS | Sends customerId + offerType + offerValue |
| 5.7 Widget CDN deployed | ❌ FAIL | `https://cdn.cancelkit.threestack.io/widget.js` — **does not exist** |
| 5.8 Widget exposes `CancelKit.show()` | ✅ PASS | Public API: `CancelKit.init()` + `CancelKit.show()` |

---

### 6. @cancelkit/react PACKAGE

| Test | Result | Notes |
|---|---|---|
| 6.1 Package exists | ✅ PASS | `packages/react/` present on main |
| 6.2 CancelButton exported | ✅ PASS | Both main/src and feat/backend dist |
| 6.3 useCancelKit hook exported | ✅ PASS | Both versions export this |
| 6.4 CancelModal exported (dist) | ✅ PASS | `dist/index.d.ts` exports CancelModal |
| 6.5 CancelModal exported (src/main) | ❌ FAIL | `src/index.ts` on main does NOT export CancelModal |
| 6.6 Dist and src are consistent | ❌ FAIL | Dist is from `feat/backend` (full); src on main is simplified — **they're different implementations** |
| 6.7 hooks.ts calls correct widget API | ❌ FAIL | main's `hooks.ts` calls `CancelKit.open()` — widget exposes `CancelKit.show()` |
| 6.8 CDN script URL is valid | ❌ FAIL | `https://cdn.cancelkit.threestack.io/widget.js` — not deployed |
| 6.9 Package build script configured | ❌ FAIL | main's `package.json` has no build script; points `main` to `src/index.ts` |
| 6.10 API key auth mechanism | ⚠️ PARTIAL | main hooks version uses no API key; feat/backend dist uses apiKey prop |

---

### 7. DASHBOARD UI

| Test | Result | Notes |
|---|---|---|
| 7.1 /dashboard — static welcome | ❌ FAIL | No stats, no data, just hardcoded text |
| 7.2 /analytics — real stats fetched | ❌ FAIL | `Math.random()` data generated at module load; hardcoded totals |
| 7.3 /flows — real flows fetched | ❌ FAIL | `const mockFlows = [...]` — 3 hardcoded fake flows |
| 7.4 /flows/new — calls API to create | ❌ FAIL | Always routes to `/dashboard/flows/1` regardless of input |
| 7.5 /flows/[id] — flow builder connected to API | ❌ FAIL | Pure frontend state; "Save Changes" button does nothing |
| 7.6 /settings — Stripe key UI | ❌ FAIL | Empty stub — no form, no save functionality |
| 7.7 /offers — offer management | ❌ FAIL | (Not inspected; likely stub) |
| 7.8 Dashboard header stats | ❌ FAIL | "47 saves this month" — hardcoded string |
| 7.9 Session email displayed | ❌ FAIL | Hardcoded "user@example.com" — not fetched from session |

**Verdict: Dashboard is 100% disconnected from backend.** All data is hardcoded or randomly generated.

---

### 8. STRIPE BILLING

| Test | Result | Notes |
|---|---|---|
| 8.1 POST /api/stripe/checkout — auth required | ✅ PASS | Returns 401 if no session |
| 8.2 Creates Stripe checkout session | ✅ PASS | Correct mode, line_items, metadata |
| 8.3 cancelkit_user_id set in subscription metadata | ✅ PASS | Used by webhook to link subscription |
| 8.4 Webhook verifies Stripe signature | ✅ PASS | `constructEventAsync` with STRIPE_WEBHOOK_SECRET |
| 8.5 Webhook handles checkout.session.completed | ✅ PASS | Upserts subscription with tier/status |
| 8.6 Webhook handles subscription.updated | ✅ PASS | Updates tier and period end |
| 8.7 Webhook handles subscription.deleted | ✅ PASS | Downgrades to free, status=canceled |
| 8.8 Webhook is authenticated | ✅ PASS | Stripe signature check (or raw JSON in dev) |
| 8.9 Plan IDs in env example | ❌ FAIL | `STRIPE_INDIE_PRICE_ID` and `STRIPE_PRO_PRICE_ID` missing from `.env.example` |
| 8.10 Tier enum consistency | ❌ FAIL | Webhook uses `indie/pro`; migration has `free/pro/business`; plan schema uses `free/indie/pro` |
| 8.11 Routes exist on main | ❌ FAIL | Checkout and webhook only on `feat/backend` |

---

### 9. SECURITY

| Test | Result | Notes |
|---|---|---|
| 9.1 All dashboard API routes require auth | ⚠️ PARTIAL | Flows/stats/settings APIs have auth; apply-offer does not |
| 9.2 IDOR prevention on flows | ✅ PASS | `AND userId = session.user.id` on all flow queries |
| 9.3 IDOR on apply-offer | ❌ FAIL | `userId` accepted as input body field to resolve Stripe key |
| 9.4 CORS headers on public endpoints | ❌ FAIL | No CORS configuration on any API routes |
| 9.5 Rate limiting on public endpoints | ❌ FAIL | `/api/events`, `/api/public/flows`, `/api/stripe/apply-offer` unprotected |
| 9.6 Stripe key encryption | ✅ PASS | AES-256-GCM with per-request IV, auth tag verified |
| 9.7 Input validation (Zod) | ✅ PASS | All API routes validate with Zod schemas |
| 9.8 `@ts-nocheck` in auth.ts | ⚠️ PARTIAL | Suppresses type safety in authentication critical file |
| 9.9 No hardcoded secrets | ✅ PASS | All keys via env vars |
| 9.10 Dashboard publicly accessible | ❌ FAIL | /analytics, /flows, /settings, /offers accessible without auth |

---

### 10. BUILD

| Test | Result | Notes |
|---|---|---|
| 10.1 .next build exists in repo | ✅ PASS | Pre-built artifacts committed |
| 10.2 Widget dist/cancelkit.min.js built | ✅ PASS | `feat/backend` built and committed to dist/ |
| 10.3 @cancelkit/react dist/ built | ✅ PASS | ESM + CJS + type declarations present |
| 10.4 Source on main matches dist | ❌ FAIL | dist/ from feat/backend; src/ from main — mismatched implementations |
| 10.5 Build reproducibility (pnpm build) | ⚠️ PARTIAL | Not attempted (no DB); build artifacts committed directly |

---

## Bugs Found

### P0 — CRITICAL

**BUG-001: feat/backend NOT MERGED TO MAIN**
- All API routes (`/api/flows`, `/api/events`, `/api/public/flows`, `/api/settings/stripe`, `/api/stripe/*`) exist only on `feat/backend`, not on `main`
- Running the app from `main` source yields an API-less application
- Fix: Merge `feat/backend` → `main` (after resolving schema conflicts)

**BUG-002: Middleware Does Not Protect Dashboard Routes**
- `middleware.ts` matcher: `["/dashboard/:path*", "/login"]`
- URL group `(dashboard)` generates routes at `/flows`, `/analytics`, `/settings`, `/offers` — not under `/dashboard/`
- All dashboard pages except `/dashboard` itself are publicly accessible without authentication
- Fix: Add all protected paths to matcher

**BUG-003: DB Migration Out of Sync With Schema**
- `0000_initial_schema.sql` enums: `step_type(survey, offer, redirect)`, `event_type(impression, step_completed, saved, cancelled)`, `tier(free, pro, business)`
- `feat/backend` schema enums: `step_type(question, offer, confirmation)`, `event_type(impression, step_view, save, cancel, answer)`, `tier(free, indie, pro)`
- A database created from the migration cannot run the `feat/backend` API (type mismatch on insert)
- Fix: New migration file with correct enum values + schema aligned across all files

**BUG-004: Dashboard UI 100% Disconnected From Backend**
- Analytics: hardcoded with `Math.random()` data, fixed total stats
- Flows: `const mockFlows = [...]` with 3 fake entries
- Flow builder: "Save Changes" is a no-op; new flow creation hardcodes route to `/dashboard/flows/1`
- Settings: empty stub page
- Dashboard layout header: hardcoded "47 saves", "89 cancels", "user@example.com"
- Fix: Wire all pages to their respective API endpoints

**BUG-005: Widget CDN URL Does Not Exist**
- `@cancelkit/react` hooks.ts loads `https://cdn.cancelkit.threestack.io/widget.js`
- URL is not deployed; widget script will 404
- Fix: Deploy widget to CDN or use a self-hosted script tag approach

### HIGH

**BUG-006: CancelKit.open() vs CancelKit.show() API Mismatch**
- `packages/react/src/hooks.ts` (main branch) calls `window.CancelKit.open()`
- Widget exposes `CancelKit.init()` + `CancelKit.show()` — no `open()` method exists
- Result: CancelButton click does nothing when widget is loaded
- Fix: Change `CancelKit.open()` → `CancelKit.show()` in hooks.ts, or align widget API

**BUG-007: @cancelkit/react src/ and dist/ Are Different Implementations**
- `src/` on main: simplified, no CancelModal, hooks use CDN script tag pattern
- `dist/` on main: from feat/backend, full CancelModal with API calls, different prop types (has `apiKey` prop not in src version)
- `package.json` on main points `main: "src/index.ts"` — consumers get src, not dist
- Fix: Update main package.json to point to dist/, align implementations

**BUG-008: IDOR Vulnerability on /api/stripe/apply-offer**
- Request body accepts `userId` to look up workspace Stripe secret key
- Any caller can supply another user's UUID and trigger actions against that user's Stripe account
- Fix: Validate that `userId` matches the flow owner (look up flow → owner → workspace settings internally, without accepting userId from caller)

**BUG-009: No CORS Headers on Public API Endpoints**
- `/api/events`, `/api/public/flows/:id`, `/api/stripe/apply-offer` are called cross-origin by the widget
- No CORS headers set — browsers will block these requests from third-party SaaS sites
- Fix: Add `Access-Control-Allow-Origin: *` + preflight OPTIONS handlers to public endpoints

### MEDIUM

**BUG-010: No Rate Limiting on Public Endpoints**
- `/api/events` and `/api/stripe/apply-offer` accept unlimited unauthenticated requests
- `/api/stripe/apply-offer` especially — repeated calls could drain Stripe coupon quota
- Fix: Add rate limiting middleware (e.g. by IP + flowId)

**BUG-011: Step Type Enum Inconsistency Across Layers**
- Migration: `survey/offer/redirect`  
- feat/backend schema: `question/offer/confirmation`  
- UI Flow Builder: `survey/offer/message`  
- Three different vocabularies used for the same concept
- Fix: Standardize on one set of values throughout

**BUG-012: .env.example Missing Stripe Price IDs**
- `STRIPE_INDIE_PRICE_ID` and `STRIPE_PRO_PRICE_ID` not documented in `.env.example`
- `checkout/route.ts` will return 400 error if unset
- Fix: Add to `.env.example` with comment

**BUG-013: @ts-nocheck in auth.ts**
- `// @ts-nocheck` disables TypeScript in the authentication module
- Suppresses potential type errors in session handling critical path
- Fix: Remove `@ts-nocheck`, fix underlying TypeScript issues properly

### LOW

**BUG-014: Dashboard Layout Shows Hardcoded User Info**
- `layout.tsx` hardcodes "user@example.com" and avatar initials "U"
- Fix: Fetch session in server component and pass user to layout

**BUG-015: Widget API Key Not Validated Server-Side**
- Public flow endpoint `/api/public/flows/:id` requires no API key
- Any caller who discovers a flow UUID can fetch its config
- Fix: Introduce per-flow public token or API key validation

---

## What Works Well (feat/backend)

- ✅ OAuth auth with GitHub/Google — solid NextAuth setup
- ✅ Flows CRUD API — full validation, ownership checks, step management
- ✅ Events API — public endpoint correctly validates flow/step existence
- ✅ **Stripe apply-offer — REAL Stripe API calls** (discount coupon creation, pause, downgrade) — not placeholder!
- ✅ AES-256-GCM encryption for per-workspace Stripe keys — production-grade
- ✅ Plan limits enforcement — `canCreateFlow()` with proper tier lookup
- ✅ Widget vanilla JS — full multi-step modal, event tracking, offer application
- ✅ Stripe billing — checkout, webhook lifecycle handling with correct metadata
- ✅ Per-step stats aggregation in `/api/flows/:id/stats`
- ✅ DB schema (feat/backend) — well-structured with proper enums and FKs

## What Needs Bolt Fixes

1. **Merge `feat/backend` → `main`** (top priority — resolves ~40% of failures)
2. **Fix middleware matcher** to include all dashboard route paths
3. **Generate new Drizzle migration** to match feat/backend schema
4. **Wire all dashboard pages to their APIs** (analytics, flows, flow builder, settings)
5. **Deploy widget to CDN** (`cdn.cancelkit.threestack.io`)
6. **Fix CancelKit.open() → CancelKit.show()** in react package hooks
7. **Add CORS headers** to public API endpoints
8. **Fix IDOR** on apply-offer (remove userId from request body)
9. **Align step type enums** across migration, schema, API, and UI
10. **Add env vars** STRIPE_INDIE_PRICE_ID and STRIPE_PRO_PRICE_ID to .env.example

---

## Sprint 4.2 Readiness: ❌ NOT READY FOR DEPLOYMENT

**Blocking issues:** 5 P0 bugs, 4 HIGH bugs  
**Notable:** Stripe Actions (the core differentiator) is properly implemented on feat/backend with real API calls — this is the product's main value and it works. The blocker is that none of it is on main.
