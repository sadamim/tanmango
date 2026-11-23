import TopicPage from '@/components/coach/TopicPage';
import { ProgrammeSection, MethodSection, EventsSection, FaqSection } from '@/components/coach/Sections';
import { getCoach } from '@/lib/coach/server';

export const metadata = {
  title: 'THE HUMAN OS™ — the 6-week programme',
  description: 'Six weeks of live classes, lessons and assignments with Nitienaa. The week-by-week plan, the method behind it, and upcoming events.',
};
export const dynamic = 'force-dynamic';

export default async function Programme() {
  const { programme } = await getCoach();
  return (
    <TopicPage id="programme">
      <ProgrammeSection programme={programme} />
      <MethodSection />
      <EventsSection />
      <FaqSection />
    </TopicPage>
  );
}
