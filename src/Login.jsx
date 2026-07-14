import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase.js";
import { LOGO_DATA_URI } from "./logoAsset.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError("Couldn't sign in. Check your email and password and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email above first, then click \"Forgot password\".");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice("Check your email for a password reset link.");
    } catch (err) {
      setError("Couldn't send a reset email for that address.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl px-[8.5px] py-9 w-[340px] shadow-2xl">
        <div className="flex items-center gap-2.5 mb-[5.5px]">
          <img src={LOGO_DATA_URI} alt="" className="w-9 h-9" />
          <div>
            <div className="font-bold text-[15px] text-ink">Big Eight Integrated</div>
            <div className="font-mono text-[10px] text-teal uppercase tracking-wide">Invoice Studio</div>
          </div>
        </div>
        <label className="block text-[12.5px] text-slate mb-1.5 font-medium">Email</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full px-2.5 py-2 border border-line rounded-md text-[13.5px] mb-3.5"
        />
        <label className="block text-[12.5px] text-slate mb-1.5 font-medium">Password</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full px-2.5 py-2 border border-line rounded-md text-[13.5px] mb-2"
        />
        <div className="text-right mb-4">
          <button type="button" onClick={handleForgotPassword} className="text-[11.5px] text-teal hover:underline">
            Forgot password?
          </button>
        </div>
        {error && <div className="text-[12px] text-red-700 mb-3.5">{error}</div>}
        {notice && <div className="text-[12px] text-emerald-700 mb-3.5">{notice}</div>}
        <button
          type="submit" disabled={busy}
          className="w-full text-center bg-navy hover:bg-navylight text-white py-2.5 rounded-md text-[13.5px] font-semibold disabled:opacity-60 transition-colors"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="text-[11.5px] text-gray-400 mt-4 leading-relaxed">
          Accounts are created for team members individually — contact your admin if you need access.
        </div>
      </form>
    </div>
  );
}
