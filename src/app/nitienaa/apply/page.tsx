import TopicPage from '@/components/coach/TopicPage';
import { ApplySection, EnrolSection, ConfirmationSection, FaqSection } from '@/components/coach/Sections';
import { getCoach } from '@/lib/coach/server';

export const metadata = {
  title: 'Apply and enrol',
  description: 'Apply for THE HUMAN OS™, pay securely with Razorpay, and see what happens after you enrol.',
};
export const dynamic = 'force-dynamic';

export default async function Apply() {
  const { programme, mangoId } = await getCoach();
  return (
    <TopicPage id="apply">
      <ApplySection programme={programme} />
      <EnrolSection programme={programme} mangoId={mangoId} />
      <ConfirmationSection programme={programme} />
      <FaqSection />
    </TopicPage>
  );
}
