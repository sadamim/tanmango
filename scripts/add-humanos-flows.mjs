// One-time patch: adds the three website workflows (lead magnet, application, refund) to the
// workflow list in src/lib/growth/model.ts. Safe to run twice.  Usage:  node scripts/add-humanos-flows.mjs
import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "src", "lib", "growth", "model.ts");
let src = fs.readFileSync(file, "utf8");
if (src.includes('id: "lead_magnet"')) {
  console.log("Workflows already added. Nothing to do.");
  process.exit(0);
}

const flows = `
  {
    id: "lead_magnet", n: 11, name: "Lead magnet form", trigger: "Downloads the free resource on the website",
    goal: null, stopOn: [], sales: false,
    steps: [
      { key: "deliver", channel: "email", at: 0, subject: "Your free resource is here", body: "Hi {first},\\n\\nThank you for downloading it. Here is your free resource: {resource_link}\\n\\nWhen you are ready to go deeper, {programme} is a live six-week programme with {coach}." + SIGN },
      { key: "optin", channel: "whatsapp", at: 1, body: "Hi {first}, you're opted in for updates from {coach}. Your free resource is in your inbox. Reply STOP any time to opt out." },
    ],
  },
  {
    id: "application", n: 12, name: "Application sent", trigger: "Submits the application form on the website",
    goal: "paid", stopOn: ["paid", "declined"], sales: true,
    steps: [
      { key: "received", channel: "email", at: 0, subject: "We have your application", body: "Hi {first},\\n\\nThank you for applying to {programme}. We read every application and will reply within a few working days." + SIGN },
      { key: "f1", channel: "email", at: 2 * 1440, subject: "A question about your application", body: "Hi {first},\\n\\nThank you again for applying. If anything about the programme is unclear, just reply to this email. When you are ready, you can enrol here: {enrol_link}" + SIGN },
      { key: "f1w", channel: "whatsapp", at: 2 * 1440, body: "Hi {first}, thanks for applying to {programme}! Any questions before you enrol? {enrol_link}" },
      { key: "f2", channel: "email", at: 4 * 1440, subject: "What the six weeks look like", body: "Hi {first},\\n\\nEach week has one live class, short lessons in the portal and one assignment with feedback. Enrol here: {enrol_link}" + SIGN },
      { key: "f3", channel: "email", at: 7 * 1440, subject: "Your seat for the next cohort", body: "Hi {first},\\n\\nSeats are limited per cohort. This is my last note about it. Enrol here: {enrol_link}" + SIGN },
    ],
  },
  {
    id: "refund", n: 13, name: "Refund processed", trigger: "An admin refunds the programme order",
    goal: null, stopOn: [], sales: false,
    steps: [
      { key: "confirm", channel: "email", at: 0, subject: "Your refund has been processed", body: "Hi {first},\\n\\nYour refund of {amount} for {programme} has been processed. Banks usually take 5–7 working days to show it.\\nRefund reference: {refund_id}\\n\\nYour portal access has been closed." + SIGN },
      { key: "status", channel: "whatsapp", at: 0, body: "Hi {first}, your refund of {amount} for {programme} has been processed. It usually reaches your account in 5–7 working days." },
    ],
  },
`;

const re = /\n\];(\s*\n\s*export const FLOW_BY_ID)/;
if (!re.test(src)) {
  console.error("Could not find the end of the FLOWS list in model.ts. Add the flows by hand (see README-HUMANOS.md).");
  process.exit(1);
}
const at = src.search(re);
const before = src.slice(0, at).replace(/\s+$/, "");
const comma = before.endsWith(",") || before.endsWith("[") ? "" : ",";
src = before + comma + "\n" + flows + "];" + src.slice(at).replace(/^\n\];/, "");
fs.writeFileSync(file, src);
console.log("Added workflows: lead_magnet, application, refund.");
