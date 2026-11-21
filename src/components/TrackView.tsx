"use client";
import { useEffect } from "react";

/** Fire-and-forget page view (feeds Analytics). Counted once per browser session per page. */
export default function TrackView({ kind, refId }: { kind: "checkout" | "page" | "store" | "site"; refId: string }) {
  useEffect(() => {
    const key = `tm:view:${kind}:${refId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    fetch("/api/public/view", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, ref: refId }) }).catch(() => {});
  }, [kind, refId]);
  return null;
}
