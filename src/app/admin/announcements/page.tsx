"use client";
import { useState } from "react";
import { toast } from "@/lib/client";
import { adminAct, useAdminData } from "@/lib/adminClient";
import type { AAnnouncement } from "@/lib/adminTypes";
import { Btn, Confirm, EmptyBox, Field, Panel, Title, areaCls, inputCls } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";
import { ErrorBox, PageHead, when } from "@/components/admin/ui";

const AUD: [string, string][] = [["all", "All creators"], ["basic", "Basic plan"], ["pro", "Pro plan"], ["advanced", "Advanced plan"], ["ultimate", "Ultimate plan"]];

export default function Announcements() {
  const { data, loading, error, reload } = useAdminData<{ announcements: AAnnouncement[] }>("/api/admin/announcements");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<AAnnouncement | null>(null);

  async function send() {
    if (title.trim().length < 3) return toast("Add a title (at least 3 characters)", "err");
    if (body.trim().length < 5) return toast("Write a message (at least 5 characters)", "err");
    setBusy(true);
    try {
      const r = await adminAct<{ recipients: number }>("POST", "/api/admin/announcements", { title, body, audience });
      toast(`Sent to ${r.recipients} creator${r.recipients === 1 ? "" : "s"}`);
      setTitle("");
      setBody("");
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) return <ErrorBox message={error} retry={reload} />;

  return (
    <>
      <PageHead title="Announcements" sub="Broadcast a message to creators. It appears in their notification bell." />
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Panel className="h-fit p-5">
          <Title>New announcement</Title>
          <div className="mt-4 space-y-4">
            <Field label="Audience"><select className={inputCls} value={audience} onChange={(e) => setAudience(e.target.value)}>{AUD.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="Title" required><input className={inputCls} maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scheduled maintenance on Sunday" /></Field>
            <Field label="Message" required hint={`${body.length}/500`}><textarea className={`${areaCls} min-h-28`} maxLength={500} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
            <div className="rounded-lg bg-[#f7f7f8] p-3 text-[12px]">
              <p className="mb-1 text-[#9b9bab]">Preview in the bell menu</p>
              <p className="text-[13px]">📢 {title || "Title"} — {body || "Your message"}</p>
            </div>
            <Btn disabled={busy} onClick={send} icon="send">{busy ? "Sending…" : "Send announcement"}</Btn>
          </div>
        </Panel>
        <Panel className="p-5" delay={0.05}>
          <Title sub="Deleting one removes it from every creator's notifications">Sent announcements</Title>
          {loading ? <div className="mt-4 h-24 animate-pulse rounded bg-[#f2f2f2]" /> : (data?.announcements || []).length === 0 ? <EmptyBox title="Nothing sent yet" /> : (
            <div className="mt-4 space-y-3">
              {data!.announcements.map((a) => (
                <div key={a.id} className="animate-soft-fade rounded-[10px] border border-[#ededed] p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fdefdf] text-[#f2962c]"><Icon name="bell" className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{a.title}</p>
                      <p className="mt-0.5 text-[13px] text-[#4a4a59]">{a.body}</p>
                      <p className="mt-2 text-[11px] text-[#9b9bab]">{when(a.createdAt)} · to {a.audience === "all" ? "all creators" : `${a.audience} plan`} · {a.recipients} recipient{a.recipients === 1 ? "" : "s"} · by {a.admin}</p>
                    </div>
                    <Btn variant="danger" className="h-8 px-3 text-[12px]" onClick={() => setDel(a)}>Delete</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      {del && <Confirm title="Delete announcement?" text={<>“{del.title}” is pulled out of all {del.recipients} creators&apos; notification lists.</>} onOk={async () => { try { await adminAct("DELETE", `/api/admin/announcements/${del.id}`); toast("Announcement deleted"); } catch (e) { toast((e as Error).message, "err"); throw e; } }} onClose={() => setDel(null)} />}
    </>
  );
}
