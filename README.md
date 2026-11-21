# TagMango clone (Next.js)

Marketing site + working creator dashboard.

```bash
npm install
npm run dev        # http://localhost:3000
```

> Don't run `npm run build` while `npm run dev` is running — they share the `.next` folder.

## What works

| Area | Routes |
|---|---|
| Marketing site | `/`, `/pricing`, `/demo` |
| Auth (OTP, phone or email) | `/web/sign-up` → OTP → `/web/sign-up/about`, `/web/login` |
| Dashboard (same URLs as tagmango.com) | `/web/dashboard/<page>` — getstarted, analytics, mango-overview, courses, workshop, events, bookings, earnings, transactions, subscriptions, balance, mango-websites, landing-page, storefront, subscribers, leads-management, campaigns, feed-banners, coupons, unsubscribed-users, path, email-templates, whatsapp-templates, whatsapp-event-mapping, whatsapp-account-management, certificates, integrations, affiliate, points, badges, leaderboard, gamification-settings, platformsettings, restrict-login-devices, reported-content, blocked-users, team-management, cloud, accountsettings, plans, tax-reports |
| Top tabs | `/web/feed`, `/web/workshops`, `/web/courses` (+ learner player), `/web/messages` |
| Public buyer pages | `/web/lite/store/<creatorId>` (storefront), `/p/<slug>` (Mango Page), `/checkout/<mangoId>`, `/book/<eventId>` (1-1 booking), `/site/<slug>` (Website Builder) |

### Plans
New accounts start on **Basic**, so some pages show “This feature is locked!” exactly like TagMango
(Website Builder, Banners, Unsubscribed Users, Path, WhatsApp, Affiliates, Gamification, Team, Security).
Upgrade on **Billing & Plans › Plans** (test mode — no payment) to unlock them; a test invoice appears under Billings.

The Get Started checklist ticks itself off as you create a mango, link a product to it, and add a bank account.
Buying through a Mango Page / checkout records a sale for the creator, applies coupons, and raises a notification.

## Admin panel (`/admin`)

A platform-level control room for whoever runs the marketplace (not for individual creators).

| Page | What you can do |
|---|---|
| Overview | GMV, orders, sign-ups, commission, plan mix, top creators, live activity, items needing attention |
| Creators | Search/filter every account; change plan, verify/revoke KYC, grant Freedom Setup, **suspend/reinstate**, add private notes, message the creator, **delete** (type-the-email confirm) |
| Orders | All orders across creators; **refund / restore**; CSV export |
| Withdrawals | Payout queue with bank details: **mark paid** (with UTR) or **reject** (reason required, balance restored) |
| Plans & Billing | Plan distribution, estimated MRR, all invoices |
| Reports | Moderate reported posts/comments: dismiss or remove |
| Announcements | Broadcast to all creators or one plan (shows in their notification bell); retract anytime |
| Audit log | Every admin action, searchable, exportable |
| Settings | Admin list, environment, database/storage stats |

**Who is an admin?** Anyone whose login email is in `ADMIN_EMAILS` (comma separated) in `.env.local`, then restart the dev server.
There is deliberately no UI to grant admin rights. Every `/api/admin/*` route re-checks this on the server, so hiding a menu isn't the only protection.

```bash
echo 'ADMIN_EMAILS=you@yourcompany.com' >> .env.local
```
Sign up / log in with that email, then open `/admin` (or **Admin panel** in your profile menu).

Suspended creators are signed out everywhere, can't log in, and their checkout, storefront, booking and landing pages go offline.

## Backend: Firebase (Firestore + Storage)

All data lives in **Firestore**; uploads (TagMango Cloud) live in **Firebase Storage**. Everything goes through the Next.js server with the Admin SDK — the browser never talks to Firebase, and `firestore.rules` / `storage.rules` deny all direct access.

1. Firebase console → **Build → Firestore Database → Create database** (Native mode).
2. **Build → Storage → Get started** and note the bucket name.
3. **Project settings → Service accounts → Generate new private key**.
4. Copy `.env.example` to `.env.local` and fill `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET` and `ADMIN_EMAILS`.
5. Restart `npm run dev`. The admin **Settings** page shows which database is active.
6. Optional: `firebase deploy --only firestore:rules,storage` to publish the deny-all rules, and `npm run migrate:firebase -- --go` to copy an existing `data/db.json` and uploads into Firebase.

No composite indexes are needed (queries are equality-only). With no Firebase variables in development, a local JSON file (`data/db.json`) is used; in production the app refuses to start without Firebase unless `STORE_DRIVER=file`.

**Server-enforced rules:** creators can't create sales, mark withdrawals paid, verify their own KYC, raise their own plan (in production), or touch plan-locked features; withdrawal amounts are checked against a server-computed balance; slugs, coupon codes and emails are unique; OTPs and sessions are stored hashed with a 5-attempt limit.

**Scheduled jobs:** call `GET /api/cron/run` with `Authorization: Bearer $CRON_SECRET` every few minutes to send scheduled broadcasts and reminder emails.

## Still stand-ins (replace before going live)

- **Payments:** `/api/public/checkout` is test mode (disabled in production unless `ENABLE_TEST_CHECKOUT=1`). Plug Razorpay/Stripe in there, and a plan-purchase flow to replace `ENABLE_TEST_BILLING`.
- **KYC:** PAN is collected and held for admin review (Admin → creator → Approve/Reject). No external verification provider is connected.
- **Email / SMS:** set `SMTP_*` / `TWILIO_*` to deliver login codes, receipts and broadcasts. Without them, development shows codes on screen and saves emails to the `outbox` collection.


## Growth funnel and learning portal

Built from the agency brief (attention → capture → free masterclass → discovery call → paid programme).

| Area | Where |
|---|---|
| Funnel numbers, drop-off %, groups, sources | Dashboard › Growth › Funnel |
| One record per lead, call card | Growth › Leads & CRM |
| Pattern Check editor, scoring rules, result emails | Growth › Pattern Check (public page `/q/<name>`) |
| Masterclass registration, numbered seats, attendance; discovery slots | Growth › Masterclass & Calls (`/m/<name>`, `/call/<name>`) |
| Tracked links, link-in-bio, comment-to-DM webhook | Growth › Links & Bio Page (`/l/<name>`) |
| The 12 workflows, stop rules, sent/opened/clicked/acted | Growth › Workflows |
| Weekly numbers, Monday report, monetisation progress | Growth › Weekly Report |
| Testimonials with permission tick | Growth › Testimonials (`/stories/<name>`) |
| Learners, lessons, classes, assignments, feedback | Learning Portal (learners use `/portal`) |

**Scheduler.** Reminders, follow-ups and the Monday report run from `/api/cron/run`. Call it every 5 minutes
(`Authorization: Bearer $CRON_SECRET`). Immediate messages (result email, confirmations, thank-yous) don't wait for it.

**Still stand-ins.** WhatsApp needs Twilio (`TWILIO_WHATSAPP_FROM`) and, outside the 24-hour window, Meta-approved templates.
Instagram/YouTube numbers are typed in weekly (no platform API). Payment is the test checkout until a gateway such as Razorpay is added.
Policy pages are templates to be reviewed by a lawyer. Pattern Check names, bullets and scores are sample content.
