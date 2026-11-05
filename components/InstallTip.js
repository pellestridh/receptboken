"use client";
import { useEffect, useState } from "react";
import { lsGet, lsSet } from "@/lib/api";

// Visar hur man lägger appen på hemskärmen, så att den öppnas som en app och inte som en flik i Safari.
export default function InstallTip() {
  const [tip, setTip] = useState(null);
  const [prompt, setPrompt] = useState(null);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (standalone || lsGet("rb-installtip", false)) return;
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios) { const t = setTimeout(() => setTip("ios"), 2500); return () => clearTimeout(t); }
    const onPrompt = (e) => { e.preventDefault(); setPrompt(e); setTip("android"); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  if (!tip) return null;
  const close = () => { lsSet("rb-installtip", true); setTip(null); };
  return (
    <div className="installtip" role="dialog" aria-label="Lägg Receptboken på hemskärmen">
      <b>Gör Receptboken till en app</b>
      {tip === "ios"
        ? <span>Tryck på Dela-knappen <span aria-hidden="true">⬆︎</span> i Safari och välj <b>Lägg till på hemskärmen</b>. Då öppnas den som en egen app, i helskärm och utan Safari.</span>
        : <span>Installera den, så öppnas den som en egen app i helskärm.</span>}
      <span style={{ display: "flex", gap: "1.2rem", justifyContent: "flex-end" }}>
        {prompt && <button type="button" onClick={async () => { prompt.prompt(); await prompt.userChoice.catch(() => {}); close(); }}>Installera</button>}
        <button type="button" onClick={close}>{tip === "ios" ? "Okej" : "Inte nu"}</button>
      </span>
    </div>
  );
}
