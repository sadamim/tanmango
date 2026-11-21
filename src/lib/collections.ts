/** Every Firestore collection the app uses. Importable from scripts (no server-only). */

/** Documents owned by one creator (they carry `userId`). These are deleted with the creator. */
export const ROW_COLLECTIONS = [
  "mangoes", "courses", "workshops", "events", "bookings", "sales", "withdrawals", "pages", "sites", "leads",
  "broadcasts", "banners", "coupons", "unsubscribed", "paths", "waTemplates", "certificates", "affiliates",
  "badges", "team", "cloud", "invoices", "reports", "blocked", "customers", "posts", "comments", "messages",
  "notifications", "views", "outbox",
  // growth funnel + learning portal
  "growth", "crm", "masterclasses", "slots", "trackedLinks", "linkClicks", "flows", "flowRuns", "msgLog", "testimonials", "socialStats",
  "lessons", "classes", "assignments", "submissions", "enrolments", "updates",
] as const;

/** Written by admins (userId = the admin). Kept when a creator is deleted. */
export const ADMIN_COLLECTIONS = ["audit", "announcements"] as const;

/** Auth / bookkeeping collections. */
export const SYSTEM_COLLECTIONS = ["users", "sessions", "otps", "claims"] as const;

export const ALL_COLLECTIONS = [...SYSTEM_COLLECTIONS, ...ROW_COLLECTIONS, ...ADMIN_COLLECTIONS] as const;
