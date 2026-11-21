"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./client";

export const adminChanged = () => window.dispatchEvent(new Event("tm:admin-changed"));

/** GET an /api/admin/* endpoint. Re-fetches whenever any admin action succeeds (see adminAct). */
export function useAdminData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());

  const reload = useCallback(async () => {
    try {
      setData(await api<T>(url));
      setError(undefined);
      setUpdatedAt(Date.now());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    reload();
    window.addEventListener("tm:admin-changed", reload);
    return () => window.removeEventListener("tm:admin-changed", reload);
  }, [reload]);

  return { data, loading, error, reload, updatedAt };
}

/** Run a mutating admin request, then refresh every admin view. Throws with the server's message on failure. */
export async function adminAct<T = unknown>(method: "POST" | "PATCH" | "DELETE", url: string, body?: unknown) {
  const r = await api<T>(url, method, body);
  adminChanged();
  return r;
}
