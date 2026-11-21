"use client";
import { useEffect, useRef, useState } from "react";

export const inputCls =
  "w-full rounded-md border border-[#d9d9d9] bg-white px-3.5 py-3 text-[14px] outline-none transition placeholder:text-[#9a9a9a] focus:border-[#fb8a1b] focus:ring-2 focus:ring-[#fb8a1b]/15";

export function PhoneInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-[#d9d9d9] transition focus-within:border-[#fb8a1b] focus-within:ring-2 focus-within:ring-[#fb8a1b]/15">
      <div className="flex items-center gap-1.5 border-r border-[#d9d9d9] px-3 text-[14px]">
        <span aria-hidden>🇮🇳</span>
        <span>+91</span>
        <svg viewBox="0 0 10 6" className="h-2 w-2 text-ink/50"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg>
      </div>
      <input
        autoFocus={autoFocus}
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder="Enter your phone number"
        className="w-full px-3 py-3 text-[14px] outline-none placeholder:text-[#9a9a9a]"
      />
    </div>
  );
}

export function OrangeButton({ children, disabled, loading, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`flex w-full items-center justify-center gap-2 rounded-md bg-[#fb8a1b] py-3 text-[14px] font-medium text-white transition hover:bg-[#f07c0c] disabled:cursor-not-allowed disabled:bg-[#f6b874] ${rest.className ?? ""}`}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  );
}

export function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="animate-soft-fade rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-600">{children}</p>;
}

export function DevOtpNote({ code }: { code?: string }) {
  if (!code) return null;
  return (
    <p className="animate-soft-fade rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
      Dev mode — no SMS/email provider is connected, so here is your OTP: <b className="tracking-widest">{code}</b>
    </p>
  );
}

export function OtpBoxes({ value, onChange, onComplete }: { value: string; onChange: (v: string) => void; onComplete?: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  // Source of truth lives in a ref so fast typing never reads a stale value.
  const digits = useRef<string[]>(Array.from({ length: 6 }, (_, i) => value[i]?.trim() || ""));
  useEffect(() => refs.current[0]?.focus(), []);
  useEffect(() => {
    if (value === "") digits.current = ["", "", "", "", "", ""];
  }, [value]);
  const emit = () => {
    const next = digits.current.map((d) => d || " ").join("").replace(/\s+$/, "");
    onChange(next);
    if (digits.current.every(Boolean)) onComplete?.(digits.current.join(""));
  };
  const set = (i: number, ch: string) => {
    digits.current[i] = ch;
    emit();
  };
  return (
    <div className="flex justify-between gap-2" onPaste={(e) => {
      const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (t) {
        e.preventDefault();
        digits.current = Array.from({ length: 6 }, (_, k) => t[k] || "");
        emit();
        refs.current[Math.min(t.length, 5)]?.focus();
      }
    }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => void (refs.current[i] = el)}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          value={digits.current[i] || ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (raw.length > 1) {
              // SMS autofill / fast entry: spread the digits across the boxes from here on
              const chars = raw.slice(0, 6 - i).split("");
              chars.forEach((c, k) => (digits.current[i + k] = c));
              emit();
              refs.current[Math.min(i + chars.length, 5)]?.focus();
              return;
            }
            set(i, raw);
            if (raw && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits.current[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          className="h-12 w-full rounded-md border border-[#d9d9d9] text-center text-lg font-semibold outline-none transition focus:border-[#fb8a1b] focus:ring-2 focus:ring-[#fb8a1b]/15"
        />
      ))}
    </div>
  );
}

export function ResendTimer({ onResend }: { onResend: () => void }) {
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    <p className="text-center text-[13px] text-ink/60">
      Didn&apos;t receive the OTP?{" "}
      {left > 0 ? (
        <span>Resend in 00:{String(left).padStart(2, "0")}</span>
      ) : (
        <button type="button" className="font-medium text-[#1a73e8]" onClick={() => { onResend(); setLeft(30); }}>
          Resend OTP
        </button>
      )}
    </p>
  );
}

export async function post<T = Record<string, unknown>>(url: string, body: unknown): Promise<T & { error?: string }> {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}
