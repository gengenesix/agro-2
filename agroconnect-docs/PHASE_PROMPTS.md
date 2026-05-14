# PHASE_PROMPTS.md — AgroConnect Claude Code Re-Entry Prompts
# Use the exact prompt for the phase you're resuming.
# Paste the ENTIRE prompt as your first message in a new Claude Code session.

---

## PHASE 0 — MONOREPO INIT
```
You are building AgroConnect — Ghana's agricultural marketplace platform.
Read CLAUDE.md, CLAUDE_API.md, and CLAUDE_WEB.md completely before touching any file.

Initialize Turborepo monorepo:
1. npx create-turbo@latest . --package-manager pnpm
2. Create workspace structure:
   apps/web (Next.js 15), apps/api (Fastify), packages/database, packages/types, packages/validators
3. Create root package.json and turbo.json from CLAUDE.md
4. Create pnpm-workspace.yaml
5. Set up packages/database:
   - Copy schema.prisma from project root
   - pnpm add -D prisma && pnpm add @prisma/client
6. Run: docker compose up -d (start Postgres + Redis)
7. Run: pnpm --filter database run migrate
8. Bootstrap apps/api with ALL dependencies from CLAUDE_API.md
9. Bootstrap apps/web with Next.js 15
10. Copy .env.example → apps/api/.env and apps/web/.env.local, fill Docker URLs
11. Verify: pnpm dev (both apps start without errors)

Do not start writing application code until pnpm dev works cleanly.
```

---

## PHASE 1 — BACKEND FOUNDATION
```
AgroConnect backend. Read CLAUDE.md + CLAUDE_API.md completely first.
Monorepo initialized. Docker running. Prisma migrated.

Build in this exact order:
Step 1: src/config/env.ts — Zod validation (CRASH if any var missing)
Step 2: src/config/database.ts (Prisma singleton)
Step 3: src/config/redis.ts (ioredis)
Step 4: src/config/supabase.ts (admin client for JWT verify + user creation)
Step 5: src/config/logger.ts (Pino)
Step 6: src/app.ts (Fastify factory + all plugins registered)
Step 7: src/server.ts (binds to PORT from env)
Step 8: All plugins: cors, helmet, swagger, authenticate, rateLimit

AUTHENTICATION PLUGIN REQUIREMENTS:
- Attach user to request.user on every request
- Get role from DB (NOT from JWT claims)
- Return null (not throw) if no token present
- Use cache.get() to avoid DB hit on every request (60s TTL)
- Banned users get 403 immediately

Verify: GET /health returns { status: "ok", timestamp, version }
Do not proceed until health check passes.
```

---

## PHASE 2 — AUTH + USERS MODULE
```
AgroConnect backend — auth and users modules.
Read CLAUDE_API.md Section 3 (auth service) and Section 4 (AgroScore).

Auth module (src/modules/auth/):
  POST /auth/request-otp:
    - Validate Ghana phone format (+233 or 0XX)
    - Generate 6-digit OTP
    - Store in Redis with 600s TTL (key: otp:{phone})
    - Send via Arkesel SMS (src/lib/arkesel.ts)
    - Rate limit: 3 OTP requests per phone per 10min

  POST /auth/verify-otp:
    - Validate OTP from Redis
    - Delete OTP after successful verify
    - Find or create Supabase Auth user
    - Find or create Prisma Profile
    - Create Wallet if new user
    - Return { profile, session, isNewUser }

  GET /auth/me: return full profile + role-specific profile (farmer/dealer/buyer)

Users module:
  - PATCH /me: update language, region, district, community, fullName
  - POST /me/avatar: Supabase Storage upload → update avatarUrl
  - POST /me/farmer: create FarmerProfile if not exists
  - GET /me/farmer/score: recalculateAgroScore() + return breakdown

Implement src/lib/arkesel.ts (SMS send via Arkesel REST API).
Implement src/lib/score.ts (AgroScore calculation — reference CLAUDE_API.md Section 4).
```

---

## PHASE 3 — LISTINGS MODULE
```
AgroConnect backend — listings module.
Read API_SPEC.md (LISTINGS section) and CLAUDE_API.md Section 5.

Listings module handles both produce (farmer) and inputs (dealer).

Key implementation requirements:
1. searchListings() — reference CLAUDE_API.md Section 5 exactly
   - Redis cache 180s TTL on list results
   - Key: listings:search:{JSON.stringify(filters)}
   - Invalidate on create/update/delete

2. getListing() — increment viewsCount fire-and-forget
   - Redis cache 300s TTL on detail: listing:{slug}

3. createListing() — validate seller owns the role (farmer=produce, dealer=inputs)
   - Generate unique slug from title
   - Validate categoryId matches seller's role

4. Photo upload → Supabase Storage → photos[] array updated

5. Map endpoint GET /listings/map:
   - Return only: id, slug, gpsLat, gpsLng, title, pricePerUnit, sector
   - No pagination (all active listings with GPS)
   - Cache 300s

6. After CRUD: pnpm --filter api typecheck — zero errors required
```

---

## PHASE 4 — PLEDGES, ORDERS, PAYMENTS
```
AgroConnect backend — pledges, orders, payments.
Read CLAUDE_API.md sections 6 (pledges), 7 (payments) and ARCHITECTURE.md section 2.

Pledges module (src/modules/pledges/):
  - acceptPledge(): reference CLAUDE_API.md Section 6 exactly
    Uses DB transaction: create order + update listing quantity + pledgeStatus
  - updatePledgeProgress(): update + SMS buyer via Arkesel
  - Pledge dispute handling (farmer fail → full refund + score penalty)

Orders module (src/modules/orders/):
  - createOrder(): validate listing active + quantity available
    For pledges: → call acceptPledge() → return deposit authorizationUrl
  - updateStatus(): seller updates tracking status
  - confirmDelivery(): buyer confirms → release escrow to seller wallet
  - dispute(): create dispute notification for admin

Payments module (src/modules/payments/):
  - initializePayment(): Paystack init → reference CLAUDE_API.md Section 7
  - handleWebhook(): HMAC-SHA512 verify → idempotency check → DB transaction
    → payment success + escrow hold + SMS to both parties
  - walletWithdraw(): Paystack transfer to MoMo → wallet debit

CRITICAL: Webhook handler MUST verify HMAC signature before any processing.
CRITICAL: All wallet balance changes MUST be wrapped in DB transactions.
```

---

## PHASE 5 — BNPL + INTELLIGENCE
```
AgroConnect backend — BNPL financing + intelligence layer.

BNPL module (src/modules/bnpl/):
  GET /bnpl/eligibility:
    → recalculateAgroScore() → getBNPLTier() → return eligibility
    → Cache result 5 minutes per user
  POST /bnpl/apply:
    → Re-check eligibility SERVER-SIDE (never trust client)
    → Check no active defaults (status: disbursed or defaulted)
    → Create BNPLApplication (status: pending)
    → Queue admin notification
  POST /bnpl/repay:
    → Update BNPLApplication + create BNPLRepayment
    → If fully repaid: status = repaid → recalculate score

Intelligence module (src/modules/intelligence/):
  GET /weather/:districtId:
    → Find district center lat/lng from DB
    → Call Open-Meteo (reference CLAUDE_API.md Section 8)
    → Cache 3hr in Redis
    → Return forecast + assessFarmingConditions() result

  GET /prices/:categorySlug:
    → Query MarketPrice table with filters
    → Calculate price trend vs previous period
    → Return chart-ready data

  POST /pest-report: create PestReport + notify admin

Implement src/lib/open-meteo.ts (reference CLAUDE_API.md Section 8).
```

---

## PHASE 6 — WORKERS + ADMIN + USSD
```
AgroConnect backend — background workers, admin, USSD.

BullMQ Workers (src/workers/):
  - sms.worker.ts: process Arkesel SMS jobs (concurrency: 10)
  - email.worker.ts: process Resend email jobs (concurrency: 5)
  - score.worker.ts: nightly recalc all farmer scores (batch of 100)
  - weather.worker.ts: every 6hr fetch all districts → create alerts → SMS farmers
  - payment.worker.ts: poll Paystack for pending payments every 2 min
  - listing.worker.ts: daily expire stale listings (>90 days, status → expired)

Admin module (src/modules/admin/):
  - All endpoints require role: admin (middleware check)
  - Broadcast: reference CLAUDE_API.md Section 11
  - BNPL approve/reject queue
  - User verification level update
  - Platform stats: GMV, MAU, BNPL portfolio, pledge fulfillment rate

USSD module (src/modules/ussd/):
  - POST /ussd/session: Arkesel USSD webhook
  - Reference CLAUDE_API.md Section 9 for full implementation
  - Session state stored in Redis (5-min TTL)
  - Menu: produce list, market prices, weather, wallet

Seed: run pnpm --filter api run seed (regions, districts, categories, units)
Tests: pnpm --filter api run test (score.test.ts + payments.test.ts)
Dockerfile + railway.toml
pnpm --filter api run build — zero TypeScript errors
```

---

## PHASE 7 — FRONTEND FOUNDATION + AUTH
```
AgroConnect frontend. Read CLAUDE.md + CLAUDE_WEB.md completely first.
Backend API is running at http://localhost:4000.

Step 1: globals.css — reference CLAUDE_WEB.md Section 2 EXACTLY
  - Base tokens (forest/lime/cream)
  - Sector tokens (crops/livestock/poultry/fisheries/inputs)
  - harvest-gold, verified-blue tokens

Step 2: app/layout.tsx — Plus Jakarta Sans + Playfair Display + Geist Mono
  Reference CLAUDE_WEB.md Section 3. Three fonts loaded simultaneously.

Step 3: middleware.ts — protect (farmer), (dealer), (buyer), (admin) routes
Step 4: lib/api.ts — axios with JWT auth interceptor + token refresh
Step 5: lib/format.ts — formatGHS, formatQuantity, formatDate, formatPhoneGhana

Step 6: context/auth-context.tsx

Step 7: (auth)/layout.tsx — forest/cream split panel
  Left: forest bg, AgroConnect logo, Ghana agriculture imagery, stats
  Right: form area on cream background

Step 8: (auth)/login/page.tsx — OTP flow (reference CLAUDE_WEB.md Section 10)
  - Phone input with +233 prefix
  - OTP input (6-digit, font-mono, large tracking)
  - No email/password — phones only

Step 9: (auth)/onboarding/* — role selection + farmer/dealer/buyer profile forms
  - Role selection: large card grid (Farmer, Dealer, Buyer, Consumer)
  - Farmer form: farm name, size, GPS, sectors, MoMo number
  - Dealer form: business name, location, sectors served
  - Buyer form: organization, type, delivery address

After login works end-to-end: proceed to Phase 8.
```

---

## PHASE 8 — MARKETPLACE + INTELLIGENCE
```
AgroConnect frontend — public marketplace + intelligence pages.

Shared components (src/components/shared/):
  - Icon (PNG wrapper, draggable=false, explicit width/height)
  - SectorChip (5 colors — reference CLAUDE_WEB.md Section 5 exactly)
  - VerificationBadge (4 levels: unverified/self/field/premium)
  - AgroScoreBar (0-110, animated, 3 color states — reference Section 6)
  - PriceDisplay (GHS + Geist Mono — reference Section 7)
  - EmptyState

Listing components:
  - ListingCard — reference CLAUDE_WEB.md Section 4 EXACTLY
    Playfair Display for listing title (font-display class)
    SectorChip always top-left of photo
    PriceDisplay always Geist Mono
    Pledge cards get harvest-gold left border
  - PledgeCard (harvest_pledge variant)
  - InputCard (dealer listing variant)

Pages:
  (market)/page.tsx — landing
    - Hero: forest bg, search bar, Ghana farming imagery
    - Sector browse (6 sector cards with PNG icons + counts)
    - Featured listings (3 cards)
    - Map overview (Leaflet, all active listings with GPS)
    - Market prices teaser (top 5 prices today)

  (market)/produce/page.tsx — full browse
    - Filters: sector, category, region, price range, listing type
    - Toggle: grid view / map view (Leaflet)
    - ListingCard grid (1/2/3/4 col responsive)

  (market)/produce/[slug]/page.tsx — listing detail
    - Photo gallery (lightbox)
    - Playfair Display title
    - Seller card (AgroScoreBar + verification badge)
    - Order form / Pledge form
    - Farmer profile + reviews

  (farmer)/intelligence/page.tsx
    - WeatherCard (reference CLAUDE_WEB.md Section 8)
    - Price charts (Recharts line chart, 30-day trend)
    - Pest alerts list
    - Advisory cards by crop type
```

---

## PHASE 9 — DASHBOARDS + ADMIN
```
AgroConnect frontend — role dashboards + admin panel.

Farmer dashboard (src/app/(farmer)/):
  - layout.tsx: farmer sidebar + mobile bottom nav
  - dashboard/page.tsx:
    - AgroScoreBar (large, animated)
    - BNPL tier + available credit
    - WalletCard (reference CLAUDE_WEB.md Section 9)
    - Active listings + pledges summary
    - Weather widget for farmer's region
  - listings/ — CRUD + photo upload
  - wallet/ — full wallet page + withdraw modal
  - bnpl/ — eligibility check + apply + repayment history

Dealer dashboard (src/app/(dealer)/):
  - dashboard, listings, orders, demand analytics

Buyer dashboard (src/app/(buyer)/):
  - dashboard, active orders, active pledges, price alerts settings

Admin panel (src/app/(admin)/):
  - layout.tsx: dark forest sidebar (bg-forest, text-white)
  - dashboard: GMV chart + MAU + BNPL portfolio + pledge fulfillment
  - users: verification queue (set level: field_verified / premium)
  - listings: flag/remove listings
  - bnpl: approve/reject queue
  - disputes: resolution center
  - broadcast: send SMS+push with role/region filter

Final steps:
  - Skeleton states for ALL data-fetching pages
  - Empty states for ALL list pages
  - Error boundaries (error.tsx in each route group)
  - PWA manifest (app/manifest.ts) — installable on Android
  - next-intl setup (English default, Twi/Hausa/Ewe/Ga stubs)
  - OG metadata for listing pages (WhatsApp card sharing)
  - pnpm build — zero TypeScript errors — MANDATORY before declaring done
```

---

## EMERGENCY PROMPT
```
STOP. Do not write any more code.

Read these files in this order:
1. CLAUDE.md (root) — complete
2. CLAUDE_API.md — if working on backend
3. CLAUDE_WEB.md — if working on frontend

Then answer:
1. Which phase are you on?
2. Which step within that phase?
3. Last file you successfully created/modified?
4. Exact error or blocker?

Do not guess. Read the documents. Then continue.
```
