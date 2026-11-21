"use client";
import { useState } from "react";
import { downloadCsv, toast, useCollection, useMe } from "@/lib/client";
import { Btn, Panel, Select, Title } from "@/components/dash/kit";
import { COMMISSION } from "@/components/dash/nav";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function TaxReports() {
  const { me } = useMe();
  const sales = useCollection("sales");
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(String(thisYear));
  const rate = COMMISSION[me.plan] ?? 0.1;

  function download(m: number) {
    const key = `${year}-${String(m + 1).padStart(2, "0")}`;
    const rows = sales.rows.filter((s) => s.createdAt.startsWith(key) && s.status === "Success");
    if (!rows.length) return toast(`No transactions in ${MONTHS[m]} ${year}`, "err");
    downloadCsv(`tax-report-${key}.csv`, ["Date", "Invoice", "Customer", "Email", "Mango", "Gross (INR)", "Platform fee (INR)", "GST on fee 18% (INR)", "TCS 1% (INR)", "Net (INR)"], rows.map((s) => {
      const gross = Number(s.amount || 0);
      const fee = gross * rate;
      const gst = fee * 0.18;
      const tcs = gross * 0.01;
      return [s.createdAt.slice(0, 10), `INV-${s.id.slice(0, 6).toUpperCase()}`, String(s.customer), String(s.email), String(s.mango), gross, fee.toFixed(2), gst.toFixed(2), tcs.toFixed(2), (gross - fee - gst - tcs).toFixed(2)];
    }));
  }

  return (
    <Panel className="p-5">
      <Title right={<Select value={year} onChange={setYear} options={[thisYear, thisYear - 1, thisYear - 2].map(String)} />}>Tax Reports</Title>
      <table className="mt-4 w-full text-left text-[14px]">
        <thead><tr className="border-b border-[#f0f0f0]"><th className="px-4 py-4 font-medium">Month</th><th className="px-4 py-4 text-right font-medium">Action</th></tr></thead>
        <tbody>
          {MONTHS.map((m, i) => {
            const future = Number(year) === thisYear && i > new Date().getMonth();
            return (
              <tr key={m} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-3">{m}</td>
                <td className="px-4 py-3 text-right"><Btn variant="soft" disabled={future} onClick={() => download(i)}>Download Report</Btn></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}
