"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Sub = { text?: string; link?: string; feedback?: string; status?: string } | null;
type P = {
  enrolled: boolean; name?: string; coach: string; programme: string; kickoff: string; boundaryLine: string; referralLine: string; quizLink: string; progress: number; completed: boolean;
  enrolment: { name: string; email?: string; phone?: string; lessonsDone: string[]; attended: string[]; missed: string[] };
  lessons: { id: string; week: number; title: string; body?: string; videoUrl?: string; fileUrl?: string }[];
  classes: { id: string; week?: number; title: string; startsAt: string; joinLink?: string; recordingUrl?: string; attended: boolean }[];
  assignments: { id: string; week: number; title: string; brief?: string; dueAt?: string; submission: Sub }[];
  updates: { id: string; title: string; body: string; createdAt: string }[];
};

const TABS = [["dash", "Dashboard"], ["live", "Live classes"], ["lessons", "Lessons"], ["asg", "Assignments"], ["res", "Resources"], ["ann", "Announcements"], ["cert", "Certificate"], ["acct", "Account"]] as const;
type Tab = (typeof TABS)[number][0];

const fmt = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";
const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" });
const signOut = async (to = "/web/login?afterLoginRedirectTo=/portal") => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = to; };

function Submit({ a, onDone }: { a: P["assignments"][number]; onDone: () => void }) {
  const [mode, setMode] = useState<"text" | "link">(a.submission?.link && !a.submission?.text ? "link" : "text");
  const [text, setText] = useState(a.submission?.text || "");
  const [link, setLink] = useState(a.submission?.link || "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = !!a.submission?.feedback;
  if (locked) return null;
  return (
    <form className="stack" onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      const r = await fetch("/api/portal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "submit", assignmentId: a.id, text: mode === "text" ? text : "", link: mode === "link" ? link : "" }) }).then((x) => x.json()).catch(() => ({ error: "Network error" }));
      setBusy(false);
      if (r.error) setMsg(r.error); else { setMsg("Submitted. You will be notified when feedback is ready."); onDone(); }
    }}>
      <div className="row" role="group" aria-label="Submission type" style={{ gap: 8 }}>
        <button type="button" className={"btn sm" + (mode === "text" ? " dk" : "")} aria-pressed={mode === "text"} onClick={() => setMode("text")}>Write text</button>
        <button type="button" className={"btn sm" + (mode === "link" ? " dk" : "")} aria-pressed={mode === "link"} onClick={() => setMode("link")}>Link a file</button>
      </div>
      {mode === "text" ? (
        <div className="field"><label htmlFor={`t-${a.id}`}>Your answer or report</label><textarea id={`t-${a.id}`} value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: 160 }} /></div>
      ) : (
        <div className="field"><label htmlFor={`l-${a.id}`}>Link to your file</label><input id={`l-${a.id}`} type="url" placeholder="https://drive.google.com/…" value={link} onChange={(e) => setLink(e.target.value)} /><span className="hint">Upload to Google Drive or Dropbox and paste a link anyone with the link can view.</span></div>
      )}
      <button className="btn pri" type="submit" disabled={busy} style={{ alignSelf: "flex-start" }}>{busy ? "Submitting…" : a.submission ? "Update submission" : "Submit assignment"}</button>
      {msg && <p className="small muted" role="status">{msg}</p>}
    </form>
  );
}

function status(a: P["assignments"][number]): [string, string] {
  if (a.submission?.feedback) return ["Feedback ready", "tag ok"];
  if (a.submission) return ["Submitted", "tag"];
  if (a.dueAt && new Date(a.dueAt).getTime() < Date.now()) return ["Overdue", "tag bad"];
  return [a.dueAt ? `Due ${day(a.dueAt)}` : "Open", "tag warn"];
}

export default function Portal() {
  const [p, setP] = useState<P | null>(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("dash");
  const load = useCallback(async () => {
    const r = await fetch("/api/portal");
    if (r.status === 401) { window.location.href = "/web/login?afterLoginRedirectTo=/portal"; return; }
    setP(await r.json());
  }, []);
  useEffect(() => { load().catch((e) => setErr(e.message)); }, [load]);
  const act = async (body: unknown) => { await fetch("/api/portal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); load(); };

  const weeks = useMemo(() => (p?.enrolled ? [...new Set([...p.lessons.map((l) => l.week), ...p.assignments.map((a) => a.week), ...p.classes.map((c) => c.week || 0)])].filter((w) => w > 0).sort((a, b) => a - b) : []), [p]);

  if (err) return <p className="wrap sec">{err}</p>;
  if (!p) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F3F5F2" }} role="status" aria-label="Loading"><div className="ph" style={{ minHeight: 0, width: 44, height: 44, borderRadius: 999 }} /></div>;
  if (!p.enrolled) return (
    <div className="app-shell" style={{ display: "grid", placeItems: "center", padding: 24 }}>
      <div className="card stack lg" style={{ maxWidth: 480, textAlign: "center" }}>
        <h1 className="h2" style={{ fontSize: 30 }}>You&apos;re not enrolled yet</h1>
        <p className="muted">Sign in with the email you enrolled with, or enrol first.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link className="btn pri" href="/nitienaa/enrol">Enrol</Link>
          <button className="btn" onClick={() => signOut()}>Use a different email</button>
        </div>
      </div>
    </div>
  );

  const done = new Set(p.enrolment.lessonsDone);
  const first = p.enrolment.name.split(" ")[0];
  const nowMs = Date.now();
  const nextClass = p.classes.find((c) => new Date(c.startsAt).getTime() > nowMs - 2 * 36e5);
  const dueSoon = p.assignments.filter((a) => !a.submission).sort((a, b) => String(a.dueAt || "9").localeCompare(String(b.dueAt || "9")))[0];
  const currentWeek = nextClass?.week || dueSoon?.week || weeks[weeks.length - 1] || 1;
  const files = p.lessons.filter((l) => l.fileUrl || l.videoUrl);
  const weekStatus = (w: number): [string, string] => {
    const ls = p.lessons.filter((l) => l.week === w); const as = p.assignments.filter((a) => a.week === w);
    const total = ls.length + as.length; const n = ls.filter((l) => done.has(l.id)).length + as.filter((a) => a.submission).length;
    if (total && n === total) return ["Complete", "tag ok"];
    if (n > 0 || w === currentWeek) return ["In progress", "tag sun"];
    return [w < currentWeek ? "Behind" : "Up next", w < currentWeek ? "tag bad" : "tag"];
  };

  return (
    <div className="app-shell">
      <header style={{ background: "#13212B", color: "#FFFFFF" }}>
        <div className="app-top">
          <Link href="/nitienaa" className="logo logo--light">
            <span className="logo__name" style={{ fontSize: 22 }}>{p.coach}</span>
            <span className="logo__tag mono" style={{ fontSize: 10 }}>LEARNING PORTAL</span>
          </Link>
          <div className="row" style={{ gap: 12 }}>
            <span className="tag sun">{p.programme} · Week {currentWeek}</span>
            <button className="navbtn" onClick={() => setTab("ann")} style={{ color: "#FFFFFF" }} aria-label={`Announcements${p.updates.length ? `, ${p.updates.length}` : ""}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
              {p.updates.length > 0 && <span style={{ background: "#F0A830", color: "#13212B", borderRadius: 999, fontSize: 12, padding: "0 7px", fontWeight: 700 }}>{Math.min(p.updates.length, 9)}</span>}
            </button>
            <button className="navbtn" onClick={() => setTab("acct")} style={{ color: "#FFFFFF" }}>
              <span style={{ width: 32, height: 32, borderRadius: 999, background: "#2C7A71", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{first[0]}</span>{first}
            </button>
            <button className="navbtn" onClick={() => signOut("/web/login")} style={{ color: "#FFFFFF" }}>Log out</button>
          </div>
        </div>
      </header>

      <div className="app-body">
        <nav className="side" aria-label="Portal">
          {TABS.map(([id, label]) => <button key={id} className={"sidebtn" + (tab === id ? " on" : "")} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{label}</button>)}
        </nav>

        <main className="main stack lg">
          {tab === "dash" && (
            <div className="stack lg">
              <div className="stack" style={{ gap: 4 }}><p className="small muted">{p.programme}{p.kickoff ? ` · Kick-off ${p.kickoff}` : ""}</p><h1 className="h2" style={{ fontSize: 36 }}>Welcome back, {first}</h1></div>
              <div className="card stack">
                <div className="row between"><strong>Your progress</strong><span className="mono small">{p.progress}% complete</span></div>
                <div className="bar" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} style={{ height: 14 }}><span style={{ width: `${p.progress}%` }} /></div>
                {p.completed ? <p className="small">You have completed the programme. <button className="navbtn" style={{ display: "inline", padding: 0, minHeight: 0, color: "#1E5B55" }} onClick={() => setTab("cert")}>View your certificate</button></p> : <p className="small muted">Finish every lesson and submit every assignment to unlock your certificate.</p>}
              </div>
              <div className="g2" style={{ gap: 20 }}>
                <div className="card stack" style={{ background: "#13212B", color: "#FFFFFF", borderColor: "#13212B" }}>
                  <p className="eyebrow" style={{ color: "#F0A830" }}>Next live class</p>
                  {nextClass ? (<>
                    <h2 className="h3">{nextClass.week ? `Week ${nextClass.week} · ` : ""}{nextClass.title}</h2>
                    <p style={{ color: "#C3CED3" }}>{fmt(nextClass.startsAt)}</p>
                    <div className="row">{nextClass.joinLink ? <a className="btn pri sm" href={nextClass.joinLink} target="_blank" rel="noreferrer">Join class</a> : <span className="small" style={{ color: "#C3CED3" }}>Join link appears here before class</span>}<span className="small" style={{ color: "#C3CED3" }}>Reminder by email and WhatsApp</span></div>
                  </>) : <p style={{ color: "#C3CED3" }}>No upcoming classes scheduled yet.</p>}
                </div>
                <div className="card stack">
                  <p className="eyebrow">Due soon</p>
                  {dueSoon ? (<>
                    <h2 className="h3">Week {dueSoon.week} · {dueSoon.title}</h2>
                    <p className="muted">{dueSoon.dueAt ? `Due ${day(dueSoon.dueAt)}` : "No due date"} · Submit text or a file link</p>
                    <button className="btn dk sm" onClick={() => setTab("asg")} style={{ alignSelf: "flex-start" }}>Open assignment</button>
                  </>) : <p className="muted">You are all caught up.</p>}
                </div>
              </div>
              <div className="card stack">
                <h2 className="h3">Week by week</h2>
                {weeks.length === 0 && <p className="muted">Your coach hasn&apos;t added the programme content yet.</p>}
                {weeks.map((w) => (
                  <div className="row between portal-week" key={w}>
                    <div className="row" style={{ gap: 14 }}><span className="mono small" style={{ color: "#1E5B55", width: 64 }}>WEEK {w}</span><span>{p.lessons.find((l) => l.week === w)?.title || p.classes.find((c) => c.week === w)?.title || `Week ${w}`}</span></div>
                    <span className={weekStatus(w)[1]}>{weekStatus(w)[0]}</span>
                  </div>
                ))}
              </div>
              {p.updates[0] && <div className="card stack" style={{ border: "2px solid #F0A830" }}><p className="eyebrow">Latest announcement</p><strong>{p.updates[0].title}</strong><p className="muted" style={{ whiteSpace: "pre-wrap" }}>{p.updates[0].body}</p></div>}
            </div>
          )}

          {tab === "live" && (
            <div className="stack lg">
              <h1 className="h2" style={{ fontSize: 36 }}>Live classes</h1>
              {p.classes.length === 0 ? <p className="muted">No classes scheduled yet.</p> : (
                <div className="tbl"><table>
                  <thead><tr><th>Week</th><th>Class</th><th>When</th><th>Status</th><th /></tr></thead>
                  <tbody>{p.classes.map((c) => {
                    const past = new Date(c.startsAt).getTime() < nowMs - 2 * 36e5;
                    return (
                      <tr key={c.id}><td className="mono">{c.week || "—"}</td><td>{c.title}</td><td>{fmt(c.startsAt)}</td>
                        <td><span className={c.attended ? "tag ok" : past ? "tag" : "tag sun"}>{c.attended ? "Attended" : past ? "Finished" : "Upcoming"}</span></td>
                        <td>{past ? (c.recordingUrl ? <a className="btn sm" href={c.recordingUrl} target="_blank" rel="noreferrer">Watch recording</a> : <span className="small muted">Recording soon</span>) : c.joinLink ? <a className="btn sm dk" href={c.joinLink} target="_blank" rel="noreferrer">Join</a> : <span className="small muted">Link soon</span>}</td></tr>
                    );
                  })}</tbody>
                </table></div>
              )}
              <p className="small muted">Reminders go out by email and WhatsApp before each class.</p>
            </div>
          )}

          {tab === "lessons" && (
            <div className="stack lg">
              <h1 className="h2" style={{ fontSize: 36 }}>Lessons</h1>
              {weeks.map((w) => p.lessons.some((l) => l.week === w) && (
                <div className="card stack" key={w}>
                  <h2 className="h3">Week {w}</h2>
                  {p.lessons.filter((l) => l.week === w).map((l) => (
                    <div key={l.id} className="lesson portal-week">
                      <input type="checkbox" id={`ls-${l.id}`} checked={done.has(l.id)} onChange={(e) => act({ action: "lesson", lessonId: l.id, done: e.target.checked })} />
                      <div className="stack" style={{ gap: 6 }}>
                        <label htmlFor={`ls-${l.id}`}><strong>{l.title}</strong></label>
                        {l.body && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{l.body}</p>}
                        <div className="row" style={{ gap: 8 }}>{l.videoUrl && <a className="btn sm" href={l.videoUrl} target="_blank" rel="noreferrer">Watch</a>}{l.fileUrl && <a className="btn sm" href={l.fileUrl} target="_blank" rel="noreferrer">Download</a>}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {!p.lessons.length && <p className="muted">No lessons yet.</p>}
            </div>
          )}

          {tab === "asg" && (
            <div className="stack lg">
              <h1 className="h2" style={{ fontSize: 36 }}>Assignments and reports</h1>
              {p.assignments.map((a) => {
                const [label, cls] = status(a);
                return (
                  <div className="card stack lg" key={a.id} style={!a.submission ? { border: "2px solid #13212B" } : undefined}>
                    <div className="row between"><strong>Week {a.week} · {a.title}</strong><span className={cls}>{label}</span></div>
                    {a.brief && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{a.brief}</p>}
                    {a.week >= 4 && (p.boundaryLine || p.referralLine) && <p className="card flat small">{[p.boundaryLine, p.referralLine].filter(Boolean).join(" ")}</p>}
                    {a.submission && (a.submission.text || a.submission.link) && <div className="card flat stack" style={{ gap: 6 }}><p className="eyebrow">Your submission</p>{a.submission.text && <p style={{ whiteSpace: "pre-wrap" }}>{a.submission.text}</p>}{a.submission.link && <a href={a.submission.link} target="_blank" rel="noreferrer">{a.submission.link}</a>}</div>}
                    {a.submission?.feedback && <div className="card stack" style={{ gap: 6, background: "#E2EEEC", borderColor: "#E2EEEC" }}><p className="eyebrow">Feedback from {p.coach}</p><p style={{ whiteSpace: "pre-wrap" }}>{a.submission.feedback}</p></div>}
                    <Submit a={a} onDone={load} />
                  </div>
                );
              })}
              {!p.assignments.length && <p className="muted">No assignments yet.</p>}
            </div>
          )}

          {tab === "res" && (
            <div className="stack lg">
              <h1 className="h2" style={{ fontSize: 36 }}>Resource library</h1>
              <div className="g3" style={{ gap: 16 }}>
                {files.map((l) => (
                  <div className="card stack" style={{ padding: 22 }} key={l.id}>
                    <span className="tag" style={{ alignSelf: "flex-start" }}>{l.fileUrl ? "Download" : "Video"}</span>
                    <strong>{l.title}</strong><span className="small muted">Week {l.week}</span>
                    <a className="btn sm" href={l.fileUrl || l.videoUrl} target="_blank" rel="noreferrer" style={{ alignSelf: "flex-start" }}>{l.fileUrl ? "Download" : "Watch"}</a>
                  </div>
                ))}
              </div>
              {!files.length && <p className="muted">Downloads added to lessons appear here.</p>}
            </div>
          )}

          {tab === "ann" && (
            <div className="stack lg">
              <h1 className="h2" style={{ fontSize: 36 }}>Announcements</h1>
              {p.updates.map((u, i) => <div className="card stack" key={u.id} style={i === 0 ? { border: "2px solid #F0A830" } : undefined}><strong>{u.title}</strong><p className="muted" style={{ whiteSpace: "pre-wrap" }}>{u.body}</p><span className="small muted">{day(u.createdAt)}</span></div>)}
              {!p.updates.length && <p className="muted">No announcements yet.</p>}
            </div>
          )}

          {tab === "cert" && (
            <div className="stack lg">
              <h1 className="h2" style={{ fontSize: 36 }}>Certificate</h1>
              <div className="card stack" style={{ alignItems: "center", textAlign: "center", padding: "56px 28px", border: "2px dashed #9AA8A3" }}>
                <p className="eyebrow">Certificate of completion</p>
                <p style={{ fontFamily: "var(--font-sg)", fontSize: 40, fontWeight: 600 }}>{p.enrolment.name}</p>
                <p className="muted">{p.programme} · {p.coach}</p>
                {p.completed ? <span className="tag ok">Unlocked</span> : <span className="tag warn">Unlocks at 100% · you are at {p.progress}%</span>}
              </div>
              <div className="row">
                {p.completed ? <Link className="btn dk" href="/portal/certificate">Open and download</Link> : <button className="btn dk" disabled>Open and download</button>}
                {p.completed && p.quizLink && <Link className="btn" href={p.quizLink}>Retake the Pattern Check</Link>}
              </div>
            </div>
          )}

          {tab === "acct" && (
            <div className="stack lg">
              <h1 className="h2" style={{ fontSize: 36 }}>Account</h1>
              <div className="card stack lg">
                <div className="g2" style={{ gap: 20 }}>
                  <div className="stack" style={{ gap: 4 }}><span className="small muted">Name</span><strong>{p.enrolment.name}</strong></div>
                  <div className="stack" style={{ gap: 4 }}><span className="small muted">Email</span><strong>{p.enrolment.email || "—"}</strong></div>
                  <div className="stack" style={{ gap: 4 }}><span className="small muted">WhatsApp</span><strong>{p.enrolment.phone || "—"}</strong></div>
                </div>
                <p className="small muted">You sign in with a one-time code sent to your email, so there is no password to reset. To change your details, write to {p.coach} via the contact page.</p>
                <div className="row"><Link className="btn" href="/nitienaa/contact">Contact</Link><button className="btn dk" onClick={() => signOut("/web/login")}>Log out</button></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
