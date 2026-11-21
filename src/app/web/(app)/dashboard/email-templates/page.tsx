"use client";
import { useState } from "react";
import { patchMe, toast, useMe } from "@/lib/client";
import { Btn, Field, Modal, Panel, Title, Toggle, Walkthrough, areaCls, inputCls } from "@/components/dash/kit";

const EMAIL_TEMPLATES = [
  "Confirmation Email on Mango Purchase",
  "Reminder Email on Purchase Drop-off",
  "Reminder Email on Failed Purchase",
  "Reminder Email One Day Before Expiry",
  "Notification Email on New Post Creation",
  "Notification Email on Post Comment",
  "Notification Email on Comment Like",
  "Notification Email on Comment Reply",
  "Notification Email on Tagging Someone In A Comment",
  "Promotional Email on Mango Creation",
  "Notification Email on Single Workshop Creation",
  "Notification Email on Recurring Workshop Creation",
  "Notification Email on Rescheduling a workshop",
  "Notification Email on Workshop Cancellation",
  "Reminder Email 24 hours before Workshop",
  "Reminder Email 30 mins before Workshop",
  "Reminder Email 15 mins before Workshop",
  "Post Workshop Email 15 mins after Workshop",
  "Notification Email after subscription expired",
  "Notification Email for 10% course completion",
  "Notification Email for 50% course completion",
  "Notification Email for 100% course completion",
  "Confirmation Email on 1-1 Consultation booking",
  "Reminder Email 30 mins before 1-1 Consultation",
  "Cancellation Email on 1-1 Consultation",
];

type Tpl = { enabled?: boolean; subject?: string; body?: string };

export default function EmailAutomation() {
  const { me, setMe } = useMe();
  const s = (me.settings?.email || {}) as { fromName?: string; replyTo?: string; templates?: Record<string, Tpl> };
  const [fromName, setFromName] = useState(s.fromName || me.name);
  const [replyTo, setReplyTo] = useState(s.replyTo || me.email);
  const [edit, setEdit] = useState<string | null>(null);
  const [draft, setDraft] = useState<Tpl>({});
  const templates = s.templates || {};

  async function save(next: Partial<typeof s>, msg: string) {
    const r = await patchMe({ settings: { email: { ...s, ...next } } });
    setMe(r.user);
    toast(msg);
  }

  return (
    <>
      <Walkthrough title="Personalising emails" />
      <Panel className="p-5">
        <Title>Email Settings</Title>
        <div className="mt-4 grid max-w-2xl gap-4">
          <Field label="From Name:" required hint="This is the sender name your recipients shall see in the custom mails and broadcast mails"><input className={inputCls} placeholder="From Name" value={fromName} onChange={(e) => setFromName(e.target.value)} /></Field>
          <Field label="Reply to Email Address:" required hint="This is the email id to which your subscribers’ replies shall be routed"><input className={inputCls} type="email" placeholder="Reply to Email Address" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} /></Field>
          <div className="flex justify-end"><Btn variant="black" onClick={() => {
            if (!fromName.trim()) return toast("From name is required", "err");
            if (!/^\S+@\S+\.\S+$/.test(replyTo)) return toast("Enter a valid reply-to email", "err");
            save({ fromName: fromName.trim(), replyTo }, "Email settings saved");
          }}>Save</Btn></div>
        </div>
      </Panel>
      <Panel className="mt-5 p-5" delay={0.06}>
        <Title>Templates</Title>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead><tr className="border-b border-[#f0f0f0]"><th className="px-4 py-4 font-medium">Template Type</th><th className="w-28 px-4 py-4 font-medium">Enabled</th><th className="w-24 px-4 py-4 text-right font-medium">Actions</th></tr></thead>
            <tbody>
              {EMAIL_TEMPLATES.map((t) => {
                const cur = templates[t] || {};
                return (
                  <tr key={t} className="border-b border-[#f0f0f0] last:border-0">
                    <td className="px-4 py-3">{t}{cur.subject && <span className="ml-2 rounded bg-[#e6f4ff] px-1.5 text-[11px] text-[#1677ff]">Customised</span>}</td>
                    <td className="px-4 py-3"><Toggle on={Boolean(cur.enabled)} onChange={(v) => save({ templates: { ...templates, [t]: { ...cur, enabled: v } } }, v ? "Template enabled" : "Template disabled")} label={`Enable ${t}`} /></td>
                    <td className="px-4 py-3 text-right"><Btn variant="soft" className="h-8 px-3 text-[13px]" onClick={() => { setEdit(t); setDraft({ subject: cur.subject || t.replace(/^(Notification|Reminder|Confirmation|Promotional|Cancellation|Post Workshop) Email ?/, "") || t, body: cur.body || `Hi {name},\n\n…\n\n— ${fromName}` }); }}>Edit</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      {edit && (
        <Modal title={edit} onClose={() => setEdit(null)} wide>
          <div className="space-y-3">
            <Field label="Subject"><input className={inputCls} value={draft.subject || ""} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></Field>
            <Field label="Body" hint="Variables: {name}, {mango}, {workshop}, {link}"><textarea className={`${areaCls} min-h-48`} value={draft.body || ""} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /></Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setEdit(null)}>Cancel</Btn>
            <Btn onClick={async () => { if (!draft.subject?.trim()) return toast("Subject is required", "err"); await save({ templates: { ...templates, [edit]: { ...templates[edit], ...draft, enabled: true } } }, "Template saved"); setEdit(null); }}>Save template</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}
