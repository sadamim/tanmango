import { redirect } from 'next/navigation';

// This topic is now a section of the Programme page.
export default function Page() {
  redirect('/nitienaa/programme#events');
}
