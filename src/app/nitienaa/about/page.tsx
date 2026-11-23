import TopicPage from '@/components/coach/TopicPage';
import { AboutSection, StoriesSection } from '@/components/coach/Sections';

export const metadata = {
  title: 'About Nitienaa',
  description: 'Meet Nitienaa, the person behind THE HUMAN OS™, and read stories from learners who completed it.',
};

export default function About() {
  return (
    <TopicPage id="about">
      <AboutSection />
      <StoriesSection />
    </TopicPage>
  );
}
