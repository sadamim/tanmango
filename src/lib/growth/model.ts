/**
 * Growth funnel model shared by server and browser (no server-only imports).
 * Funnel: attention → capture → free masterclass → discovery call → paid programme.
 */

/* ------------------------------------------------------------------ funnel */

export const STEPS = [
  { key: "attention", label: "1 · Attention", sub: "Reach and clicks" },
  { key: "capture", label: "2 · Capture", sub: "Name, email, WhatsApp" },
  { key: "masterclass", label: "3 · Free masterclass", sub: "Registered → attended" },
  { key: "call", label: "4 · Discovery call", sub: "Booked → attended → enrolled" },
  { key: "programme", label: "5 · Programme", sub: "Paid → completed" },
] as const;

/** Every milestone a lead can reach. Each is stored once, as an ISO timestamp, on the lead's `m` map. */
export const MILESTONES = [
  "half", "captured", "pattern", "mcRegistered", "mcAttended", "mcMissed", "replay",
  "callBooked", "callAttended", "callNoShow", "callDone", "enrolStarted", "paid", "declined", "missedClass", "completed", "testimonial",
] as const;
export type Milestone = (typeof MILESTONES)[number];

export type Lead = {
  id: string;
  userId: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  whatsappOptIn?: boolean;
  source?: string;
  m?: Partial<Record<Milestone, string>>;
  pattern?: PatternResult & { picked: Record<string, string[]>; retest?: PatternResult };
  masterclassId?: string;
  seat?: number;
  callAt?: string;
  callLink?: string;
  notes?: string;
  events?: { at: string; type: string; detail?: string }[];
  [k: string]: unknown;
};

/** Which funnel step a lead has reached (highest). */
export function stageOf(l: Pick<Lead, "m">): (typeof STEPS)[number]["key"] {
  const m = l.m || {};
  if (m.paid) return "programme";
  if (m.callBooked) return "call";
  if (m.mcRegistered) return "masterclass";
  if (m.captured || m.pattern) return "capture";
  return "attention";
}

export const GROUPS: { key: string; label: string; test: (m: NonNullable<Lead["m"]>) => boolean }[] = [
  { key: "interested", label: "Interested, not registered", test: (m) => !!m.captured && !m.mcRegistered && !m.callBooked && !m.paid },
  { key: "noshow_mc", label: "Registered, did not attend", test: (m) => !!m.mcRegistered && !m.mcAttended && !m.callBooked && !m.paid },
  { key: "nobook", label: "Attended, did not book", test: (m) => !!m.mcAttended && !m.callBooked && !m.paid },
  { key: "noenrol", label: "Had a call, did not enrol", test: (m) => !!m.callAttended && !m.enrolStarted && !m.paid },
  { key: "unpaid", label: "Started enrolling, did not pay", test: (m) => !!m.enrolStarted && !m.paid },
  { key: "missed", label: "Paid, missed a class", test: (m) => !!m.paid && !!m.missedClass },
  { key: "half", label: "Half-filled a form", test: (m) => !!m.half && !m.captured },
];

export type Funnel = {
  steps: { key: string; label: string; sub: string; entered: number; left: number; dropPct: number; extra: { label: string; value: number | string }[] }[];
  groups: Record<string, number>;
  bySource: { source: string; leads: number; paid: number }[];
};

export type ClickRow = { platform?: string; campaign?: string; linkId?: string; createdAt: string };

export function computeFunnel(leads: Lead[], clicks: ClickRow[], sinceIso?: string, untilIso?: string): Funnel {
  const inWin = (iso?: string) => !!iso && (!sinceIso || iso >= sinceIso) && (!untilIso || iso <= untilIso);
  const has = (l: Lead, k: Milestone) => (sinceIso || untilIso ? inWin(l.m?.[k]) : !!l.m?.[k]);
  const n = (k: Milestone) => leads.filter((l) => has(l, k)).length;
  const clk = clicks.filter((c) => inWin(c.createdAt) || (!sinceIso && !untilIso)).length;

  const captured = leads.filter((l) => has(l, "captured") || has(l, "pattern")).length;
  const mcReg = n("mcRegistered");
  const mcAtt = n("mcAttended");
  const booked = n("callBooked");
  const callAtt = n("callAttended");
  const paid = n("paid");
  const enrolAfterCall = leads.filter((l) => has(l, "callBooked") && has(l, "paid")).length;
  const recovered = leads.filter((l) => has(l, "enrolStarted") && has(l, "paid")).length;

  const entered = [clk, captured, mcReg, booked, paid];
  const left = [captured, mcReg, booked, paid, n("completed")];
  const extras: Funnel["steps"][number]["extra"][] = [
    [{ label: "Link clicks", value: clk }],
    [{ label: "Leads", value: captured }, { label: "Pattern Check done", value: n("pattern") }, { label: "Half-filled forms", value: leads.filter((l) => l.m?.half && !l.m?.captured).length }],
    [{ label: "Registered", value: mcReg }, { label: "Show-up rate", value: mcReg ? `${Math.round((mcAtt / mcReg) * 100)}%` : "—" }, { label: "Replay views", value: n("replay") }],
    [{ label: "Booked", value: booked }, { label: "Attended", value: callAtt }, { label: "Enrolled", value: enrolAfterCall }],
    [{ label: "Enrolments", value: paid }, { label: "Recovered after reminder", value: recovered }, { label: "Missed a class", value: n("missedClass") }, { label: "Completed", value: n("completed") }, { label: "Testimonials", value: n("testimonial") }],
  ];
  const groups: Record<string, number> = {};
  for (const g of GROUPS) groups[g.key] = leads.filter((l) => g.test(l.m || {})).length;

  const src = new Map<string, { leads: number; paid: number }>();
  for (const l of leads) {
    const s = String(l.source || "direct");
    const r = src.get(s) || { leads: 0, paid: 0 };
    r.leads++;
    if (l.m?.paid) r.paid++;
    src.set(s, r);
  }
  return {
    steps: STEPS.map((s, i) => ({ ...s, entered: entered[i], left: left[i], dropPct: entered[i] ? Math.max(0, Math.round(((entered[i] - left[i]) / entered[i]) * 100)) : 0, extra: extras[i] })),
    groups,
    bySource: [...src.entries()].map(([source, v]) => ({ source, ...v })).sort((a, b) => b.leads - a.leads),
  };
}

/* ------------------------------------------------------------------ Pattern Check */

export type Bullet = { id: string; text: string; score: number };
export type Pattern = { id: string; name: string; blurb?: string; bullets: Bullet[] };
export type QuizRules = { present: number; blend: number; lowBelow: number; highFrom: number };
export type PatternResult = {
  pct: Record<string, number>;
  primary: string;
  secondary?: string;
  third?: string;
  type: "Single" | "Blend of 2" | "Blend of 3" | "None present";
  flag?: "low" | "high";
  at: string;
};

export const DEFAULT_RULES: QuizRules = { present: 50, blend: 15, lowBelow: 30, highFrom: 70 };

/** Percentage per pattern = points picked ÷ that pattern's maximum. Result rules follow the brief (all editable). */
export function scorePatternCheck(patterns: Pattern[], picked: Record<string, string[]>, rules: QuizRules = DEFAULT_RULES): PatternResult {
  const pct: Record<string, number> = {};
  for (const p of patterns) {
    const max = p.bullets.reduce((a, b) => a + Math.max(0, Number(b.score) || 0), 0);
    const chosen = new Set(picked[p.id] || []);
    const got = p.bullets.filter((b) => chosen.has(b.id)).reduce((a, b) => a + Math.max(0, Number(b.score) || 0), 0);
    pct[p.id] = max ? Math.round((got / max) * 100) : 0;
  }
  const ranked = patterns.map((p) => p.id).sort((a, b) => pct[b] - pct[a]);
  const present = ranked.filter((id) => pct[id] >= rules.present);
  const primary = present[0] || ranked[0];
  const near = present.slice(1).filter((id) => pct[primary] - pct[id] <= rules.blend).slice(0, 2);
  const values = Object.values(pct);
  return {
    pct,
    primary,
    secondary: near[0],
    third: near[1],
    type: !present.length ? "None present" : near.length === 2 ? "Blend of 3" : near.length === 1 ? "Blend of 2" : "Single",
    flag: values.length && values.every((v) => v < rules.lowBelow) ? "low" : values.length && values.every((v) => v >= rules.highFrom) ? "high" : undefined,
    at: new Date().toISOString(),
  };
}

const sample = (id: string, items: [string, number][]): Bullet[] => items.map(([text, score], i) => ({ id: `${id}${i + 1}`, text, score }));

/** Sample content only. Replace with the four pattern names, bullets and scores supplied by the coach. */
export const DEFAULT_PATTERNS: Pattern[] = [
  { id: "p1", name: "The Dependable One", blurb: "You are the person everyone leans on, and you rarely say no.", bullets: sample("a", [["I say yes before I check whether I have the time", 3], ["I fix things that are not mine to fix", 2], ["I feel guilty resting while others are busy", 2], ["People are surprised when I ask for help", 1]]) },
  { id: "p2", name: "The Silent Diplomat", blurb: "You keep the peace, and your own view stays unspoken.", bullets: sample("b", [["I rehearse what to say and then say nothing", 3], ["I soften feedback until it disappears", 2], ["I leave meetings with the real point unsaid", 2], ["I agree out loud and disagree later, alone", 1]]) },
  { id: "p3", name: "The Approval Seeker", blurb: "A good word from the right person steers your choices.", bullets: sample("c", [["I check how my work lands before I trust it", 3], ["A lukewarm reply stays with me for days", 2], ["I change my view to match the room", 2], ["I over-explain my decisions", 1]]) },
  { id: "p4", name: "The Benchmark Chaser", blurb: "You measure yourself against someone else's scoreboard.", bullets: sample("d", [["I compare my title and pay with my peers", 3], ["Hitting a goal feels flat within a day", 2], ["I scroll other people's wins and feel behind", 2], ["I take on more to keep up", 1]]) },
];

/* ------------------------------------------------------------------ automated workflows */

export type StepDef = {
  key: string;
  channel: "email" | "whatsapp";
  /** Minutes after the trigger; negative = before the event time (class, call, masterclass). */
  at: number;
  rel?: "event";
  subject?: string;
  body: string;
};
export type FlowDef = {
  id: string;
  n: number;
  name: string;
  trigger: string;
  /** Milestone that counts as "acted on" for message statistics. */
  goal: Milestone | null;
  /** Remaining steps are cancelled as soon as any of these milestones exist on the lead. */
  stopOn: Milestone[];
  /** Sales messages never go to someone who has paid. */
  sales: boolean;
  steps: StepDef[];
  note?: string;
};

const SIGN = "\n\n— {coach}\n{programme}";

export const FLOWS: FlowDef[] = [
  {
    id: "social_lead", n: 1, name: "Social lead", trigger: "Comments a keyword on Instagram, or messages on WhatsApp from a link",
    goal: "captured", stopOn: ["captured", "pattern", "mcRegistered", "paid"], sales: true,
    steps: [{ key: "wa", channel: "whatsapp", at: 0, body: "Hi {first}! Thanks for reaching out to {coach}. Two things to start with:\n1) Spot your pattern (5 minutes): {quiz_link}\n2) Join the free live masterclass: {mc_link}" }],
  },
  {
    id: "pattern_done", n: 2, name: "Pattern Check completed", trigger: "Completes the Pattern Check",
    goal: "mcRegistered", stopOn: ["mcRegistered", "paid"], sales: true,
    steps: [
      { key: "result", channel: "email", at: 0, subject: "Your pattern, named", body: "Hi {first},\n\nYour result: {pattern} ({pct}%).{secondary_line}\n\nFull result: {result_link}\n{pdf_line}\nThe free masterclass goes deeper: {mc_link}" + SIGN },
      { key: "wa_optin", channel: "whatsapp", at: 1, body: "Thanks {first}, you're opted in for updates from {coach}. One question: which pattern did you spot first?" },
      { key: "d2", channel: "email", at: 2 * 1440, subject: "What a pattern costs you", body: "Hi {first},\n\nA pattern is not a flaw. It is something that runs without you choosing it. Naming it is the first move.\n\nSee how it works in the free masterclass: {mc_link}" + SIGN },
      { key: "d4", channel: "email", at: 4 * 1440, subject: "The next step after naming it", body: "Hi {first},\n\nMost people stop at the name. The change comes from what happens next. We map it live in the masterclass: {mc_link}" + SIGN },
      { key: "d6", channel: "email", at: 6 * 1440, subject: "Seats are numbered", body: "Hi {first},\n\nThe masterclass has numbered seats. Hold yours here: {mc_link}" + SIGN },
    ],
  },
  {
    id: "mc_registered", n: 3, name: "Masterclass registered", trigger: "Registers for the free masterclass",
    goal: "mcAttended", stopOn: [], sales: false,
    steps: [
      { key: "confirm", channel: "email", at: 0, subject: "You're in: {masterclass_title}", body: "Hi {first},\n\nYour seat ({seat}) is confirmed for {masterclass_title} on {masterclass_time}.\nJoin link: {join_link}\n\nOne question before class: what is the one situation where you keep reacting the same way?" + SIGN },
      { key: "wa24", channel: "whatsapp", at: -1440, rel: "event", body: "Reminder: {masterclass_title} is tomorrow, {masterclass_time}. Join: {join_link}" },
      { key: "wa3", channel: "whatsapp", at: -180, rel: "event", body: "{masterclass_title} starts in 3 hours. Join: {join_link}" },
      { key: "wa1", channel: "whatsapp", at: -60, rel: "event", body: "{masterclass_title} starts in 1 hour. Join: {join_link}" },
      { key: "wa10", channel: "whatsapp", at: -10, rel: "event", body: "Starting in 10 minutes. Join now: {join_link}" },
    ],
  },
  {
    id: "mc_attended", n: 4, name: "After the masterclass: attended", trigger: "Marked as attended",
    goal: "callBooked", stopOn: ["callBooked", "paid"], sales: true,
    steps: [
      { key: "thanks", channel: "email", at: 0, subject: "Thank you for joining", body: "Hi {first},\n\nThank you for joining today. The replay is yours for 48 hours: {replay_link}\n\nIf you want to talk about your own pattern, book a one-to-one conversation: {book_link}" + SIGN },
      { key: "wa", channel: "whatsapp", at: 5, body: "Thanks for joining, {first}! Replay (48 hours): {replay_link}\nBook your conversation: {book_link}" },
      { key: "n1", channel: "email", at: 1440, subject: "Have you booked your conversation?", body: "Hi {first},\n\nA short one-to-one is the best way to apply what you saw. Pick a time: {book_link}" + SIGN },
      { key: "n3", channel: "whatsapp", at: 3 * 1440, body: "Hi {first}, your conversation slot is still open: {book_link}" },
      { key: "n5", channel: "email", at: 5 * 1440, subject: "Last note from me", body: "Hi {first},\n\nIf the timing is wrong, no problem. If it is right, here is the link: {book_link}" + SIGN },
    ],
  },
  {
    id: "mc_missed", n: 4, name: "After the masterclass: did not attend", trigger: "Registered but marked as not attended",
    goal: "mcRegistered", stopOn: ["callBooked", "paid"], sales: true,
    steps: [
      { key: "replay", channel: "email", at: 0, subject: "We missed you, here is the replay", body: "Hi {first},\n\nYou could not make it, so here is the replay (48 hours): {replay_link}\nNext date: {mc_link}" + SIGN },
      { key: "wa", channel: "whatsapp", at: 5, body: "Hi {first}, we missed you. Replay (48 hours): {replay_link}. Next date: {mc_link}" },
    ],
  },
  {
    id: "call_booked", n: 5, name: "Discovery conversation booked", trigger: "Books a discovery conversation",
    goal: "callAttended", stopOn: [], sales: false,
    steps: [
      { key: "confirm", channel: "email", at: 0, subject: "Your conversation is booked", body: "Hi {first},\n\nYour conversation is on {call_time}. Link: {call_link}\n\nTwo questions to think about:\n1) What is the pattern you most want to change?\n2) What would be different in six months if it changed?" + SIGN },
      { key: "r24", channel: "email", at: -1440, rel: "event", subject: "Tomorrow: your conversation", body: "Hi {first},\n\nA reminder: {call_time}. Link: {call_link}" + SIGN },
      { key: "r2", channel: "whatsapp", at: -120, rel: "event", body: "Your conversation with {coach} is in 2 hours ({call_time}). Link: {call_link}" },
    ],
  },
  {
    id: "call_noshow", n: 5, name: "Discovery conversation: no-show", trigger: "Marked as no-show",
    goal: "callBooked", stopOn: ["paid", "declined"], sales: true,
    steps: [{ key: "resched", channel: "whatsapp", at: 15, body: "Hi {first}, we missed you today. Pick a new time here: {book_link}" }],
  },
  {
    id: "call_done", n: 5, name: "After the call: enrol follow-ups", trigger: "Marked as call done",
    goal: "enrolStarted", stopOn: ["enrolStarted", "paid", "declined"], sales: true,
    note: "Add a deadline only when the seat limit is real.",
    steps: [
      { key: "enrol", channel: "email", at: 0, subject: "Next step: enrol in {programme}", body: "Hi {first},\n\nIt was good to talk. If you'd like to go ahead, you can enrol here: {enrol_link}" + SIGN },
      { key: "d1", channel: "email", at: 1440, subject: "On the question of time", body: "Hi {first},\n\nMost people worry about finding the hours. The programme is built around a working week. Enrol here when ready: {enrol_link}" + SIGN },
      { key: "d3", channel: "whatsapp", at: 3 * 1440, body: "Hi {first}, thinking about the investment? Happy to answer any question. Enrol: {enrol_link}" },
      { key: "d6", channel: "email", at: 6 * 1440, subject: "Is this for you?", body: "Hi {first},\n\nIf you are unsure whether this is for you, reply and tell me what is holding you back. Enrol here: {enrol_link}" + SIGN },
    ],
  },
  {
    id: "enrol_unpaid", n: 6, name: "Enrolment started but unpaid", trigger: "Starts checkout, or payment pending or failed",
    goal: "paid", stopOn: ["paid"], sales: true,
    steps: [
      { key: "h1", channel: "email", at: 60, subject: "Complete your enrolment", body: "Hi {first},\n\nYou started enrolling in {programme}. Finish here: {pay_link}" + SIGN },
      { key: "h1w", channel: "whatsapp", at: 60, body: "Hi {first}, your enrolment is almost done: {pay_link}" },
      { key: "h24", channel: "email", at: 1440, subject: "Your seat is waiting", body: "Hi {first},\n\nYour enrolment is still open: {pay_link}" + SIGN },
      { key: "h24w", channel: "whatsapp", at: 1440, body: "Hi {first}, payment link for {programme}: {pay_link}" },
      { key: "h72", channel: "email", at: 4320, subject: "Do you still want your seat?", body: "Hi {first},\n\nThis is the last reminder. Payment link: {pay_link}" + SIGN },
      { key: "h72w", channel: "whatsapp", at: 4320, body: "Hi {first}, last reminder for {programme}: {pay_link}" },
    ],
    note: "After 72 hours the coach gets an alert to send a personal message.",
  },
  {
    id: "paid", n: 7, name: "Payment successful", trigger: "Payment received",
    goal: null, stopOn: [], sales: false,
    steps: [
      { key: "welcome", channel: "email", at: 0, subject: "Welcome to {programme}", body: "Hi {first},\n\nPayment received, thank you. Your receipt is attached to this order.\n\nLog in to your portal: {portal_link}\nKick-off: {kickoff}\n\nPre-work is waiting in the portal." + SIGN },
      { key: "wa", channel: "whatsapp", at: 0, body: "Payment confirmed, welcome to {programme}, {first}! Please save this number. Reply with your one goal for the six weeks." },
    ],
  },
  {
    id: "class_notices", n: 8, name: "Class, assignment and feedback notices", trigger: "Scheduled from the portal (classes, assignments, feedback, announcements)",
    goal: null, stopOn: [], sales: false, steps: [],
    note: "Sent automatically by the portal. From Week 4 every exercise message carries the boundary line and referral pathway.",
  },
  {
    id: "rescue", n: 9, name: "Drop-off rescue", trigger: "Misses a class, or an assignment is 3 days overdue",
    goal: null, stopOn: [], sales: false,
    steps: [{ key: "warm", channel: "email", at: 0, subject: "We saved your seat", body: "Hi {first},\n\nI noticed you missed a session. That happens. The replay is in your portal: {portal_link}\nIf you want to catch up together, just reply to this email." + SIGN }],
    note: "After a second miss the coach gets an alert to call personally.",
  },
  {
    id: "completed", n: 10, name: "Programme completed", trigger: "Completes the programme",
    goal: "testimonial", stopOn: [], sales: false,
    steps: [
      { key: "cert", channel: "email", at: 0, subject: "You completed {programme}", body: "Hi {first},\n\nCongratulations. Your certificate is in the portal: {portal_link}\nRetake the Pattern Check to see how far you have moved: {quiz_link}" + SIGN },
      { key: "d3", channel: "email", at: 3 * 1440, subject: "Three quick questions", body: "Hi {first},\n\nWould you share your experience? Three questions, text or a voice-note link, and a tick to say we may use it: {testimonial_link}" + SIGN },
      { key: "d7", channel: "email", at: 7 * 1440, subject: "Know someone who needs this?", body: "Hi {first},\n\nIf someone in your life is stuck in a pattern they cannot see, send them this: {mc_link}. Alumni hear first about the next cohort." + SIGN },
    ],
  },

  {
    id: "lead_magnet", n: 11, name: "Lead magnet form", trigger: "Downloads the free resource on the website",
    goal: null, stopOn: [], sales: false,
    steps: [
      { key: "deliver", channel: "email", at: 0, subject: "Your free resource is here", body: "Hi {first},\n\nThank you for downloading it. Here is your free resource: {resource_link}\n\nWhen you are ready to go deeper, {programme} is a live six-week programme with {coach}." + SIGN },
      { key: "optin", channel: "whatsapp", at: 1, body: "Hi {first}, you're opted in for updates from {coach}. Your free resource is in your inbox. Reply STOP any time to opt out." },
    ],
  },
  {
    id: "application", n: 12, name: "Application sent", trigger: "Submits the application form on the website",
    goal: "paid", stopOn: ["paid", "declined"], sales: true,
    steps: [
      { key: "received", channel: "email", at: 0, subject: "We have your application", body: "Hi {first},\n\nThank you for applying to {programme}. We read every application and will reply within a few working days." + SIGN },
      { key: "f1", channel: "email", at: 2 * 1440, subject: "A question about your application", body: "Hi {first},\n\nThank you again for applying. If anything about the programme is unclear, just reply to this email. When you are ready, you can enrol here: {enrol_link}" + SIGN },
      { key: "f1w", channel: "whatsapp", at: 2 * 1440, body: "Hi {first}, thanks for applying to {programme}! Any questions before you enrol? {enrol_link}" },
      { key: "f2", channel: "email", at: 4 * 1440, subject: "What the six weeks look like", body: "Hi {first},\n\nEach week has one live class, short lessons in the portal and one assignment with feedback. Enrol here: {enrol_link}" + SIGN },
      { key: "f3", channel: "email", at: 7 * 1440, subject: "Your seat for the next cohort", body: "Hi {first},\n\nSeats are limited per cohort. This is my last note about it. Enrol here: {enrol_link}" + SIGN },
    ],
  },
  {
    id: "refund", n: 13, name: "Refund processed", trigger: "An admin refunds the programme order",
    goal: null, stopOn: [], sales: false,
    steps: [
      { key: "confirm", channel: "email", at: 0, subject: "Your refund has been processed", body: "Hi {first},\n\nYour refund of {amount} for {programme} has been processed. Banks usually take 5–7 working days to show it.\nRefund reference: {refund_id}\n\nYour portal access has been closed." + SIGN },
      { key: "status", channel: "whatsapp", at: 0, body: "Hi {first}, your refund of {amount} for {programme} has been processed. It usually reaches your account in 5–7 working days." },
    ],
  },
];

export const FLOW_BY_ID = Object.fromEntries(FLOWS.map((f) => [f.id, f])) as Record<string, FlowDef>;

/** Milestone → workflow started when it is reached. */
export const MILESTONE_FLOW: Partial<Record<Milestone, string>> = {
  pattern: "pattern_done",
  mcRegistered: "mc_registered",
  mcAttended: "mc_attended",
  mcMissed: "mc_missed",
  callBooked: "call_booked",
  callNoShow: "call_noshow",
  callDone: "call_done",
  enrolStarted: "enrol_unpaid",
  paid: "paid",
  missedClass: "rescue",
  completed: "completed",
};

export const fill = (tpl: string, vars: Record<string, string | undefined>) => tpl.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));

export const PLATFORMS = ["Instagram", "YouTube", "LinkedIn", "Facebook", "WhatsApp", "Other"] as const;

export const DEFAULT_CONSENT = "Your answers will be used to prepare for our conversation.";
