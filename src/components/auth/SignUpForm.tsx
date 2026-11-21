"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DevOtpNote, ErrorText, OrangeButton, OtpBoxes, PhoneInput, ResendTimer, inputCls, post } from "./fields";

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [stage, setStage] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const ready = name.trim() && email.trim() && phone.length === 10 && terms;

  async function requestOtp() {
    setError(undefined);
    setLoading(true);
    const r = await post<{ devOtp?: string }>("/api/auth/otp", { mode: "signup", name, email, phone, terms });
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
    const r = await post<{ next: string }>("/api/auth/verify", { mode: "signup", name, email, phone, marketing, code });
    setLoading(false);
    if (r.error) return setError(r.error);
    router.push(r.next);
    router.refresh();
  }

  if (stage === "otp") {
    return (
      <div className="animate-soft-fade max-w-[400px]">
        <h1 className="text-[30px] font-semibold leading-tight">Verify your number</h1>
        <p className="mt-2 text-[14px] text-ink/70">
          Enter the 6-digit OTP sent to <b>+91 {phone}</b>{" "}
          <button className="text-[#1a73e8]" onClick={() => { setStage("form"); setError(undefined); }}>Edit</button>
        </p>
        <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); verify(); }}>
          <OtpBoxes value={otp} onChange={setOtp} onComplete={verify} />
          <DevOtpNote code={devOtp} />
          <ErrorText>{error}</ErrorText>
          <OrangeButton loading={loading}>Verify &amp; continue</OrangeButton>
          <ResendTimer onResend={requestOtp} />
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-[400px]">
      <h1 className="text-[30px] font-semibold leading-tight">Welcome! First things first...</h1>
      <p className="mt-2 text-[14px] text-ink/80">You can always change them later.</p>
      <form className="mt-10 space-y-4" onSubmit={(e) => { e.preventDefault(); if (ready) requestOtp(); }}>
        <input className={inputCls} placeholder="Enter name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputCls} placeholder="Enter email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PhoneInput value={phone} onChange={setPhone} />
        <label className="flex gap-2.5 pt-1 text-[12px] leading-relaxed text-ink/70">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#fb8a1b]" />
          <span>
            I have read and agree to the <Link href="#" className="text-[#fb8a1b]">Terms of Service</Link> and{" "}
            <Link href="#" className="text-[#fb8a1b]">Privacy Policy</Link>.
          </span>
        </label>
        <label className="flex gap-2.5 text-[12px] leading-relaxed text-ink/70">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#fb8a1b]" />
          <span>I agree to receive product updates, newsletters, and promotional communications by email. I understand I can unsubscribe at any time.</span>
        </label>
        <ErrorText>{error}</ErrorText>
        <OrangeButton disabled={!ready} loading={loading}>Get started</OrangeButton>
        <p className="text-center text-[13px] text-ink/80">
          Already have an account? <Link href="/web/login" className="font-medium text-[#1a73e8]">Login</Link>
        </p>
      </form>
    </div>
  );
}
