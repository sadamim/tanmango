import { Policy } from "@/components/growth/Policy";
export const metadata = { title: "Refund policy" };
export default function Refund() {
  return (
    <Policy title="Refund policy">
      <h2>Programme fee</h2>
      <p>[Describe when a refund is available, for example within X days of enrolment and before the first live class.]</p>
      <h2>How to ask</h2>
      <p>Write to [contact email] with the email you enrolled with. We reply within [N] working days.</p>
      <h2>What happens next</h2>
      <p>Approved refunds are returned to the original payment method. You will get a confirmation email, and portal access ends on refund.</p>
    </Policy>
  );
}
