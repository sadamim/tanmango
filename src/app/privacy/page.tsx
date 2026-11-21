import { Policy } from "@/components/growth/Policy";
export const metadata = { title: "Privacy policy" };
export default function Privacy() {
  return (
    <Policy title="Privacy policy">
      <p>This explains what we collect when you use our forms, the Pattern Check, masterclass registration, call booking and learning portal, and how we use it.</p>
      <h2>What we collect</h2>
      <ul><li>Your name, email address and WhatsApp number.</li><li>Your Pattern Check answers and the scores calculated from them.</li><li>Your masterclass registration, call booking, attendance and programme progress.</li><li>Which link or platform brought you to us, and basic usage such as email opens and clicks.</li></ul>
      <h2>How we use it</h2>
      <p><b>Your answers will be used to prepare for our conversation.</b> We also use your details to send the messages you asked for (your result, reminders, class notices) and to run the programme.</p>
      <h2>WhatsApp and email</h2>
      <p>We message you on WhatsApp only if you ticked the opt-in box. Every email can be unsubscribed from. You can ask us to stop at any time.</p>
      <h2>Who can see your record</h2>
      <p>Only [coach name] and named team members. We do not sell your data. Service providers that store or send data for us (database, email, messaging) process it on our behalf.</p>
      <h2>Your rights</h2>
      <p>You can ask to see, correct or delete your data by writing to [contact email].</p>
    </Policy>
  );
}
