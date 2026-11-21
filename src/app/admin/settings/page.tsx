"use client";
import { useAdminData } from "@/lib/adminClient";
import { Note, Panel, Pill, StatCard, Title } from "@/components/dash/kit";
import { ErrorBox, PageHead } from "@/components/admin/ui";

type S = { admins: string[]; you: string; env: string; otpOnScreen: boolean; users: number; sessions: number; dbBytes: number; uploads: { files: number; bytes: number }; collections: { name: string; count: number }[] };
const size = (b: number) => (b > 1024 ** 2 ? `${(b / 1024 ** 2).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function Settings() {
  const { data: s, loading, error, reload } = useAdminData<S>("/api/admin/settings");
  if (error && !s) return <ErrorBox message={error} retry={reload} />;
  if (loading || !s) return <div className="h-64 animate-pulse rounded-[10px] bg-white" />;

  return (
    <>
      <PageHead title="Settings" sub="Platform configuration and health." />
      <div className="mb-4 flex flex-wrap gap-3">
        <StatCard icon="customers" label="Accounts" value={s.users} />
        <StatCard icon="lock" label="Active sessions" value={s.sessions} delay={0.04} />
        <StatCard icon="products" label="Database file" value={size(s.dbBytes)} sub="data/db.json" delay={0.08} />
        <StatCard icon="upload" label="Uploaded files" value={s.uploads.files} sub={size(s.uploads.bytes)} delay={0.12} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-5">
          <Title sub="Who can open this panel">Administrators</Title>
          <div className="mt-4 divide-y divide-[#f0f0f0] rounded-[10px] border border-[#ededed]">
            {s.admins.length === 0 && <p className="p-4 text-[13px] text-[#9b9bab]">No admins configured</p>}
            {s.admins.map((a) => <div key={a} className="flex items-center justify-between px-4 py-3 text-[14px]">{a}{a === s.you.toLowerCase() && <Pill tone="blue">You</Pill>}</div>)}
          </div>
          <div className="mt-4"><Note tone="blue">Admins are set by the <code>ADMIN_EMAILS</code> variable in <code>.env.local</code> (comma separated), then restart the server. There&apos;s intentionally no button to grant admin rights in the UI.</Note></div>
        </Panel>

        <Panel className="p-5" delay={0.05}>
          <Title sub="Read-only">Environment</Title>
          <dl className="mt-4 space-y-3 text-[14px]">
            <div className="flex justify-between"><dt className="text-[#6b6b7b]">Mode</dt><dd><Pill tone={s.env === "production" ? "green" : "orange"}>{s.env}</Pill></dd></div>
            <div className="flex justify-between"><dt className="text-[#6b6b7b]">OTP shown on screen</dt><dd>{s.otpOnScreen ? <Pill tone="orange">Yes (dev)</Pill> : <Pill tone="grey">No</Pill>}</dd></div>
            <div className="flex justify-between"><dt className="text-[#6b6b7b]">Payments</dt><dd><Pill tone="orange">Test mode</Pill></dd></div>
          </dl>
          {s.otpOnScreen && <div className="mt-4"><Note tone="yellow">Login codes are displayed in the browser because no SMS/email provider is connected. Wire one up before real users sign in.</Note></div>}
        </Panel>
      </div>

      <Panel className="mt-5 p-5" delay={0.1}>
        <Title sub="Rows stored per collection">Database</Title>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {s.collections.map((c) => <div key={c.name} className="flex items-center justify-between rounded-lg bg-[#f7f7f8] px-3 py-2 text-[13px]"><span className="font-mono">{c.name}</span><b>{c.count}</b></div>)}
        </div>
      </Panel>
    </>
  );
}
