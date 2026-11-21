/**
 * Nitienaa / THE HUMAN OS™ public website — content and navigation.
 * Replace every [BRACKETED] value with your supplied content; it appears exactly as written on every page.
 * The live price, cohort and programme name come from the coach's Growth settings and programme mango
 * when they exist (see src/lib/coach/server.ts); these values are the fallbacks.
 */

/** Where the coach website is mounted. Point a custom domain at it with a rewrite (see README-HUMANOS.md). */
export const BASE = "/nitienaa";
export const href = (p = "") => (p.startsWith("/") ? `${BASE}${p === "/" ? "" : p}` : p) || BASE;

export const LOGIN_URL = "/web/login?afterLoginRedirectTo=/portal";
export const SIGNUP_URL = "/web/sign-up?afterLoginRedirectTo=/portal";
export const PORTAL_URL = "/portal";

export const programme = {
  name: "THE HUMAN OS™",
  owner: "Nitienaa",
  description: "[Programme description, exactly as you supply it.]",
  price: "[PROGRAMME PRICE]",
  gst: "[GST]",
  total: "[TOTAL]",
  priceNotes: "[Price notes: GST inclusive / exclusive, instalments — as you supply]",
  cohort: "[#]",
  startDate: "[START DATE]",
  seats: "[SEATS]",
  weeks: 6,
  capacity: 100,
  liveDay: "[DAY]",
  liveTime: "[TIME]",
  legalEntity: "[LEGAL ENTITY NAME]",
  email: "[EMAIL]",
  whatsapp: "[WHATSAPP NUMBER]",
  /** Link sent in the lead-magnet welcome email. Put the PDF in /public and use e.g. "/downloads/guide.pdf". */
  resourceUrl: "[RESOURCE LINK]",
};

export type NavItem = { l: string; d: string; h: string };
export const nav: { id: string; label: string; items: NavItem[] }[] = [
  { id: "about", label: "About", items: [
    { l: "About Nitienaa", d: "The person behind the work", h: href("/about") },
    { l: "Stories and proof", d: "Learner stories and results", h: href("/stories") },
  ] },
  { id: "programme", label: "Programme", items: [
    { l: "THE HUMAN OS™", d: "The 6-week cohort programme", h: href("/programme") },
    { l: "The method", d: "How the programme works", h: href("/method") },
    { l: "Events and workshops", d: "Talks, workshops and open sessions", h: href("/events") },
  ] },
  { id: "resources", label: "Resources", items: [
    { l: "Blog", d: "All articles", h: href("/blog") },
    { l: "Article", d: "Latest article", h: href("/blog/sample-article") },
    { l: "Free resource", d: "Download the free guide", h: href("/free-resource") },
  ] },
  { id: "apply", label: "Apply and enrol", items: [
    { l: "Apply", d: "Tell us about you", h: href("/apply") },
    { l: "Enrol and pay", d: "Secure your seat", h: href("/enrol") },
    { l: "Confirmation", d: "Receipt and next steps", h: href("/confirmation") },
  ] },
  { id: "portal", label: "Learner login", items: [
    { l: "Learning portal", d: "Classes, lessons and progress", h: PORTAL_URL },
    { l: "Log in", d: "Already enrolled", h: LOGIN_URL },
  ] },
];

/** Migrated blog posts. Add one entry per existing post (and its images under /public/blog/). */
export type Post = { slug: string; title: string; category: string; date: string; read: string; excerpt: string; image?: string; featured?: boolean; body?: string };
export const posts: Post[] = [
  { slug: "sample-article", title: "[Existing blog post title]", category: "[Category A]", date: "[Date]", read: "[Read time]", excerpt: "[Post excerpt — first lines of the migrated article.]", featured: true },
  { slug: "sample-article-2", title: "[Existing blog post title]", category: "[Category B]", date: "[Date]", read: "[Read time]", excerpt: "[Excerpt]" },
  { slug: "sample-article-3", title: "[Existing blog post title]", category: "[Category C]", date: "[Date]", read: "[Read time]", excerpt: "[Excerpt]" },
  { slug: "sample-article-4", title: "[Existing blog post title]", category: "[Category A]", date: "[Date]", read: "[Read time]", excerpt: "[Excerpt]" },
  { slug: "sample-article-5", title: "[Existing blog post title]", category: "[Category B]", date: "[Date]", read: "[Read time]", excerpt: "[Excerpt]" },
  { slug: "sample-article-6", title: "[Existing blog post title]", category: "[Category C]", date: "[Date]", read: "[Read time]", excerpt: "[Excerpt]" },
];

/** Browser helper: POST JSON, return the parsed reply (never throws). */
export async function postJson<T = Record<string, unknown>>(url: string, data: unknown): Promise<T & { error?: string }> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    return (await r.json().catch(() => ({ error: "Something went wrong" }))) as T & { error?: string };
  } catch {
    return { error: "Network error. Please try again." } as T & { error?: string };
  }
}
