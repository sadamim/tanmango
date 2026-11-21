import { Policy } from "@/components/growth/Policy";
export const metadata = { title: "Terms" };
export default function Terms() {
  return (
    <Policy title="Terms of use">
      <h2>About the programme</h2>
      <p>[Programme name] is a coaching and learning programme. It is not therapy, medical advice or a substitute for professional care. If you are struggling, please see a qualified professional; your coach can point you to a referral pathway.</p>
      <h2>Your account</h2>
      <p>Keep your login private. You are responsible for activity on your account.</p>
      <h2>Content</h2>
      <p>Programme materials and recordings are for enrolled learners only and may not be shared or republished.</p>
      <h2>Payments</h2>
      <p>Fees are in Indian rupees and exclusive of GST unless stated. See the <a className="underline" href="/refund-policy">refund policy</a>.</p>
      <h2>Contact</h2>
      <p>[contact email]</p>
    </Policy>
  );
}
