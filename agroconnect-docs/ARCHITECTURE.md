# ARCHITECTURE.md — AgroConnect System Architecture

---

## 1. FULL SYSTEM DIAGRAM

```
                    AGROCONNECT PLATFORM
                    agroconnect.com.gh

┌─────────────────────────────────────────────────────────────────┐
│              CLIENT LAYER                                       │
│                                                                 │
│  Web PWA (Next.js)    USSD (*800*456#)    Field Agent App      │
│  Vercel Edge CDN      Arkesel Gateway     (Phase 2 - offline)  │
└──────────────────┬────────────────┬───────────────┬────────────┘
                   │ HTTPS          │ USSD webhook  │
                   ▼                ▼               ▼
┌──────────────────────────────────────────────────────────────────┐
│              RAILWAY PRIVATE NETWORK                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Fastify API + BullMQ Workers (apps/api)                 │   │
│  │                                                          │   │
│  │  Modules: auth, users, listings, pledges, orders,        │   │
│  │  payments, wallet, bnpl, intelligence, reviews,          │   │
│  │  notifications, ussd, admin                              │   │
│  │                                                          │   │
│  │  Workers: sms, email, payment-verify, score-recalc,      │   │
│  │  weather-fetch, price-update, listing-expiry             │   │
│  └───────────────┬──────────────────────────────────────────┘   │
│                  │                                               │
│     ┌────────────┼──────────────────┐                           │
│     ▼            ▼                  ▼                           │
│  ┌──────┐    ┌────────┐    ┌──────────────────┐                 │
│  │  PG  │    │ Redis  │    │   BullMQ Queues   │                 │
│  │Prisma│    │ Cache  │    │  sms / email /    │                 │
│  │  DB  │    │Rate Lim│    │  score / weather  │                 │
│  └──────┘    └────────┘    └──────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
                  │
    ┌─────────────┼──────────────────────────┐
    ▼             ▼                          ▼
┌──────────┐ ┌────────────────┐  ┌───────────────────────┐
│ Supabase │ │    Paystack    │  │  External Data APIs   │
│  Auth    │ │ MoMo + Cards  │  │  Open-Meteo (weather) │
│  Storage │ │   GHS only    │  │  Ghana Stat Service   │
└──────────┘ └────────────────┘  │  Arkesel (SMS/USSD)  │
                                 └───────────────────────┘
```

---

## 2. KEY DATA FLOWS

### OTP Login Flow
```
User enters Ghana phone → POST /auth/request-otp
  → Arkesel sends 6-digit SMS OTP
  → OTP stored in Redis with 10-min TTL
User enters OTP → POST /auth/verify-otp
  → Redis validates OTP
  → Supabase creates/finds user
  → Prisma creates Profile + Wallet if new
  → JWT returned
  → Frontend routes to onboarding (new) or dashboard (existing)
```

### Harvest Pledge Flow
```
Farmer creates pledge listing (status: available_now harvest_pledge)
Buyer browses pledges → selects quantity
POST /orders → server creates pending order, calculates deposit
POST /payments/initialize → Paystack init → authorizationUrl returned
Buyer pays deposit on Paystack → webhook fires
  → HMAC verified → idempotency check → DB transaction:
     1. Payment status → success
     2. Wallet escrow_hold for seller
     3. Order status → confirmed
     4. Listing quantity reduced
SMS sent to farmer + buyer
Farmer updates progress weekly (planted → growing → etc.)
  → SMS sent to buyer on each update
Buyer confirms delivery → escrow released to farmer wallet
Farmer withdraws to MoMo
```

### AgroScore Recalculation Flow
```
BullMQ nightly job: score-recalculation
  → Fetch all farmer profile IDs
  → For each: recalculateAgroScore() in src/lib/score.ts
  → Update profiles.agroScore
  → Check if BNPL tier upgraded → SMS farmer if yes
  → Total time target: < 10 minutes for 50,000 farmers
```

### Weather Alert Flow
```
BullMQ job every 6hr: weather-alert-fetch
  → For each district (center lat/lng):
    → GET Open-Meteo forecast (free API)
    → assessFarmingConditions()
    → If severity >= warning:
      → Create WeatherAlert record
      → Find all farmers in district
      → Queue SMS job per farmer (Arkesel bulk send)
  → Farmers receive SMS + in-app notification
```

---

## 3. BNPL FLOW

```
Farmer browses input listing
Sees "Pay at Harvest" badge
Clicks → GET /bnpl/eligibility
  → Returns: { eligible: true, tier: 'grower', maxAmount: 2000, interestRate: 0.06 }

Farmer applies → POST /bnpl/apply { orderId, amountRequested }
Server:
  1. Re-check eligibility (server-side, not client)
  2. Check no active defaults on account
  3. Create BNPLApplication (status: pending)
  4. Queue admin notification for review
  5. Return { status: pending, message: "Under review. Response within 24 hours." }

Admin reviews → PATCH /admin/bnpl/:id/approve { amountApproved, dueDate }
  → BNPLApplication.status = approved
  → AgroConnect pays dealer directly (via wallet debit + dealer credit)
  → Farmer receives inputs
  → SMS to farmer: "GHS 1,800 credit approved. Repay by Oct 31."

Farmer sells produce through AgroConnect
  → On order completion, BullMQ checks for active BNPL
  → Auto-deducts repayment from sale proceeds before wallet credit
  → BNPLApplication.status = repaid
  → AgroScore repaymentHistory component updated nightly
```

---

## 4. HOSTING & COST

```
Service          Host          Cost/month
─────────────────────────────────────────
Next.js Web      Vercel        $0 (hobby)
Fastify API      Railway       $5 (hobby)
PostgreSQL        Railway       $0 (included)
Redis            Railway       $0 (included)
Supabase Auth    Supabase      $0 (free tier)
Supabase Storage Supabase      $0 (up to 1GB)
Open-Meteo       —             $0 (free API)
Arkesel SMS      Arkesel       ~$10 (pay per SMS, Ghana rates)
Resend Email     Resend        $0 (3k/mo free)
Domain (.com.gh) Namecheap     ~$1/mo
─────────────────────────────────────────
Total fixed                   ~$16/month

Revenue model:
  3%    on every direct produce sale
  2.5%  on harvest pledge value
  1.5%  on input purchases
  4-8%  interest spread on BNPL
  GHS 300/mo  buyer enterprise subscriptions
  GHS 100/mo  dealer subscriptions
```

---

## 5. KEY DECISIONS

| Decision | Choice | Why |
|---|---|---|
| Auth method | Phone OTP (not email) | Farmers have phones, not email |
| SMS gateway | Arkesel | Ghana-specific, USSD support, reliable |
| Weather | Open-Meteo | Free, no key, 7-day accuracy good enough |
| Maps | Leaflet + OSM | Free, no API key, fully offline-capable |
| OTP storage | Redis TTL | Fast, auto-expires, no DB writes |
| Score recalc | Nightly BullMQ job | Predictable, not real-time needed |
| Font | Plus Jakarta + Playfair | Playfair makes produce feel premium |
| Pledge protection | DB transaction + escrow | ACID guarantees for money |
| USSD | Arkesel gateway | Reaches feature phone farmers |
| BNPL approval | Manual admin | Fraud prevention until ML model ready |
| Price data | Manual import initially | Ghana Stat Service API is inconsistent |
