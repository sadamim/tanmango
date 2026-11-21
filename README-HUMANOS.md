# Nitienaa / THE HUMAN OS™ — website, portal and payments (add-on)

This add-on sits on top of the TagMango project. It reuses its database, logins, Growth funnel,
workflows (email + WhatsApp), learning portal and admin. The TagMango pages are not changed.

## 1. Install

Copy everything in this folder into the root of `TagMango/` and let it replace files when asked.
These 4 existing files are replaced, each one a small extension of the original:

| File | What changed |
|---|---|
| `next.config.ts` | Adds a redirects list for old URLs, plus an optional rewrite for the coach's own domain |
| `src/app/portal/page.tsx` | Learner portal redesign: dashboard, live classes, lessons, assignments, resources, announcements, certificate, account |
| `src/app/api/portal/route.ts` | Refunded (paused) learners lose portal access; returns email and phone for the Account tab |
| `src/app/api/admin/orders/[id]/route.ts` | Refunds go through Razorpay, pause the portal and send the learner a refund confirmation |

Then, in the project folder:

```bash
node scripts/add-humanos-flows.mjs   # adds 3 workflows to src/lib/growth/model.ts (safe to run twice)
npm install
npm run dev                          # http://localhost:3000/nitienaa
```

## 2. Connect the site to the coach account

1. Log in as the coach. Open **Dashboard › Growth** once so the Growth settings exist.
2. Create the programme as a **Mango** (one-time price) and choose it as the programme in the Growth settings.
   Its price shows on Programme, Enrol and the receipt.
3. If there is more than one coach in the database, set `COACH_SLUG` to the Growth slug in `.env.local`.

## 3. Payments (Razorpay)

Add to `.env.local` (test keys first, then live keys after a live test payment):

```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...          # Razorpay Dashboard › Settings › Webhooks
```

Webhook URL: `https://<your-domain>/api/razorpay/webhook`, events **payment.captured** and **payment.failed**.

Without keys, the Enrol page uses the platform's existing test checkout in development, so the whole flow works locally.

| Step | What happens |
|---|---|
| Learner clicks Pay | `/api/coach/order` computes the price on the server and creates a Razorpay order. It also marks the lead "enrolment started" |
| Payment captured | `/api/coach/verify` (browser) and `/api/razorpay/webhook` (server) both record the sale once, keyed on the payment id. Then they email the receipt and call `onPurchase()` |
| `onPurchase()` | Enrols the learner, creates their portal login and starts the **Payment successful** workflow (email + WhatsApp) |
| Pending / failed | The **Enrolment started but unpaid** reminders send the payment link |
| Refund | Admin › Orders › Refund: Razorpay refund, portal paused, then the **Refund processed** email + WhatsApp |

## 4. The 10 workflows

| Trigger | Where it lives |
|---|---|
| Lead magnet form | new `lead_magnet` workflow (Free resource page, home page form) |
| Application sent | new `application` workflow (received + 3 follow-ups + WhatsApp nudge) |
| Payment successful | existing `paid` |
| Payment pending or failed | existing `enrol_unpaid` |
| Before each live class | existing class notices (cron) |
| Refund processed | new `refund` workflow |
| Assignment due soon | existing class notices (cron) |
| Feedback ready | existing `feedbackReady()` |
| Programme completed | existing `completed` |
| Cohort announcement | existing `announceUpdate()` |

Edit the wording in **Dashboard › Growth › Workflows**. WhatsApp needs the Twilio / Meta settings already described in `README.md`.

## 5. Content to fill in

- `src/lib/coach/content.ts`: every `[BRACKETED]` value (dates, GST, contact details, free-resource link) and the migrated blog posts.
- Page copy, photos and quotes are marked `[...]` in `src/app/nitienaa/**/page.tsx`.
- Policies (`/nitienaa/privacy`, `/terms`, `/refund-policy`) are templates for a lawyer to review.

## 6. Going live on the coach's domain

Set `COACH_DOMAIN=www.yourdomain.com` and point the domain at this deployment. The coach site is then served at the
domain's root (`/about` → `/nitienaa/about`), while `/portal`, `/web` and `/api` keep working.
Add every old URL to `OLD_SITE_REDIRECTS` in `next.config.ts`.

## Pages

| Menu | Route |
|---|---|
| Home | `/nitienaa` |
| About › About Nitienaa, Stories and proof | `/nitienaa/about`, `/nitienaa/stories` |
| Programme › THE HUMAN OS™, The method, Events and workshops | `/nitienaa/programme`, `/nitienaa/method`, `/nitienaa/events` |
| Resources › Blog, Article, Free resource | `/nitienaa/blog`, `/nitienaa/blog/<slug>`, `/nitienaa/free-resource` |
| Apply and enrol › Apply, Enrol and pay, Confirmation | `/nitienaa/apply`, `/nitienaa/enrol`, `/nitienaa/confirmation` |
| Learner login › Learning portal | `/portal` (sign in at `/web/login`) |
| Header: Pricing, Log in, Sign up | `/nitienaa/enrol`, `/web/login`, `/web/sign-up` |
| Footer: Contact, Press, Privacy, Terms, Refund policy | `/nitienaa/contact`, `/nitienaa/press`, `/nitienaa/privacy`, `/nitienaa/terms`, `/nitienaa/refund-policy` |
