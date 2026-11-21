"use client";
import Link from "next/link";
import { useCollection } from "@/lib/client";
import { Btn, EmptyBox, Panel, Pill, Title } from "@/components/dash/kit";
import { Icon } from "@/components/dash/icons";

export default function CoursesTab() {
  const col = useCollection("courses");
  return (
    <div className="mx-auto max-w-6xl">
      <Panel className="p-5">
        <Title right={<Link href="/web/dashboard/courses?new=1"><Btn icon="plus">Create course</Btn></Link>}>Courses</Title>
        {col.rows.length === 0 && !col.loading ? <EmptyBox title="No courses yet" text="Build a course from Dashboard › Products › Courses." /> : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {col.rows.map((c, i) => (
              <Link key={c.id} href={`/web/courses/${c.id}`} className="animate-rise group overflow-hidden rounded-[10px] border border-[#ededed] bg-white transition hover:-translate-y-0.5 hover:shadow-md" style={{ ["--delay" as string]: `${i * 0.04}s` }}>
                <div className={`relative grid aspect-video place-items-center bg-gradient-to-br ${["from-orange-400 to-rose-500", "from-indigo-500 to-violet-600", "from-emerald-500 to-teal-600"][i % 3]}`}>
                  <Icon name="courses" className="h-10 w-10 text-white/90" />
                  <span className="absolute left-3 top-3"><Pill tone={c.published ? "green" : "grey"}>{c.published ? "Published" : "Draft"}</Pill></span>
                </div>
                <div className="p-4"><p className="font-semibold">{String(c.title)}</p><p className="mt-0.5 text-[12px] text-[#6b6b7b]">{((c.sections as { chapters: unknown[] }[]) || []).reduce((a, s) => a + s.chapters.length, 0)} chapters</p></div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
