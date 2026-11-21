import type { Plan } from "@/components/dash/nav";

export type AStats = { orders: number; gmv: number; refunded: number; commission: number; mangoes: number; lastOrder: string | null };

export type AUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: Plan;
  kycDone: boolean;
  kycStatus?: string;
  hasBank: boolean;
  bankLast4?: string;
  whiteLabel: boolean;
  suspended: boolean;
  suspendReason: string;
  adminNote: string;
  category: string;
  createdAt: string;
  lastLogin: string | null;
  isAdmin: boolean;
  stats: AStats;
};

export type AOrder = {
  id: string;
  createdAt: string;
  creatorId: string;
  creator: string;
  creatorEmail: string;
  customer: string;
  email: string;
  mango: string;
  amount: number;
  fee: number;
  status: string;
  coupon?: string;
  cycle?: string;
  method?: string;
};

export type AWithdrawal = {
  id: string;
  createdAt: string;
  creatorId: string;
  creator: string;
  creatorEmail: string;
  kycDone: boolean;
  amount: number;
  account: string;
  holder: string;
  ifsc: string;
  status: string;
  adminNote?: string;
  processedAt?: string;
};

export type AReport = {
  id: string;
  createdAt: string;
  kind: string;
  creatorId: string;
  creator: string;
  reporter: string;
  author: string;
  content: string;
  resolved?: string;
};

export type AInvoice = { id: string; createdAt: string; creatorId: string; creator: string; creatorEmail: string; number: string; product: string; amount: number; status: string };
export type AAnnouncement = { id: string; createdAt: string; title: string; body: string; audience: string; recipients: number; admin: string };
export type AAudit = { id: string; createdAt: string; admin: string; action: string; target: string; detail: string };

export type AOverview = {
  creators: { total: number; new30: number; active: number; suspended: number; kycDone: number };
  money: { gmvAll: number; gmv30: number; orders30: number; refunds30: number; commission: number; subscriptions: number };
  pending: { withdrawals: number; withdrawalAmount: number; reports: number; paidOut: number };
  series: { labels: string[]; gmv: number[]; orders: number[]; signups: number[] };
  plans: { plan: Plan; count: number }[];
  top: { id: string; name: string; email: string; plan: Plan; gmv: number; orders: number }[];
  activity: { type: "signup" | "order" | "withdrawal" | "report"; at: string; text: string }[];
};

export type ACreatorDetail = {
  user: AUser & { bank?: { holder: string; account: string; ifsc: string }; kyc?: { pan: string; legalName: string; status: string; submittedAt: string; note?: string } };
  orders: AOrder[];
  withdrawals: AWithdrawal[];
  mangoes: { id: string; title: string; price: number; type: string; active: boolean }[];
  invoices: AInvoice[];
  sessions: number;
  courses: number;
  workshops: number;
};
