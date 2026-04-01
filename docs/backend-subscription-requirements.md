# Backend Subscription Requirements

## 1. Purpose

This document defines the backend requirements for adding subscription logic to FileForge so that plan limits, billing state, feature access, and conversion enforcement are handled consistently across the application.

The current project already includes:

- Next.js App Router API routes under `src/app/api`
- NextAuth authentication with Prisma-backed users
- Prisma/PostgreSQL persistence
- Conversion history logging via `Conversion`
- A pricing page with `Free`, `Pro`, and `Premium` plans

This document is focused on backend behavior and implementation scope, not final UI design.

## 2. Current Application Context

### Existing relevant behavior

- Anonymous users can use file conversion tools.
- Authenticated users can store conversion history in `/api/conversions`.
- Pricing page defines three public plans:
  - `Free`
  - `Pro`
  - `Premium`
- Tool conversion routes currently process requests without subscription checks.
- Dashboard and admin analytics rely on conversion data already stored in Prisma.

### Main backend gap

The app currently has pricing content but no source of truth for:

- a user's active plan
- billing lifecycle state
- daily/monthly quota usage
- feature entitlement checks
- webhook-based billing synchronization
- access enforcement in conversion APIs

## 3. Goals

The backend subscription system must:

- support `Free`, `Pro`, and `Premium` plans
- allow anonymous usage with restricted free-tier limits
- allow authenticated subscriptions tied to `User`
- enforce plan-based limits at API level, not only in UI
- keep billing state in sync with the payment provider
- expose subscription status to frontend pages and tool flows
- preserve an auditable record of plan changes and billing events
- support future add-ons like API credits, teams, and enterprise plans

## 4. Non-Goals For Initial Version

- team billing
- seat-based subscriptions
- usage-based invoicing beyond simple quota counting
- coupon/referral systems
- multi-provider billing support
- tax handling custom logic outside what the payment provider already supports

## 5. Recommended Architecture

### Billing provider

Use Stripe as the initial billing provider because it fits recurring subscriptions, checkout flows, customer portal, and webhooks well. The app should still keep a thin internal abstraction so payment-provider-specific logic stays isolated.

### Backend source of truth

The application database must be the operational source of truth for authorization and feature gating. Stripe is the billing source of truth, but backend routes should rely on locally persisted subscription state that is updated by webhook events.

### Enforcement model

All protected capabilities must be checked server-side before work begins:

- conversion count limits
- file size limits
- access to conversion history
- access to batch processing
- access to API usage
- retention periods
- priority processing

## 6. Plan Model

### Public plans

#### Free

- max file size: 100 MB
- daily conversions: 5
- processing speed: standard
- file retention: 1 hour
- conversion history: disabled for anonymous users, limited for authenticated users only if product decides to allow it later
- batch processing: no
- API access: no
- priority support: no

#### Pro

- max file size: 500 MB
- daily conversions: unlimited
- processing speed: faster
- file retention: 24 hours
- conversion history: last 30 days
- batch processing: up to 20 files
- API access: no
- priority support: no

#### Premium

- max file size: unlimited or a very high enforced system ceiling
- daily conversions: unlimited
- processing speed: highest priority
- file retention: 7 days
- conversion history: full history
- batch processing: unlimited or system ceiling
- API access: yes
- priority support: yes

### Internal plan identifiers

Use stable backend identifiers:

- `FREE`
- `PRO`
- `PREMIUM`

Do not use display labels as database identifiers.

## 7. Required Backend Domain Model

The following new Prisma models or equivalent structures are recommended.

### `Subscription`

Represents the current recurring billing agreement for a user.

Required fields:

- `id`
- `userId`
- `planCode`
- `status`
- `provider`
- `providerCustomerId`
- `providerSubscriptionId`
- `providerPriceId`
- `currentPeriodStart`
- `currentPeriodEnd`
- `cancelAtPeriodEnd`
- `canceledAt`
- `trialStart`
- `trialEnd`
- `startedAt`
- `endedAt`
- `createdAt`
- `updatedAt`

Recommended statuses:

- `INCOMPLETE`
- `TRIALING`
- `ACTIVE`
- `PAST_DUE`
- `CANCELED`
- `UNPAID`
- `EXPIRED`

### `SubscriptionEvent`

Stores an audit trail of billing lifecycle changes received from the provider or triggered internally.

Required fields:

- `id`
- `subscriptionId`
- `userId`
- `eventType`
- `providerEventId`
- `payloadJson`
- `createdAt`

This is useful for debugging webhook sync issues and support requests.

### `UsageCounter`

Stores materialized usage for fast enforcement.

Required fields:

- `id`
- `userId`
- `metric`
- `periodStart`
- `periodEnd`
- `count`
- `createdAt`
- `updatedAt`

Metrics for v1:

- `CONVERSIONS_DAILY`
- `API_CALLS_MONTHLY` if Premium API access ships in v1

### `AnonymousUsage`

Tracks rate-limited free usage for users without accounts.

Possible identity keys:

- IP hash
- anonymous browser/session token
- combined fingerprint strategy

Required fields:

- `id`
- `identityHash`
- `metric`
- `periodStart`
- `periodEnd`
- `count`
- `createdAt`
- `updatedAt`

### Optional extension to `Conversion`

Add fields so conversions can be audited against plan decisions:

- `planCodeAtExecution`
- `isAnonymous`
- `fileSizeBytes`
- `processingTier`
- `retentionExpiresAt`
- `rejectionReason` for rejected or blocked attempts if you choose to log them

## 8. User Model Changes

Recommended additions to `User`:

- `stripeCustomerId` or generic `billingCustomerId`
- `defaultPlanCode`

Avoid storing only derived plan state on `User` unless it is explicitly cached. The canonical active subscription should live in `Subscription`.

## 9. Entitlements Model

Create a backend-only plan configuration module such as:

- `src/lib/billing/plans.ts`

This module should define all plan entitlements in one place, for example:

- max file size
- daily conversion limit
- history retention days
- batch size limit
- API access enabled
- priority queue level
- support tier

All route enforcement must read from this module rather than duplicating limits across files.

## 10. Enforcement Rules

### 10.1 Authentication and identity

- Anonymous users should default to `FREE`.
- Authenticated users without an active paid subscription should default to `FREE`.
- Authenticated users with `ACTIVE` or `TRIALING` subscription should receive entitlements from their paid plan.
- `PAST_DUE`, `UNPAID`, `CANCELED`, or `EXPIRED` subscriptions should fall back to `FREE` unless the business decides on a grace window.

### 10.2 Conversion request checks

Every conversion route under `src/app/api/convert/**/route.ts` should call a shared entitlement guard before processing the upload.

Required checks:

- determine effective plan
- verify tool access if certain tools become plan-specific later
- validate uploaded file size against plan limit
- validate daily usage against quota
- validate batch size for multi-file operations
- assign processing priority
- compute file retention expiry

### 10.3 Conversion history checks

- `Free`: no history or very limited history depending on product decision
- `Pro`: last 30 days only
- `Premium`: full history

`/api/conversions` must filter by entitlement, not just by authenticated user.

### 10.4 API access checks

If public API endpoints are introduced:

- only `Premium` can create or use API credentials
- each API request must authenticate and check the current subscription state

## 11. Required Backend Services

Implement these services as reusable server-side modules.

### `getEffectivePlanForRequest()`

Returns:

- user identity
- whether request is anonymous
- active subscription state
- effective plan code
- entitlement object

### `assertConversionAllowed()`

Accepts:

- identity
- file size
- tool identifier
- batch count

Returns:

- allowed or denied
- denial reason code
- entitlement metadata used by the caller

### `recordUsage()`

Increments counters after a successful conversion or other billable action.

### `syncSubscriptionFromWebhook()`

Processes provider events and updates local subscription rows idempotently.

### `getSubscriptionSummary()`

Returns a frontend-safe payload for dashboard, pricing, and account pages.

## 12. Required API Endpoints

Recommended new endpoints:

### `POST /api/billing/checkout`

Creates a checkout session for `Pro` or `Premium`.

Request:

- target `planCode`

Response:

- hosted checkout URL or session ID

Rules:

- authenticated users only
- reject checkout for invalid or same-plan upgrades depending on policy

### `POST /api/billing/portal`

Creates a billing portal session for users with an existing billing customer.

### `POST /api/billing/webhook`

Handles provider events.

Requirements:

- verify webhook signature
- idempotent event processing
- persist raw event metadata
- update local subscription state

### `GET /api/billing/subscription`

Returns the current user’s subscription summary:

- plan
- status
- renewal date
- trial end date
- cancel-at-period-end flag
- entitlements
- usage summary

### `POST /api/billing/cancel`

Optional wrapper if you do not want to rely only on the provider portal.

### `POST /api/billing/resume`

Optional wrapper for undoing cancel-at-period-end.

## 13. Webhook Events To Support

For Stripe, support at least:

- checkout session completed
- customer subscription created
- customer subscription updated
- customer subscription deleted
- invoice paid
- invoice payment failed
- charge refunded if refunds impact access policy

Webhook handler requirements:

- verify signature
- ignore duplicate events
- tolerate out-of-order delivery
- log failures with enough context for replay

## 14. Data Consistency Rules

- Subscription updates must be idempotent.
- Provider event IDs must be stored to prevent duplicate processing.
- Authorization decisions must not call Stripe synchronously on every user request.
- Webhook lag should not break the app; local state should remain readable even when temporarily stale.
- Plan entitlements should be versioned in code so product changes are explicit and reviewable.

## 15. Anonymous Free-Tier Tracking

Because anonymous users can use tools, backend quota enforcement must account for non-logged-in traffic.

Recommended v1 behavior:

- issue an anonymous session identifier cookie
- combine it with IP-based safeguards
- store only hashed identity values
- enforce `5 conversions per day`

Known limitation:

- anonymous quota can be bypassed more easily than authenticated quota

That is acceptable for v1 if abuse controls are added.

## 16. Abuse Prevention And Operational Limits

Required safeguards:

- request size limits
- file type validation
- route-level timeouts
- rate limiting on billing and auth endpoints
- rate limiting on anonymous conversion attempts
- webhook signature verification
- server-side plan enforcement even if client modifies requests

Recommended later:

- queue-based processing for larger files
- antivirus scanning if untrusted file storage is introduced
- admin alerts for repeated failed billing events

## 17. Dashboard And Admin Data Requirements

### User-facing subscription data

Dashboard/account pages need:

- current plan
- subscription status
- renewal/cancelation date
- remaining free conversions today if on `Free`
- history retention notice

### Admin reporting additions

Admin analytics should eventually include:

- active subscribers by plan
- trial-to-paid conversion rate
- churn count
- failed payment count
- conversion volume by plan
- top tools by plan

## 18. Environment Variables

Expected new environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_PREMIUM_PRICE_ID`
- `NEXT_PUBLIC_APP_URL` if needed for redirects

Optional:

- `STRIPE_PORTAL_CONFIGURATION_ID`

## 19. Testing Requirements

Minimum backend tests should cover:

- free-tier quota enforcement
- paid-tier entitlement selection
- file size blocking by plan
- history visibility rules
- webhook idempotency
- fallback to free plan after cancelation or expiration
- checkout request validation
- anonymous usage tracking behavior

Recommended test levels:

- unit tests for entitlement logic
- integration tests for API route guards
- webhook handler tests with fixture payloads

## 20. Migration Plan

### Phase 1: Data model

- add Prisma enums and models for subscription and usage tracking
- migrate database
- seed plan constants in code only

### Phase 2: Billing foundation

- add billing service module
- create checkout, portal, subscription, and webhook endpoints
- sync subscription state from Stripe into database

### Phase 3: Enforcement

- add shared entitlement guard
- update all conversion routes to call the guard
- update conversion logging to store plan and retention metadata

### Phase 4: Account surfaces

- expose subscription summary to dashboard and pricing flows
- surface quota and renewal information

### Phase 5: Admin and hardening

- add billing metrics to admin analytics
- add rate limiting and abuse safeguards
- add cleanup jobs for retention expiry

## 21. Implementation Checklist

- create `Subscription`, `SubscriptionEvent`, `UsageCounter`, and `AnonymousUsage` Prisma models
- add stable enums for plan codes and subscription statuses
- add `src/lib/billing/plans.ts`
- add `src/lib/billing/subscription-service.ts`
- add `src/lib/billing/entitlements.ts`
- add `src/lib/billing/usage-service.ts`
- add `POST /api/billing/checkout`
- add `POST /api/billing/portal`
- add `GET /api/billing/subscription`
- add `POST /api/billing/webhook`
- update NextAuth session payload to include plan summary or fetch it server-side
- update `/api/conversions` to enforce history visibility rules
- update each conversion route to call a shared preflight check
- log conversion metadata with plan context
- add tests for billing and entitlement logic

## 22. Open Product Decisions

These decisions should be confirmed before implementation starts:

- Should free authenticated users get any history at all, or none?
- Should `Pro` and `Premium` include free trials? If yes, how long?
- Should canceled subscriptions retain paid access until period end?
- What is the actual hard cap for "unlimited" file size and batch size?
- Should anonymous users be allowed to start checkout, or must they sign in first?
- Should failed conversions count toward daily quota?
- Will batch processing be introduced in v1, or only modeled now?
- Is API access in scope for this first backend release, or only reserved in the schema?

## 23. Recommended First Build Scope

To ship safely, the first backend release should include:

- Stripe checkout and webhook sync
- local `Subscription` persistence
- free/pro/premium entitlement config
- authenticated subscription summary endpoint
- anonymous and authenticated daily conversion limits
- file-size enforcement on conversion routes
- history retention filtering

This gives the app a complete subscription backbone without over-expanding into teams, credits, or enterprise billing.

## 24. Suggested File Structure

```text
src/lib/billing/
  plans.ts
  entitlements.ts
  subscription-service.ts
  stripe.ts
  usage-service.ts
  guards.ts

src/app/api/billing/
  checkout/route.ts
  portal/route.ts
  subscription/route.ts
  webhook/route.ts
```

## 25. Summary

The backend should treat subscription logic as an authorization system, not just a payment integration. Billing events update local subscription state, local subscription state drives entitlements, and entitlements are enforced in every conversion and account-facing route.

That architecture will fit the current FileForge codebase cleanly and leaves room for future paid features without reworking the fundamentals.
