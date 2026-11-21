"use client";
import { useState } from "react";
import { ago, toast, useCollection, useMe, type Row } from "@/lib/client";
import { Btn, EmptyBox, Panel, areaCls } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";

function Post({ p, comments }: { p: Row; comments: ReturnType<typeof useCollection> }) {
  const { me } = useMe();
  const posts = useCollection("posts");
  const reports = useCollection("reports");
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [text, setText] = useState("");
  const mine = comments.rows.filter((c) => c.postId === p.id).reverse();
  const liked = Boolean(p.liked);

  return (
    <Panel className="p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#ff6a00] to-[#f6bb22] font-semibold text-white">{me.name[0]?.toUpperCase()}</span>
        <div className="flex-1">
          <p className="font-semibold">{me.name} <span className="ml-1 rounded bg-[#fdefdf] px-1.5 py-0.5 text-[10px] font-semibold text-[#c7740f]">CREATOR</span></p>
          <p className="text-[12px] text-[#6b6b7b]">{ago(p.createdAt)} · {String(p.audience || "Everyone")}</p>
        </div>
        <div className="relative">
          <button aria-label="Post options" onClick={() => setMenu(!menu)} className="rounded-md p-2 text-[#6b6b7b] hover:bg-black/5"><Icon name="more" className="h-4 w-4" /></button>
          {menu && (
            <div className="animate-soft-fade absolute right-0 top-9 z-10 w-44 rounded-lg border border-[#e1e1e1] bg-white py-1 text-[14px] shadow-lg">
              <button className="block w-full px-3 py-2 text-left hover:bg-[#f7f7f7]" onClick={async () => { await posts.update(p.id, { pinned: !p.pinned }); setMenu(false); toast(p.pinned ? "Unpinned" : "Pinned to top"); }}>{p.pinned ? "Unpin post" : "Pin post"}</button>
              <button className="block w-full px-3 py-2 text-left hover:bg-[#f7f7f7]" onClick={async () => { await reports.create({ kind: "post", refId: p.id, content: String(p.text).slice(0, 200), reporter: me.name, author: me.name, authorEmail: "" }); setMenu(false); toast("Reported — see Settings › Security › Reported Content"); }}>Report post</button>
              <button className="block w-full px-3 py-2 text-left text-[#ff4d4f] hover:bg-[#fff2f0]" onClick={async () => { await posts.remove(p.id); toast("Post deleted"); }}>Delete post</button>
            </div>
          )}
        </div>
      </div>
      {p.pinned ? <p className="mt-2 text-[12px] font-medium text-[#f2962c]">📌 Pinned</p> : null}
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{String(p.text)}</p>
      <div className="mt-4 flex gap-6 border-t border-[#f0f0f0] pt-3 text-[14px] text-[#6b6b7b]">
        <button onClick={() => posts.update(p.id, { liked: !liked, likes: Math.max(0, Number(p.likes || 0) + (liked ? -1 : 1)) })} className={`flex items-center gap-1.5 transition ${liked ? "text-[#e5372e]" : "hover:text-[#0f0f0f]"}`}><Icon name="heart" className="h-5 w-5" />{Number(p.likes || 0)}</button>
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 hover:text-[#0f0f0f]"><Icon name="comment" className="h-5 w-5" />{mine.length}</button>
      </div>
      {open && (
        <div className="animate-soft-fade mt-3 space-y-2">
          {mine.map((c) => <div key={c.id} className="rounded-lg bg-[#f7f7f8] px-3 py-2 text-[14px]"><b className="mr-1">{me.name}</b>{String(c.text)}</div>)}
          <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!text.trim()) return; await comments.create({ postId: p.id, text: text.trim() }); setText(""); }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" className="h-10 flex-1 rounded-md border border-[#e1e1e1] px-3 text-[14px] outline-none focus:border-[#f2962c]" />
            <Btn>Reply</Btn>
          </form>
        </div>
      )}
    </Panel>
  );
}

export default function Feed() {
  const { me } = useMe();
  const posts = useCollection("posts");
  const comments = useCollection("comments");
  const banners = useCollection("banners");
  const mangoes = useCollection("mangoes");
  const [text, setText] = useState("");
  const [audience, setAudience] = useState("Everyone");
  const sorted = [...posts.rows].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  const live = banners.rows.filter((b) => b.active).sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {live.length > 0 && (
        <div className="flex snap-x gap-3 overflow-x-auto">
          {live.map((b) => (
            <a key={b.id} href={b.link ? String(b.link) : undefined} target="_blank" rel="noreferrer" className="relative grid aspect-[3/1] min-w-full snap-start place-items-center overflow-hidden rounded-[10px] bg-gradient-to-r from-[#3a1606] to-[#f2962c] text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {b.image ? <img src={String(b.image)} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
              <p className="relative px-4 text-center text-[20px] font-bold drop-shadow">{String(b.title)}</p>
            </a>
          ))}
        </div>
      )}
      <Panel className="p-5">
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ff6a00] to-[#f6bb22] font-semibold text-white">{me.name[0]?.toUpperCase()}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share an update with your community…" className={`${areaCls} min-h-20 flex-1 resize-none`} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className="h-9 rounded-md border border-[#e1e1e1] px-3 text-[13px] outline-none"><option>Everyone</option>{mangoes.rows.map((m) => <option key={m.id}>{String(m.title)}</option>)}</select>
          <Btn disabled={!text.trim()} onClick={async () => { await posts.create({ text: text.trim(), audience, likes: 0 }); setText(""); toast("Posted to your feed"); }}>Post</Btn>
        </div>
      </Panel>
      {sorted.length === 0 && !posts.loading && <Panel><EmptyBox title="Your feed is quiet" text="Post an update, a win or a question to get your community talking." /></Panel>}
      {sorted.map((p) => <Post key={p.id} p={p} comments={comments} />)}
    </div>
  );
}
