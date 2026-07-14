import React from "react";

export default function Field({ label, children, hint, className = "" }) {
  return (
    <div className={`mb-3.5 ${className}`}>
      <label className="block text-[12.5px] text-slate mb-1.5 font-medium">{label}</label>
      {children}
      {hint && <div className="text-[11.5px] text-slate mt-1">{hint}</div>}
    </div>
  );
}
