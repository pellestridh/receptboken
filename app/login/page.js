"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { setName, getName } from "@/lib/api";

function LoginForm() {
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [name, setNameState] = useState(getName());
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) { setErr("Skriv ditt namn så att anteckningar får rätt avsändare."); return; }
    setBusy(true); setErr("");
    const res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setErr(data.error || "Det gick inte att logga in."); return; }
    setName(name.trim());
    window.location.href = params.get("next") || "/";
  }

  return (
    <form className="login" onSubmit={submit}>
      <img src="/icon-512.png" alt="" width="168" height="168" className="login-logo" />
      <h1>Receptboken</h1>
      <p className="muted" style={{ margin: 0 }}>Ange familjekoden. Du loggar in en gång per enhet.</p>
      <label className="fld"><span>Ditt namn</span>
        <input id="name" className="tin" value={name} onChange={(e) => setNameState(e.target.value)} autoComplete="given-name" placeholder="Till exempel Pelle" />
      </label>
      <label className="fld"><span>Familjekod</span>
        <input id="code" className="tin" type="password" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="current-password" />
      </label>
      {err && <p className="err" style={{ margin: 0 }}>{err}</p>}
      <button className="btn big" type="submit" disabled={busy || !code}>{busy ? "Loggar in …" : "Logga in"}</button>
    </form>
  );
}

export default function Login() {
  return <Suspense><LoginForm /></Suspense>;
}
