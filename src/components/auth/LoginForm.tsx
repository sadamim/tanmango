"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DevOtpNote, ErrorText, OrangeButton, OtpBoxes, PhoneInput, ResendTimer, inputCls, post } from "./fields";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [via, setVia] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"id" | "otp">("id");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const ident = via === "phone" ? { phone } : { email };
  const ready = via === "phone" ? phone.length === 10 : /^\S+@\S+\.\S+$/.test(email);

  async function requestOtp() {
    setError(undefined);
    setLoading(true);
    const r = await post<{ devOtp?: string }>("/api/auth/otp", { mode: "login", ...ident });
    setLoading(false);
    if (r.error) return setError(r.error);
    setDevOtp(r.devOtp);
    setOtp("");
    setStage("otp");
  }

  async function verify(code = otp) {
    if (loading) return;
    if (code.replace(/\s/g, "").length !== 6) return setError("Enter the 6-digit OTP");
    setError(undefined);
    setLoading(true);
    const r = await post<{ next: string }>("/api/auth/verify", { mode: "login", ...ident, code });
    setLoading(false);
    if (r.error) return setError(r.error);
    const back = params.get("afterLoginRedirectTo");
    router.push(back && (back.startsWith("/web/dashboard") || back.startsWith("/admin")) ? back : r.next);
    router.refresh();
  }

  if (stage === "otp") {
    return (
      <div className="animate-soft-fade max-w-[400px]">
        <h1 className="text-[30px] font-semibold leading-tight">Enter OTP</h1>
        <p className="mt-2 text-[14px] text-ink/70">
          We sent a 6-digit code to <b>{via === "phone" ? `+91 ${phone}` : email}</b>{" "}
          <button className="text-[#1a73e8]" onClick={() => { setStage("id"); setError(undefined); }}>Edit</button>
        </p>
        <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); verify(); }}>
          <OtpBoxes value={otp} onChange={setOtp} onComplete={verify} />
          <DevOtpNote code={devOtp} />
          <ErrorText>{error}</ErrorText>
          <OrangeButton loading={loading}>Verify &amp; login</OrangeButton>
          <ResendTimer onResend={requestOtp} />
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-[400px]">
      <h1 className="text-[30px] font-semibold leading-tight">Continue to use TagMango</h1>
      <p className="mt-2 text-[14px] text-ink/80">Welcome back! Please enter your details.</p>
      <form className="mt-12 space-y-5" onSubmit={(e) => { e.preventDefault(); if (ready) requestOtp(); }}>
        {via === "phone" ? (
          <PhoneInput value={phone} onChange={setPhone} autoFocus />
        ) : (
          <input autoFocus className={inputCls} type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
        <ErrorText>{error}</ErrorText>
        <OrangeButton disabled={!ready} loading={loading}>Request OTP</OrangeButton>
        <p className="pt-3 text-center text-[13px] text-ink/80">
          OR,{" "}
          <button type="button" className="font-medium text-[#1a73e8]" onClick={() => { setVia(via === "phone" ? "email" : "phone"); setError(undefined); }}>
            Login using {via === "phone" ? "email" : "phone"}
          </button>
        </p>
        <p className="text-center text-[12px] text-ink/70">
          Not registered yet? <Link href="/web/sign-up" className="font-medium text-[#1a73e8]">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
