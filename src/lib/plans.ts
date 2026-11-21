import "server-only";
import { MIN_PLAN, PLAN_ORDER, COMMISSION } from "@/components/dash/nav";
import type { Plan, User } from "./db";

export const planOf = (u: Pick<User, "plan"> | null | undefined): Plan => u?.plan || "basic";
export const rateFor = (u: Pick<User, "plan"> | null | undefined) => COMMISSION[planOf(u)] ?? 0.1;

/** True if the creator's plan includes `feature` (see MIN_PLAN in nav.ts). Unknown features are open. */
export const hasFeature = (u: Pick<User, "plan"> | null | undefined, feature: string) => {
  const need = MIN_PLAN[feature];
  return !need || PLAN_ORDER.indexOf(planOf(u)) >= PLAN_ORDER.indexOf(need);
};

/** Self-service plan change without a payment gateway. On in development, off in production unless ENABLE_TEST_BILLING=1. */
export const testBilling = () => process.env.ENABLE_TEST_BILLING === "1" || (process.env.NODE_ENV !== "production" && process.env.ENABLE_TEST_BILLING !== "0");
/** KYC is approved on submit in development; in production an admin reviews it unless KYC_AUTO_APPROVE=1. */
export const kycAutoApprove = () => process.env.KYC_AUTO_APPROVE === "1" || (process.env.NODE_ENV !== "production" && process.env.KYC_AUTO_APPROVE !== "0");
