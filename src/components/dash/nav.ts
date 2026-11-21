/* Sidebar tree mirrors TagMango's real dashboard menu (slugs = real URL paths). */

export type Plan = "basic" | "pro" | "advanced" | "ultimate";
export const PLAN_ORDER: Plan[] = ["basic", "pro", "advanced", "ultimate"];
export const PLAN_LABEL: Record<Plan, string> = { basic: "Basic", pro: "Pro", advanced: "Advanced", ultimate: "Ultimate" };
export const COMMISSION: Record<Plan, number> = { basic: 0.1, pro: 0.055, advanced: 0.035, ultimate: 0 };

/** Minimum plan needed for a page/feature. Anything not listed is available on Basic. */
export const MIN_PLAN: Record<string, Plan> = {
  "landing-page": "pro",
  "feed-banners": "pro",
  "unsubscribed-users": "pro",
  path: "pro",
  "whatsapp-templates": "pro",
  "whatsapp-event-mapping": "pro",
  "whatsapp-account-management": "pro",
  "team-management": "pro",
  "restrict-login-devices": "pro",
  "blocked-users": "pro",
  "add-customers": "pro",
  "whatsapp-broadcast": "pro",
  affiliate: "advanced",
  points: "advanced",
  badges: "advanced",
  leaderboard: "advanced",
  "gamification-settings": "advanced",
  "platform-branding": "ultimate",
  "platform-menu": "ultimate",
  "platform-migrate": "ultimate",
};

export const isLocked = (feature: string, plan: Plan = "basic") => {
  const need = MIN_PLAN[feature];
  return need ? PLAN_ORDER.indexOf(plan) < PLAN_ORDER.indexOf(need) : false;
};

export type NavLeaf = { label: string; slug: string; badge?: string };
export type NavGroup = { label: string; children: (NavLeaf | NavGroup)[] };
export type NavTop = { label: string; icon: string; slug?: string; children?: (NavLeaf | NavGroup)[] };

export const isGroup = (n: NavLeaf | NavGroup): n is NavGroup => "children" in n;

export const sidebar: NavTop[] = [
  { label: "Get Started", icon: "getstarted", slug: "getstarted" },
  { label: "Analytics", icon: "analytics", slug: "analytics" },
  { label: "Mangoes", icon: "mangoes", slug: "mango-overview" },
  {
    label: "Products",
    icon: "products",
    children: [
      { label: "Courses", slug: "courses" },
      { label: "Workshops", slug: "workshop" },
      { label: "1-1 Consultation", children: [{ label: "Events", slug: "events" }, { label: "Bookings", slug: "bookings" }] },
    ],
  },
  {
    label: "Sales",
    icon: "sales",
    children: [
      { label: "Earnings", slug: "earnings" },
      { label: "Transactions", slug: "transactions" },
      { label: "Subscriptions", slug: "subscriptions" },
      { label: "Withdrawals", slug: "balance" },
    ],
  },
  {
    label: "Page Builder",
    icon: "pagebuilder",
    children: [
      { label: "Mango Pages", slug: "mango-websites" },
      { label: "Website Builder", slug: "landing-page" },
      { label: "Storefront", slug: "storefront" },
    ],
  },
  {
    label: "Customers",
    icon: "customers",
    children: [
      { label: "Customers", slug: "subscribers" },
      { label: "Leads", slug: "leads-management" },
    ],
  },
  {
    label: "Growth",
    icon: "analytics",
    children: [
      { label: "Funnel", slug: "growth", badge: "New" },
      { label: "Leads & CRM", slug: "growth-leads" },
      { label: "Pattern Check", slug: "growth-quiz" },
      { label: "Masterclass & Calls", slug: "growth-events" },
      { label: "Links & Bio Page", slug: "growth-links" },
      { label: "Workflows", slug: "growth-flows" },
      { label: "Weekly Report", slug: "growth-report" },
      { label: "Testimonials", slug: "growth-testimonials" },
    ],
  },
  { label: "Learning Portal", icon: "courses", slug: "portal-programme" },
  {
    label: "Marketing",
    icon: "marketing",
    children: [
      { label: "Broadcasts", slug: "campaigns" },
      { label: "Banners", slug: "feed-banners" },
      { label: "Coupons", slug: "coupons" },
      { label: "Unsubscribed Users", slug: "unsubscribed-users" },
    ],
  },
  {
    label: "Automation",
    icon: "automation",
    children: [
      { label: "Path", slug: "path", badge: "New" },
      { label: "Email Automation", slug: "email-templates" },
      {
        label: "WhatsApp Automation",
        children: [
          { label: "Templates", slug: "whatsapp-templates" },
          { label: "Events Personalisation", slug: "whatsapp-event-mapping" },
          { label: "Account Management", slug: "whatsapp-account-management" },
        ],
      },
      { label: "Certificates", slug: "certificates" },
      { label: "Platform Integrations", slug: "integrations" },
    ],
  },
  { label: "Partnerships", icon: "partnerships", children: [{ label: "Affiliates", slug: "affiliate" }] },
  {
    label: "Gamification",
    icon: "gamification",
    children: [
      { label: "Points", slug: "points" },
      { label: "Badges", slug: "badges" },
      { label: "Leaderboard", slug: "leaderboard" },
      { label: "Gamification Settings", slug: "gamification-settings" },
    ],
  },
  {
    label: "Settings",
    icon: "settings",
    children: [
      { label: "Platform Settings", slug: "platformsettings" },
      {
        label: "Security",
        children: [
          { label: "Manage Login Sessions", slug: "restrict-login-devices" },
          { label: "Reported Content", slug: "reported-content" },
          { label: "Blocked Users", slug: "blocked-users" },
        ],
      },
      { label: "Team Management", slug: "team-management" },
      { label: "TagMango Cloud", slug: "cloud" },
    ],
  },
  {
    label: "Billing & Plans",
    icon: "billing",
    children: [
      { label: "Billings", slug: "accountsettings" },
      { label: "Plans", slug: "plans" },
      { label: "Tax Reports", slug: "tax-reports" },
    ],
  },
];

export const topTabs = [
  { label: "DASHBOARD", icon: "dashboard", href: "/web/dashboard/getstarted", match: (p: string) => p.startsWith("/web/dashboard") },
  { label: "FEED", icon: "feed", href: "/web/feed" },
  { label: "WORKSHOPS", icon: "workshops", href: "/web/workshops" },
  { label: "COURSES", icon: "courses", href: "/web/courses" },
  { label: "MESSAGES", icon: "messages", href: "/web/messages" },
];

export const dash = (slug: string) => `/web/dashboard/${slug}`;
