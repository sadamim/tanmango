/* Page templates shared by Mango Pages (dashboard) and the public /p/[slug] renderer. */
export type Template = { id: string; name: string; premium?: boolean; isNew?: boolean; bg: string; accent: string; text: string; layout: "split" | "center" | "card" };

export const TEMPLATES: Template[] = [
  { id: "sunrise", name: "Sunrise", bg: "linear-gradient(135deg,#ff6a00,#f6bb22)", accent: "#ffffff", text: "#ffffff", layout: "center" },
  { id: "midnight", name: "Midnight", bg: "linear-gradient(135deg,#0f172a,#334155)", accent: "#f2962c", text: "#ffffff", layout: "split" },
  { id: "paper", name: "Paper", bg: "#fffaf3", accent: "#f2962c", text: "#0f0f0f", layout: "card" },
  { id: "forest", name: "Forest", isNew: true, bg: "linear-gradient(135deg,#14532d,#4d7c0f)", accent: "#bef264", text: "#ffffff", layout: "center" },
  { id: "violet", name: "Violet Coach", premium: true, bg: "linear-gradient(135deg,#4c1d95,#db2777)", accent: "#fde68a", text: "#ffffff", layout: "split" },
  { id: "ocean", name: "Ocean Webinar", premium: true, isNew: true, bg: "linear-gradient(135deg,#0c4a6e,#0891b2)", accent: "#fef08a", text: "#ffffff", layout: "center" },
  { id: "noir", name: "Noir Masterclass", premium: true, bg: "#0b0b0b", accent: "#f2962c", text: "#ffffff", layout: "card" },
  { id: "blush", name: "Blush Wellness", premium: true, bg: "linear-gradient(135deg,#fce7f3,#fde68a)", accent: "#be185d", text: "#3b0a24", layout: "center" },
];

export const tpl = (id: unknown) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
