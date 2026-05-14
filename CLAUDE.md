# CLAUDE.md — AgroConnect Master Project Document
# Ghana's Agricultural Network — Complete Build Reference
# Read this ENTIRE file before writing a single line of code.
# This is the single source of truth for every decision in this project.

---

## 0. WHO YOU ARE

You are a senior fullstack engineer building production-grade infrastructure
for Ghanaian agriculture. You write clean, typed, secure, tested, maintainable code.
You never cut corners. You never leave TODOs. You treat every file as if it will
be reviewed by a lead engineer at a tier-1 tech company.

---

## 1. WHAT YOU ARE BUILDING

**AgroConnect** — Ghana's three-sided agricultural operating system.
It connects agro-input dealers, farmers, and buyers across all agricultural
sectors (crops, livestock, poultry, fisheries) in all 16 regions of Ghana.

It is not a simple marketplace. It is the financial and logistical infrastructure
of Ghanaian agriculture — the platform through which inputs are bought, harvests
are pledged, produce is sold, payments settled via Mobile Money, and intelligence
(weather, prices, pest alerts) flows to every actor in the chain.

**Live domain:**   `agroconnect.com.gh`
**API domain:**    `api.agroconnect.com.gh`
**Tagline:**       "From seed to sale. Every farmer. Every region."
**Target market:** All 16 regions of Ghana — pilot in Eastern, Greater Accra, Ashanti

---

## 2. USER ROLES

```
FARMER (smallholder & commercial)
  - List produce for immediate sale or as harvest pledge
  - Buy inputs (cash or BNPL — Buy Now Pay Later)
  - Track orders, wallet, and pledge status
  - Receive weather alerts, market prices, pest advisories
  - Build GENE score for credit eligibility

AGRO-INPUT DEALER
  - List seeds, fertilizers, pesticides, vet drugs, equipment
  - Receive and manage orders
  - View demand forecasting for their region
  - Delivery management

BUYER (hotel, restaurant, processor, retailer, exporter)
  - Browse and purchase available produce
  - Reserve future harvests via Harvest Pledge
  - Set price alerts and demand preferences
  - Subscription-based enterprise account

CONSUMER (individual urban buyer)
  - Browse verified farm produce
  - Order direct from farms
  - Mobile-first experience

FIELD AGENT
  - Register farmers offline (cached, syncs on reconnect)
  - Verify farms with GPS + photos
  - Earn per verified farmer onboarded

SUPER ADMIN
  - Verify users and listings
  - Manage BNPL approvals and disputes
  - Platform analytics and broadcasts
  - Commission and fee configuration
```

---

## 3. MONOREPO STRUCTURE

```
agroconnect/
├── apps/
│   ├── web/                   Next.js 15 — Vercel
│   └── api/                   Fastify — Railway
├── packages/
│   ├── database/              Prisma schema + client
│   ├── types/                 Shared TypeScript interfaces
│   └── validators/            Shared Zod schemas
├── CLAUDE.md                  ← YOU ARE HERE
├── CLAUDE_WEB.md
├── CLAUDE_API.md
├── API_SPEC.md
├── ARCHITECTURE.md
├── schema.prisma
├── docker-compose.yml
├── .env.example
├── PHASE_PROMPTS.md
├── turbo.json
└── package.json
```

---

## 4. TECH STACK — LOCKED IN

### Frontend (apps/web)
```
Framework:    Next.js 15 App Router (React 19)
Language:     TypeScript 5.x strict
Styling:      Tailwind CSS v4
Forms:        react-hook-form + zod
Animation:    framer-motion + tw-animate-css
HTTP:         axios (auth interceptor)
Maps:         react-leaflet + OpenStreetMap (free)
Charts:       recharts
I18n:         next-intl (EN, Twi, Hausa, Ewe, Ga)
Auth:         @supabase/ssr (JWT management)
Storage:      Supabase Storage (farm/product photos)
PWA:          next-pwa (offline support, installable)
Hosting:      Vercel
```

### Backend (apps/api)
```
Framework:    Fastify 5.x
Language:     TypeScript 5.x strict
ORM:          Prisma 5.x
Database:     PostgreSQL 16 (Railway)
Cache/Queue:  Redis (Railway) + BullMQ
Auth:         Supabase JWT validation
Validation:   Zod
Logging:      Pino
Docs:         @fastify/swagger
Email:        Resend
SMS:          Arkesel (Ghana SMS + USSD gateway)
Weather:      Open-Meteo API (free, no key)
Payments:     Paystack (MoMo + cards)
Hosting:      Railway
```

---

## 5. DESIGN SYSTEM — FOREST GREEN + LIME + CREAM

AgroConnect uses the SAME core design system as CampusAid and HostelPal
(same product suite), with agriculture-specific extensions.

### 5.1 Core Palette (OKLCH — exact)

```css
:root {
  /* ─── Base tokens (same across all products) ─── */
  --background:            oklch(0.97 0.015 100);   /* warm cream */
  --foreground:            oklch(0.18 0.04 145);    /* forest dark */
  --card:                  oklch(1 0 0);            /* white */
  --card-foreground:       oklch(0.18 0.04 145);
  --popover:               oklch(1 0 0);
  --popover-foreground:    oklch(0.18 0.04 145);
  --primary:               oklch(0.28 0.07 145);    /* forest green */
  --primary-foreground:    oklch(0.98 0 0);
  --secondary:             oklch(0.96 0.03 100);
  --secondary-foreground:  oklch(0.28 0.07 145);
  --muted:                 oklch(0.94 0.02 100);
  --muted-foreground:      oklch(0.52 0.03 145);
  --accent:                oklch(0.88 0.22 120);    /* electric lime */
  --accent-foreground:     oklch(0.18 0.08 145);
  --destructive:           oklch(0.577 0.245 27.325);
  --destructive-foreground:oklch(0.985 0 0);
  --border:                oklch(0.90 0.02 100);
  --input:                 oklch(0.90 0.02 100);
  --ring:                  oklch(0.88 0.22 120);
  --radius:                1rem;

  --lime:                  oklch(0.88 0.22 120);
  --lime-dark:             oklch(0.78 0.20 120);
  --forest:                oklch(0.28 0.07 145);
  --forest-dark:           oklch(0.20 0.06 145);
  --cream:                 oklch(0.97 0.015 100);
  --cream-dark:            oklch(0.93 0.025 100);

  /* ─── AgroConnect sector colors ─── */
  --sector-crops:          oklch(0.35 0.12 145);    /* deep farm green */
  --sector-crops-bg:       oklch(0.94 0.04 145);
  --sector-livestock:      oklch(0.45 0.12 60);     /* warm brown-amber */
  --sector-livestock-bg:   oklch(0.95 0.04 60);
  --sector-poultry:        oklch(0.62 0.18 80);     /* golden amber */
  --sector-poultry-bg:     oklch(0.96 0.05 80);
  --sector-fisheries:      oklch(0.48 0.16 240);    /* ocean blue */
  --sector-fisheries-bg:   oklch(0.95 0.04 240);
  --sector-inputs:         oklch(0.42 0.16 300);    /* muted purple */
  --sector-inputs-bg:      oklch(0.95 0.03 300);

  /* ─── AgroConnect semantic tokens ─── */
  --harvest-gold:          oklch(0.75 0.18 80);     /* harvest pledge color */
  --harvest-gold-bg:       oklch(0.96 0.05 80);
  --pledge-active:         oklch(0.55 0.18 145);    /* active pledge */
  --score-high:            oklch(0.48 0.18 145);    /* score 80+ */
  --score-mid:             oklch(0.62 0.18 80);     /* score 50-79 */
  --score-low:             oklch(0.52 0.20 30);     /* score < 50 */
  --bnpl-available:        oklch(0.55 0.18 145);    /* BNPL eligible */
  --verified-blue:         oklch(0.55 0.18 250);    /* field-verified badge */
  --premium-green:         oklch(0.48 0.20 145);    /* premium verified */
}
```

### 5.2 Typography

```
Font primary:  Plus Jakarta Sans (Google Fonts) — all UI
Font display:  Playfair Display (Google Fonts) — listing titles, hero headlines
Font mono:     Geist Mono — prices, scores, codes, quantities

Weight scale:
  Display hero:  Playfair 800, tracking -0.03em
  H1:            Plus Jakarta 800, tracking -0.02em
  H2:            Plus Jakarta 700, tracking -0.01em
  H3:            Plus Jakarta 600
  Body:          Plus Jakarta 400, leading relaxed
  Price:         Geist Mono 700 (always mono for amounts)
  Quantity:      Geist Mono 500
  Badge/Label:   Plus Jakarta 600, uppercase, tracking 0.04em, text-xs

RULE: Listing titles (product names) use Playfair Display.
All UI chrome (buttons, labels, nav) uses Plus Jakarta Sans.
All monetary values and quantities use Geist Mono.
```

### 5.3 Sector Chip Design

```tsx
// Each sector has its own chip color
const SECTOR_CHIPS = {
  crops:     'bg-sector-crops-bg    text-sector-crops    border-sector-crops/20',
  livestock: 'bg-sector-livestock-bg text-sector-livestock border-sector-livestock/20',
  poultry:   'bg-sector-poultry-bg  text-sector-poultry  border-sector-poultry/20',
  fisheries: 'bg-sector-fisheries-bg text-sector-fisheries border-sector-fisheries/20',
  inputs:    'bg-sector-inputs-bg   text-sector-inputs   border-sector-inputs/20',
}
```

### 5.4 Verification Badge System

```
Unverified:        No badge
Self-Declared:     Lime pill "Self-Declared"    — user filled profile
Field-Verified:    Blue checkmark badge         — GENE agent visited farm
Premium Verified:  Green star badge             — lab-tested quality + certified
Top Seller:        Gold trophy badge            — top 10% by volume, 3 months
```

### 5.5 Design Rules

1. Product/listing titles: **Playfair Display** — makes produce feel premium
2. All prices: **Geist Mono** — `GHS 2.50/kg` format, never without currency prefix
3. Harvest Pledge cards: harvest-gold left border (4px) + gold chip
4. BNPL available indicator: lime badge "Pay at Harvest"
5. Sector always shown first on every listing card (chip, top-left)
6. Farm location always shown (region + district, with distance if relevant)
7. Outdoor readability: minimum 14px body text, high contrast
8. No emoji — all icons are PNG from nucleoapp.com or inline SVG
9. PWA installable — prompt users to add to home screen

---

## 6. AGRICULTURAL SECTORS & CATEGORIES

### Crops
**Cereals:** Maize, Rice, Sorghum, Millet, Wheat
**Legumes:** Cowpea, Soybean, Groundnut, Bambara Bean
**Tubers:** Cassava, Yam, Cocoyam, Sweet Potato, Irish Potato
**Vegetables:** Tomato, Pepper, Onion, Cabbage, Lettuce, Carrot, Cucumber, Okra, Garden Egg, Kontomire
**Fruits:** Mango, Pineapple, Banana, Plantain, Watermelon, Pawpaw, Avocado, Citrus, Coconut
**Cash Crops:** Cocoa, Coffee, Cashew, Rubber, Shea, Oil Palm
**Spices:** Ginger, Turmeric, Garlic, Prekese

### Livestock
Cattle (Beef, Dairy), Sheep, Goats, Pigs, Rabbits, Grasscutters, Snails

### Poultry
Broiler Chicken, Layer Chicken, Eggs, Turkey, Guinea Fowl, Ducks, Geese

### Fisheries
Tilapia, Catfish, Heteroclarias, Tuna, Sardine, Mackerel, Shrimp, Crab, Oyster, Crayfish

### Agro-Inputs
Seeds, NPK/Urea/Organic Fertilizer, Pesticides/Herbicides/Fungicides,
Veterinary drugs, Fish feed, Farm equipment (tractor hire, irrigation),
Packaging materials

---

## 7. GHANA REGIONS (all 16)

```typescript
export const GHANA_REGIONS = [
  { id: 1,  name: "Greater Accra",  code: "GA", zone: "southern" },
  { id: 2,  name: "Ashanti",        code: "AH", zone: "middle"   },
  { id: 3,  name: "Western",        code: "WE", zone: "southern" },
  { id: 4,  name: "Western North",  code: "WN", zone: "southern" },
  { id: 5,  name: "Eastern",        code: "ER", zone: "southern" },
  { id: 6,  name: "Central",        code: "CE", zone: "southern" },
  { id: 7,  name: "Volta",          code: "VO", zone: "southern" },
  { id: 8,  name: "Oti",            code: "OT", zone: "middle"   },
  { id: 9,  name: "Bono",           code: "BO", zone: "middle"   },
  { id: 10, name: "Bono East",      code: "BE", zone: "middle"   },
  { id: 11, name: "Ahafo",          code: "AF", zone: "middle"   },
  { id: 12, name: "Brong-Ahafo",    code: "BA", zone: "middle"   },
  { id: 13, name: "Northern",       code: "NO", zone: "northern" },
  { id: 14, name: "Savannah",       code: "SA", zone: "northern" },
  { id: 15, name: "North East",     code: "NE", zone: "northern" },
  { id: 16, name: "Upper East",     code: "UE", zone: "northern" },
  { id: 17, name: "Upper West",     code: "UW", zone: "northern" },
] as const
```

---

## 8. FARMER SCORE (AgroScore)

Proprietary score 0–110 (not 100 — intentional, visible max creates aspiration).

```typescript
interface AgroScoreComponents {
  profileCompleteness:    number  // 0–20: name, farm, GPS, photos, MoMo
  verificationLevel:      number  // 0–30: unverified=0, self=10, field=20, premium=30
  orderHistory:           number  // 0–20: completed orders / 10, capped
  repaymentHistory:       number  // 0–20: BNPL repaid/total (10 if no history)
  platformTenure:         number  // 0–10: months / 2, capped
  communityRating:        number  // 0–10: avg_rating / 5 * 10
}
// Total max: 110

// Credit tiers by score:
// Starter (score ≥ 20):     max GHS 500,  8% flat
// Grower (score ≥ 50):      max GHS 2,000, 6% flat
// Established (score ≥ 70): max GHS 10,000, 5% flat
// Commercial (score ≥ 90):  max GHS 50,000, 4% flat
```

---

## 9. HARVEST PLEDGE SYSTEM

The core differentiator. Buyers reserve unharvested produce in advance.

```
States:  open → partially_pledged → fully_pledged →
         harvested → dispatched → delivered → completed

Protection rules:
  Farmer fails to deliver:
    → 100% deposit returned to buyer
    → Farmer score -15 pts
    → Listing paused 14 days

  Buyer backs out after deposit:
    → 50% of deposit to farmer (preparation compensation)
    → 50% retained by AgroConnect
```

---

## 10. COMMISSION STRUCTURE

```typescript
export const COMMISSION_RATES = {
  direct_purchase:  0.030,  // 3.0%
  harvest_pledge:   0.025,  // 2.5% of pledged value
  input_purchase:   0.015,  // 1.5%
  input_bnpl:       0,      // earns via interest spread
} as const
```

---

## 11. PAYMENT METHODS

Via Paystack:
- MTN Mobile Money
- Vodafone Cash
- AirtelTigo Money
- Visa / Mastercard
- Bank transfer

Currency: GHS throughout. No foreign currency display.

---

## 12. USSD FLOW

Dial: `*800*456#` (shortcode — register with NCA Ghana)

```
Level 0: Welcome to AgroConnect
  1. List my produce
  2. Browse inputs
  3. My orders
  4. Market prices today
  5. Weather alert
  6. My wallet
  0. Exit

Level 1 - Market prices:
  → Select region → Select crop
  → "Tomato in Ashanti: GHS 2.50/kg (today). Up from GHS 2.10 last week."

Level 1 - Weather:
  → Auto-detects farmer's registered region
  → "Northern Region: Dry conditions next 7 days. Delay maize planting 1 week."
```

---

## 13. BACKGROUND JOBS (BullMQ)

```
send-order-sms           Arkesel SMS to buyer + seller on order creation
payment-verification     Poll Paystack for pending payments every 2 min
pledge-status-reminder   Weekly SMS to farmers to update pledge progress
score-recalculation      Nightly recalculate all farmer AgroScores
weather-alert-fetch      Every 6hr: Open-Meteo → regional alerts → SMS if critical
price-feed-update        Daily: update market_prices from Ghana Statistical Service feed
bnpl-due-reminders       SMS at 7, 3, 1 days before BNPL repayment due
listing-expiry           Auto-expire listings after 90 days of inactivity
digest-emails            Weekly email to buyers with new matching listings
```

---

## 14. ICONS & IMAGES

### Icon Sources
1. `https://nucleoapp.com/premium-icons`
2. `https://reactbits.dev/`
3. `https://uiarchives.com`

### Icon Inventory
```
public/icons/
├── nav/
│   ├── home.png, market.png, pledges.png, wallet.png, profile.png
├── sectors/
│   ├── crops.png, livestock.png, poultry.png, fisheries.png, inputs.png
├── badges/
│   ├── self-declared.png, field-verified.png, premium.png, top-seller.png
├── actions/
│   ├── list-produce.png, buy-inputs.png, pledge.png, pay-at-harvest.png
│   ├── weather.png, prices.png, pest-alert.png, wallet.png, withdraw.png
├── verification/
│   ├── verified-blue.png, verified-green.png, unverified.png
├── delivery/
│   ├── pickup.png, farmer-delivers.png, logistics.png
└── payment/
    ├── mtn-momo.png, vodafone-cash.png, airteltigo.png
    ├── visa.png, mastercard.png
```

### Photography
```
Farm/crops:       https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80&fit=crop
Ghana market:     https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop
Tomatoes farm:    https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80&fit=crop
Maize field:      https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=800&q=80&fit=crop
Fish market:      https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=800&q=80&fit=crop
Poultry farm:     https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80&fit=crop
Fertilizer bags:  https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop
Farmer portrait:  https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80&fit=crop
```

---

## 15. REALISTIC SEED DATA

```typescript
const SEED_LISTINGS = [
  {
    title: "Fresh Organic Tomatoes — Kumasi Farm",
    farmer: "Kwame Asante Boateng",
    sector: "crops", category: "tomato",
    region: "Ashanti", district: "Kumasi Metropolitan",
    quantity: 500, unit: "kg",
    price: 2.50, listingType: "available_now",
    farmingMethod: "organic",
  },
  {
    title: "2-Month Maize Harvest — 5 Tonnes Reserved",
    farmer: "Abena Owusu Mensah",
    sector: "crops", category: "maize",
    region: "Eastern", district: "Asuogyaman",
    quantity: 5000, unit: "kg",
    price: 1.80, listingType: "harvest_pledge",
    expectedHarvestDate: "2025-09-15",
    depositPercent: 20,
  },
  {
    title: "NPK 15-15-15 Fertilizer — 50kg Bags",
    dealer: "Agro Solutions Ltd",
    sector: "inputs", category: "fertilizer",
    region: "Greater Accra", district: "Accra Metropolitan",
    quantity: 200, unit: "bag (50kg)",
    price: 180.00, bnplAvailable: true,
  },
  {
    title: "Live Broiler Chickens — Farm Gate",
    farmer: "Emmanuel Tetteh",
    sector: "poultry", category: "broiler_chicken",
    region: "Eastern", district: "Lower Manya Krobo",
    quantity: 300, unit: "head",
    price: 35.00, listingType: "available_now",
  },
  {
    title: "Live Tilapia — Volta Lake Farm",
    farmer: "Yaw Darko Asante",
    sector: "fisheries", category: "tilapia",
    region: "Volta", district: "South Tongu",
    quantity: 800, unit: "kg",
    price: 22.00, listingType: "available_now",
  },
]
```

---

## 16. SECURITY — NON-NEGOTIABLE

1. Phone-based auth (OTP via Arkesel) — not email-primary
2. JWT validation on every API request (Supabase JWT + Fastify middleware)
3. Roles checked from DB — never trust JWT claims for authorization
4. Paystack webhook HMAC-SHA512 signature verification — mandatory
5. Payment idempotency — check paystack_reference before processing
6. BNPL: double-check eligibility server-side before approval
7. Wallet: all balance changes wrapped in DB transactions
8. Rate limiting: Redis-backed, per phone number + per IP
9. File uploads: validate MIME by magic bytes, max 5MB images
10. Ghana Data Protection Act 2012 compliance — no PII in logs
11. No `any` TypeScript, no unhandled promise rejections
12. Never expose service role key to client

---

## 17. ABSOLUTE DON'TS

1. No emoji in UI — use PNG icons
2. No hardcoded hex colors — OKLCH CSS variables only
3. No `any` TypeScript
4. No direct DB from frontend — all through Fastify API
5. No console.log in production — Pino logger only
6. No price without "GHS" prefix and Geist Mono font
7. No listing quantity without unit
8. No unverified farmer's contact details visible to unregistered users
9. No Paystack webhook processed without HMAC verification
10. No BNPL approved without server-side eligibility check

---

*Read CLAUDE_API.md for backend-specific build instructions.*
*Read CLAUDE_WEB.md for frontend-specific build instructions.*
*Read API_SPEC.md for all endpoint contracts.*
*Read schema.prisma for the complete database schema.*
