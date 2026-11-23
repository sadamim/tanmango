import { redirect } from 'next/navigation';

// This topic is now a section of the Apply and enrol page.
export default function Page() {
  redirect('/nitienaa/apply#enrol');
}
