import { redirect } from 'next/navigation';

// This topic is now a section of the About page.
export default function Page() {
  redirect('/nitienaa/about#stories');
}
