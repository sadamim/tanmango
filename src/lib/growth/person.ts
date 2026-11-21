import "server-only";

/** Validate the name / email / WhatsApp fields every public funnel form sends. */
export function readPerson(body: Record<string, unknown>, opts: { phone?: boolean } = {}) {
  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
  const phone = String(body.phone || "").replace(/\D/g, "").slice(-10);
  if (!name) return { error: "Enter your name" } as const;
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email" } as const;
  if (opts.phone && phone.length !== 10) return { error: "Enter a 10-digit WhatsApp number" } as const;
  return { person: { name, email, phone, whatsappOptIn: Boolean(body.whatsappOptIn) && phone.length === 10 } } as const;
}
