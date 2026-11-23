import TopicPage from '@/components/coach/TopicPage';
import { BlogSection, ArticleSection, FreeResourceSection } from '@/components/coach/Sections';

export const metadata = {
  title: 'Resources',
  description: 'Articles from Nitienaa, the latest post, and a free resource delivered to your inbox.',
};

export default function Resources() {
  return (
    <TopicPage id="resources">
      <BlogSection />
      <ArticleSection />
      <FreeResourceSection />
    </TopicPage>
  );
}
