import Shell from "@/components/dash/Shell";

export const metadata = { title: "TagMango | Creators’ platform to host workshops and launch courses." };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
