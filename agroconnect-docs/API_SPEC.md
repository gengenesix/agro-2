# API_SPEC.md — AgroConnect REST API
# All endpoints. Base URL: https://api.agroconnect.com.gh/api/v1

---

## AUTH `/api/v1/auth`
POST   /request-otp         { phone } → sends Arkesel SMS (no auth)
POST   /verify-otp          { phone, otp } → { profile, session, isNewUser }
POST   /refresh             { refreshToken }
POST   /logout              [auth]
GET    /me                  [auth] → full profile + role-specific profile

---

## USERS `/api/v1/users`
GET    /me                  [auth] full profile
PATCH  /me                  [auth] { fullName, language, regionId, districtId, community }
POST   /me/avatar           [auth] multipart → { avatarUrl }
GET    /:id                 public profile (limited fields)
GET    /farmers/:id         public farmer profile + stats
GET    /dealers/nearby      ?lat=&lng=&radiusKm= → nearby input dealers

## FARMER PROFILE
POST   /me/farmer           [auth, farmer] complete farmer profile
PATCH  /me/farmer           [auth, farmer] update farm details
POST   /me/farmer/photos    [auth, farmer] upload farm photos (max 10)
GET    /me/farmer/score     [auth, farmer] AgroScore breakdown + improvement tips

## DEALER PROFILE
POST   /me/dealer           [auth, dealer] complete dealer profile
PATCH  /me/dealer           [auth, dealer]

## BUYER PROFILE
POST   /me/buyer            [auth, buyer] complete buyer profile

---

## LISTINGS `/api/v1/listings`

### Public
GET    /                    list active listings (paginated)
  Query: page, limit, sector, categorySlug, regionId, districtId,
         listingType, maxPrice, minQuantity, farmingMethod,
         deliveryOption, verifiedOnly, bnplOnly, search,
         sortBy (newest|price_low|price_high|most_viewed|harvest_soonest|top_rated),
         lat, lng, radiusKm

GET    /:slug               listing detail (increments viewsCount)
GET    /pledges             harvest pledges only (status=open or partially_pledged)
GET    /inputs              input dealer listings only
GET    /map                 all active listings with GPS for map view
  Returns: [{ id, slug, gpsLat, gpsLng, title, pricePerUnit, sector, sellerVerified }]
GET    /categories          all sectors + categories tree
GET    /categories/:slug    listings by category

### Authenticated
POST   /                    [auth, farmer|dealer] create listing
  Body: { title, categoryId, unitId, listingType, quantityAvailable,
          pricePerUnit, minOrderQuantity, allowNegotiation, regionId,
          districtId, community, gpsLat, gpsLng, farmingMethod,
          freshnessDays, deliveryOptions, description,
          expectedHarvestDate?, depositPercentage?, brand?, manufacturer? }

PATCH  /:id                 [auth, listing-owner] update
DELETE /:id                 [auth, listing-owner] delete draft only
POST   /:id/activate        [auth, listing-owner] draft → active
POST   /:id/pause           [auth, listing-owner]
POST   /:id/photos          [auth, listing-owner] upload photos (max 5MB each)

---

## ORDERS `/api/v1/orders`
POST   /                    [auth] create order
  Body: { listingId, quantity, deliveryOption, deliveryAddress?, buyerNotes? }
  → validates quantity available, calculates commission, creates order
  → for pledge: returns { order, depositAmount, authorizationUrl }

GET    /                    [auth] my orders (as buyer or seller) paginated
GET    /:id                 [auth, participant] order detail
PATCH  /:id/status          [auth, seller] update tracking status
POST   /:id/confirm-delivery [auth, buyer] confirm delivery → release escrow
POST   /:id/dispute         [auth, participant] raise dispute { reason }
POST   /:id/pledge-update   [auth, seller] update pledge progress
  Body: { progress: planted|growing|ready_to_harvest|harvested|dispatched|delivered }
POST   /:id/cancel          [auth, participant] cancel order (with reason)

---

## PAYMENTS `/api/v1/payments`
POST   /initialize          [auth] start Paystack transaction
  Body: { orderId, amount, paymentType }
  → returns { authorizationUrl, reference }

GET    /verify              [auth] ?reference=xxx → verify after Paystack redirect
POST   /webhook             HMAC-SHA512 verified (no JWT)
GET    /wallet              [auth] { balance, pendingBalance, totalEarned, totalWithdrawn }
GET    /wallet/transactions [auth] paginated wallet history
POST   /wallet/withdraw     [auth] { amount, mobileMoneyNumber, mobileMoneyNetwork }

---

## BNPL `/api/v1/bnpl`
GET    /eligibility         [auth, farmer] { eligible, tier, maxAmount, interestRate, score }
POST   /apply               [auth, farmer] { orderId, amountRequested }
GET    /status              [auth, farmer] active + historical applications
POST   /repay               [auth, farmer] manual repayment { applicationId, amount }

---

## INTELLIGENCE `/api/v1/intelligence`
GET    /weather/:districtId         7-day Open-Meteo forecast + farming assessment
GET    /prices/:categorySlug        market prices by category + optional region
  Query: regionId, period (7d|30d|90d)
GET    /prices/trends/:slug         price trend chart data
POST   /pest-report                 [auth] submit pest sighting
  Body: { pestName, categoryId, severity, description, regionId, districtId, gpsLat, gpsLng }
GET    /pest-alerts/:regionId       active pest alerts for region
GET    /advisory/:categorySlug      agronomic growing guide for crop/animal/fish

---

## REVIEWS `/api/v1/reviews`
POST   /                    [auth] create review after completed order
  Body: { orderId, rating, comment, tags[] }
GET    /user/:id            public reviews for any user paginated

---

## NOTIFICATIONS `/api/v1/notifications`
GET    /                    [auth] list, paginated + unreadCount
PATCH  /:id/read            [auth]
POST   /read-all            [auth]

---

## USSD `/api/v1/ussd`
POST   /session             Arkesel webhook (no JWT — internal secret header)

---

## ADMIN `/api/v1/admin`
All require role: admin

GET    /stats               platform-wide metrics (GMV, MAU, BNPL portfolio, pledges)
GET    /users               all users with filters (role, region, verified, banned)
PATCH  /users/:id/verify    { level: field_verified|premium }
PATCH  /users/:id/ban       { reason }
GET    /listings            all listings all statuses
PATCH  /listings/:id/remove { reason }
GET    /orders              all orders platform-wide with filters
GET    /bnpl                all BNPL applications with filters
PATCH  /bnpl/:id/approve    { amountApproved, dueDate }
PATCH  /bnpl/:id/reject     { reason }
GET    /disputes            open disputes
PATCH  /disputes/:id/resolve { resolution, winner: buyer|seller }
POST   /broadcast           { message, channels: [sms|push], filter: { roles, regionIds } }
GET    /pest-reports        all pest reports pending verification
PATCH  /pest-reports/:id/verify { verified: boolean, adminNote }
POST   /prices              bulk import market prices { prices: [] }

---

## ERROR CODES
400 Validation error | 401 Unauthenticated | 403 Forbidden
404 Not found | 409 Conflict | 422 Business logic | 429 Rate limit | 500 Server error
