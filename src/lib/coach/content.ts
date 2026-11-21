/**
 * Nitienaa / THE HUMAN OS™ public website — content and navigation.
 * Replace every [BRACKETED] value with your supplied content; it appears exactly as written on every page.
 * The live price, cohort and programme name come from the coach's Growth settings and programme mango
 * when they exist (see src/lib/coach/server.ts); these values are the fallbacks.
 */

/** Where the coach website is mounted. Point a custom domain at it with a rewrite (see README-HUMANOS.md). */
export const BASE = "/nitienaa";

/** The website is one page: these old page addresses are now sections of it. */
export const SECTIONS: Record<string, string> = {
  "/about": "about", "/stories": "stories", "/programme": "programme", "/method": "method", "/events": "events",
  "/blog": "blog", "/article": "article", "/free-resource": "free-resource", "/apply": "apply", "/enrol": "enrol", "/pricing": "enrol",
};
export const sec = (id: string) => `${BASE}#${id}`;
export const href = (p = "") => {
  if (!p.startsWith("/")) return p || BASE;
  if (SECTIONS[p]) return sec(SECTIONS[p]);
  return p === "/" ? BASE : `${BASE}${p}`;
};

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

/** Header topics. Each one is a group of sections on the single page. */
export type Topic = { id: string; label: string; h: string; sections: { l: string; id: string }[] };
export const nav: Topic[] = [
  { id: "about", label: "About", h: sec("about"), sections: [{ l: "About Nitienaa", id: "about" }, { l: "Stories and proof", id: "stories" }] },
  { id: "programme", label: "Programme", h: sec("programme"), sections: [{ l: "THE HUMAN OS™", id: "programme" }, { l: "The method", id: "method" }, { l: "Events and workshops", id: "events" }] },
  { id: "resources", label: "Resources", h: sec("blog"), sections: [{ l: "Blog", id: "blog" }, { l: "Latest article", id: "article" }, { l: "Free resource", id: "free-resource" }] },
  { id: "apply", label: "Apply and enrol", h: sec("apply"), sections: [{ l: "Apply", id: "apply" }, { l: "Enrol and pay", id: "enrol" }, { l: "Confirmation", id: "confirmation" }] },
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
