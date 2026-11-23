import "server-only";
import { store } from "../db";
import { getGrowth, growthBySlug, type Growth } from "../growth/core";
import { programme as fallback } from "./content";

export type Coach = {
  /** true when no real programme is set up and Razorpay test keys are in use: a ₹1 demo checkout. */
  demo?: boolean;
  creatorId: string | null;
  growth: Growth | null;
  mangoId: string | null;
  /** Price in rupees, computed on the server from the programme mango. */
  amount: number | null;
  programme: typeof fallback;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Demo checkout is allowed only with Razorpay TEST keys, never live ones. */
export const demoAllowed = () => String(process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_test_") && process.env.DISABLE_DEMO_CHECKOUT !== "1";
const demoAmount = () => Math.max(1, Number(process.env.DEMO_PROGRAMME_PRICE || 1));

/** When the real programme isn't set up yet, test-mode sites sell a ₹1 demo so payments can be tested. */
function withDemo(c: Coach): Coach {
  if (c.mangoId || !demoAllowed()) return c;
  const a = demoAmount();
  return { ...c, demo: true, mangoId: "demo", amount: a, programme: { ...c.programme, price: inr(a), total: inr(a), gst: "Included" } };
}

/**
 * The coach this website belongs to: the Growth settings with slug COACH_SLUG, or the only/first one.
 * The programme mango (Growth › settings › programme) supplies the live price.
 */
export async function getCoach(): Promise<Coach> {
  return withDemo(await loadCoach());
}

async function loadCoach(): Promise<Coach> {
  try {
    const slug = process.env.COACH_SLUG;
    let g: Growth | null = slug ? await growthBySlug(slug) : null;
    if (!g) {
      const [first] = await store.find("growth", [], { limit: 1 });
      g = (first as unknown as Growth) || null;
    }
    if (!g) return { creatorId: null, growth: null, mangoId: null, amount: null, programme: fallback };
    const full = await getGrowth(g.userId);
    const mango = full?.programmeMango ? await store.get("mangoes", full.programmeMango) : null;
    const amount = mango && mango.active ? Number(mango.discountPrice || mango.price || 0) : null;
    return {
      creatorId: g.userId,
      growth: full,
      mangoId: mango && mango.active ? String(mango.id) : null,
      amount,
      programme: {
        ...fallback,
        name: String(full?.programme || fallback.name),
        owner: String(full?.coachName || fallback.owner),
        price: amount != null ? inr(amount) : fallback.price,
        total: amount != null ? inr(amount) : fallback.total,
        startDate: String(full?.kickoff || fallback.startDate),
      },
    };
  } catch {
    return { creatorId: null, growth: null, mangoId: null, amount: null, programme: fallback };
  }
}
