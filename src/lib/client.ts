"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Plan } from "@/components/dash/nav";

export type Me = {
  id: string;
  name: string;
  email: string;
  phone: string;
  about?: { category?: string; audience?: string; goal?: string };
  kycDone?: boolean;
  kyc?: { pan: string; legalName: string; status: "pending" | "verified" | "rejected"; note?: string };
  bank?: { holder: string; account: string; ifsc: string };
  plan: Plan;
  isAdmin?: boolean;
  role?: "learner";
  whiteLabel?: boolean;
  settings?: Record<string, unknown>;
  createdAt: string;
};

export type Row = { id: string; createdAt: string; [k: string]: unknown };

export const MeContext = createContext<{ me: Me; setMe: (m: Me) => void } | null>(null);
export function useMe() {
  const c = useContext(MeContext);
  if (!c) throw new Error("useMe outside dashboard");
  return c;
}

export async function api<T = unknown>(url: string, method = "GET", body?: unknown): Promise<T> {
  const r = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401) {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/web/login";
  }
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

/** Live list of one collection with create/update/remove helpers. Collections refresh each other via a window event. */
export function useCollection<T extends Row = Row>(name: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());

  const reload = useCallback(async () => {
    const { rows } = await api<{ rows: T[] }>(`/api/data/${name}`);
    setRows(rows);
    setLoading(false);
    setUpdatedAt(Date.now());
  }, [name]);

  useEffect(() => {
    reload();
    const on = (e: Event) => (e as CustomEvent).detail === name && reload();
    window.addEventListener("tm:changed", on);
    return () => window.removeEventListener("tm:changed", on);
  }, [name, reload]);

  const notify = () => window.dispatchEvent(new CustomEvent("tm:changed", { detail: name }));

  return {
    rows,
    loading,
    updatedAt,
    reload,
    create: async (data: Record<string, unknown>) => {
      const { row } = await api<{ row: T }>(`/api/data/${name}`, "POST", data);
      notify();
      return row;
    },
    update: async (id: string, data: Record<string, unknown>) => {
      const { row } = await api<{ row: T }>(`/api/data/${name}/${id}`, "PATCH", data);
      notify();
      return row;
    },
    remove: async (id: string) => {
      await api(`/api/data/${name}/${id}`, "DELETE");
      notify();
    },
  };
}

export async function patchMe(body: Record<string, unknown>) {
  return api<{ user: Me }>("/api/me", "PATCH", body);
}

export const inr = (n: number) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
export const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const fmtDateTime = (s: string) => new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function ago(t: number | string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(t).getTime()) / 1000));
  if (s < 45) return "a few seconds ago";
  if (s < 90) return "a minute ago";
  if (s < 3600) return `${Math.round(s / 60)} minutes ago`;
  if (s < 5400) return "an hour ago";
  if (s < 86400) return `${Math.round(s / 3600)} hours ago`;
  return `${Math.round(s / 86400)} days ago`;
}

export function toast(msg: string, kind: "ok" | "err" = "ok") {
  window.dispatchEvent(new CustomEvent("tm:toast", { detail: { msg, kind } }));
}

export function downloadCsv(filename: string, header: string[], rows: (string | number | null | undefined)[][]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [header.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

export function copy(text: string, what = "Link") {
  navigator.clipboard?.writeText(text).then(
    () => toast(`${what} copied`),
    () => toast("Couldn't copy — select and copy manually", "err")
  );
}
