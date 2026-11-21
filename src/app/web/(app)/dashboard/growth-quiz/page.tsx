"use client";
import { useEffect, useState } from "react";
import { api, copy, toast } from "@/lib/client";
import { Btn, Field, Note, Panel, Title, areaCls, inputCls } from "@/components/dash/kit";
import { Section, origin, useGrowthDoc, type GrowthDoc } from "@/components/growth/shared";
import { DEFAULT_CONSENT, DEFAULT_RULES } from "@/lib/growth/model";

type Quiz = NonNullable<GrowthDoc["quiz"]>;
const uid = () => Math.random().toString(36).slice(2, 8);

export default function GrowthQuiz() {
  const { g, ready, save } = useGrowthDoc();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [s, setS] = useState<Record<string, string>>({});
  const [emails, setEmails] = useState<NonNullable<GrowthDoc["resultEmails"]>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!g) return;
    setQuiz(g.quiz ? JSON.parse(JSON.stringify(g.quiz)) : null);
    setEmails(g.resultEmails ? JSON.parse(JSON.stringify(g.resultEmails)) : {});
    setS({ slug: g.slug, alertEmail: g.alertEmail || "", alertWhatsapp: g.alertWhatsapp || "", consentLine: g.consentLine || DEFAULT_CONSENT, coachName: g.coachName || "", programme: g.programme || "" });
  }, [g]);

  if (!ready || !quiz) return <div className="h-40 animate-pulse rounded-lg bg-white" />;
  const url = `${origin()}/q/${s.slug}`;
  const setP = (i: number, patch: Partial<Quiz["patterns"][number]>) => setQuiz({ ...quiz, patterns: quiz.patterns.map((p, k) => (k === i ? { ...p, ...patch } : p)) });
  const setRule = (k: keyof Quiz["rules"], v: string) => setQuiz({ ...quiz, rules: { ...quiz.rules, [k]: Number(v) } });

  async function submit(patch: Record<string, unknown>, ok: string) {
    setBusy(true);
    try {
      await save(patch);
      toast(ok);
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Panel className="p-5">
        <Title sub="An online, self-scoring form. It saves every answer to the lead's record and alerts you.">Pattern Check</Title>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md bg-[#f7f7f8] px-3 py-2 text-[13px]">
          <span className="font-medium">Public link:</span> <code className="break-all">{url}</code>
          <Btn variant="outline" className="!h-7 !px-2 text-[12px]" onClick={() => copy(url)}>Copy</Btn>
          <a className="text-[#1677ff] underline" href={url} target="_blank" rel="noreferrer">Open</a>
        </div>
        <div className="mt-3"><Note tone="yellow">The patterns, bullets and scores below are <b>sample content</b>. Replace them with your own four patterns before sharing the link.</Note></div>
      </Panel>

      <Section title="Page and alerts">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your public link name" hint="Used in every public link: /q/<name>, /m/<name>, /call/<name>"><input className={inputCls} value={s.slug || ""} onChange={(e) => setS({ ...s, slug: e.target.value.toLowerCase() })} /></Field>
          <Field label="Name shown on pages"><input className={inputCls} value={s.coachName || ""} onChange={(e) => setS({ ...s, coachName: e.target.value })} /></Field>
          <Field label="Programme name"><input className={inputCls} value={s.programme || ""} onChange={(e) => setS({ ...s, programme: e.target.value })} /></Field>
          <Field label="Alert email" hint="Gets one alert for every completed Pattern Check"><input className={inputCls} type="email" value={s.alertEmail || ""} onChange={(e) => setS({ ...s, alertEmail: e.target.value })} /></Field>
          <Field label="Alert WhatsApp number" hint="Optional. Needs WhatsApp set up (TWILIO_WHATSAPP_FROM)."><input className={inputCls} inputMode="numeric" maxLength={10} value={s.alertWhatsapp || ""} onChange={(e) => setS({ ...s, alertWhatsapp: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label="Consent line shown on every form"><input className={inputCls} value={s.consentLine || ""} onChange={(e) => setS({ ...s, consentLine: e.target.value })} /></Field>
        </div>
        <div className="mt-4 flex gap-2">
          <Btn disabled={busy} onClick={() => submit(s, "Saved")}>Save</Btn>
          <Btn variant="outline" onClick={async () => { await api("/api/growth", "POST", { action: "test-alert" }); toast("Test alert sent"); }}>Send test alert</Btn>
        </div>
      </Section>

      <Section title="Patterns, statements and scores" sub="A pattern's score is the total of the statements picked under it, shown as a percentage of that pattern's maximum.">
        <div className="space-y-5">
          {quiz.patterns.map((p, i) => (
            <div key={p.id} className="rounded-lg border border-[#ededed] p-4">
              <div className="flex gap-2">
                <input className={`${inputCls} font-semibold`} value={p.name} placeholder="Pattern name" onChange={(e) => setP(i, { name: e.target.value })} />
                <Btn variant="danger" disabled={quiz.patterns.length <= 2} onClick={() => setQuiz({ ...quiz, patterns: quiz.patterns.filter((_, k) => k !== i) })}>Remove</Btn>
              </div>
              <input className={`${inputCls} mt-2`} value={p.blurb || ""} placeholder="One line shown on the result" onChange={(e) => setP(i, { blurb: e.target.value })} />
              <div className="mt-3 space-y-2">
                {p.bullets.map((b, j) => (
                  <div key={b.id} className="flex gap-2">
                    <input className={inputCls} value={b.text} placeholder="Statement" onChange={(e) => setP(i, { bullets: p.bullets.map((x, k) => (k === j ? { ...x, text: e.target.value } : x)) })} />
                    <input className={`${inputCls} !w-20`} type="number" min={0} value={b.score} title="Score" onChange={(e) => setP(i, { bullets: p.bullets.map((x, k) => (k === j ? { ...x, score: Number(e.target.value) } : x)) })} />
                    <Btn variant="ghost" disabled={p.bullets.length <= 1} onClick={() => setP(i, { bullets: p.bullets.filter((_, k) => k !== j) })}>✕</Btn>
                  </div>
                ))}
                <Btn variant="soft" onClick={() => setP(i, { bullets: [...p.bullets, { id: uid(), text: "", score: 1 }] })}>+ Add statement</Btn>
              </div>
            </div>
          ))}
          <Btn variant="outline" disabled={quiz.patterns.length >= 8} onClick={() => setQuiz({ ...quiz, patterns: [...quiz.patterns, { id: uid(), name: "", bullets: [{ id: uid(), text: "", score: 1 }] }] })}>+ Add pattern</Btn>
        </div>
      </Section>

      <Section title="Result rules" sub="Editable. These are the draft rules from the brief, for you to confirm.">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Pattern is present at (%)"><input className={inputCls} type="number" value={quiz.rules.present} onChange={(e) => setRule("present", e.target.value)} /></Field>
          <Field label="Blend within (points)"><input className={inputCls} type="number" value={quiz.rules.blend} onChange={(e) => setRule("blend", e.target.value)} /></Field>
          <Field label="“Low across all 4” below (%)"><input className={inputCls} type="number" value={quiz.rules.lowBelow} onChange={(e) => setRule("lowBelow", e.target.value)} /></Field>
          <Field label="“High across all 4” from (%)"><input className={inputCls} type="number" value={quiz.rules.highFrom} onChange={(e) => setRule("highFrom", e.target.value)} /></Field>
        </div>
        <p className="mt-2 text-[12.5px] text-[#6b6b7b]">Primary = highest present pattern. Blend of 2 or 3 = other present patterns within the blend range of the primary. Single = one clearly ahead.</p>
        <div className="mt-4 flex gap-2">
          <Btn disabled={busy} onClick={() => submit({ quiz }, "Pattern Check saved")}>Save patterns and rules</Btn>
          <Btn variant="outline" onClick={() => setQuiz({ ...quiz, rules: DEFAULT_RULES })}>Reset rules</Btn>
        </div>
      </Section>

      <Section title="Result emails" sub="One email per primary pattern. A blend gets the primary version plus one line about the second pattern. Use {first}, {pattern}, {pct}, {secondary_line}, {result_link}, {mc_link}, {coach}, {programme}.">
        <div className="space-y-4">
          {quiz.patterns.map((p) => {
            const e = emails[p.id] || {};
            const set = (k: string, v: string) => setEmails({ ...emails, [p.id]: { ...e, [k]: v } });
            return (
              <div key={p.id} className="rounded-lg border border-[#ededed] p-4">
                <p className="mb-2 font-semibold">{p.name || "Unnamed pattern"}</p>
                <input className={inputCls} placeholder="Subject (blank = default)" value={e.subject || ""} onChange={(x) => set("subject", x.target.value)} />
                <textarea className={`${areaCls} mt-2 min-h-28`} placeholder="Body (blank = default)" value={e.body || ""} onChange={(x) => set("body", x.target.value)} />
                <input className={`${inputCls} mt-2`} placeholder="PDF link (upload in TagMango Cloud, then paste the file link)" value={e.pdfUrl || ""} onChange={(x) => set("pdfUrl", x.target.value)} />
              </div>
            );
          })}
          <Btn disabled={busy} onClick={() => submit({ resultEmails: emails }, "Result emails saved")}>Save result emails</Btn>
        </div>
        <p className="mt-3 text-[12.5px] text-[#6b6b7b]">The email contains a link to the on-screen result and your PDF link, rather than an attached file.</p>
      </Section>
    </div>
  );
}
