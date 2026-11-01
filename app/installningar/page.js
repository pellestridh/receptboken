"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/components/useSettings";
import Households from "@/components/Households";
import { useApp } from "@/components/Providers";
import { getName, setName } from "@/lib/api";

export default function Settings() {
  const { toast } = useApp();
  const [settings, save] = useSettings();
  const [kcal, setKcal] = useState("");
  const [name, setN] = useState("");
  useEffect(() => { setKcal(String(settings.lightKcal)); }, [settings.lightKcal]);
  useEffect(() => { setN(getName()); }, []);
  const [allergies, setAllergies] = useState([]);
  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");
  useEffect(() => { if (settings.allergies) setAllergies(settings.allergies); }, [settings.allergies]);
  const saveAllergies = (list) => save({ allergies: list }).then(() => toast("Allergierna är sparade. Recepten kontrolleras om.")).catch((e) => toast(e.message));

  return (
    <div className="narrow">
      <div className="hero"><h1>Inställningar</h1></div>
      <div className="panel">
        <h2 style={{ fontSize: "1.4rem" }}>Allergier</h2>
        <p className="hint">Claude använder aldrig det här i nya recept, recepten varnar om det finns med, och matsedeln föreslår inte rätter som innehåller det.</p>
        <ul className="nlist">
          {allergies.map((a, i) => (
            <li key={i}>{a.who ? <b>{a.who}: </b> : null}{a.what}{" "}
              <button className="link" type="button" onClick={() => { const l = allergies.filter((_, j) => j !== i); setAllergies(l); saveAllergies(l); }}>Ta bort</button>
            </li>
          ))}
          {!allergies.length && <li className="muted">Inga allergier.</li>}
        </ul>
        <form className="arow" onSubmit={(e) => { e.preventDefault(); if (!what.trim()) return; const l = [...allergies, { who: who.trim(), what: what.trim() }]; setAllergies(l); setWhat(""); saveAllergies(l); }}>
          <input className="tin" style={{ maxWidth: "10rem" }} value={who} onChange={(e) => setWho(e.target.value)} placeholder="Vem" />
          <input className="tin" style={{ flex: 1 }} value={what} onChange={(e) => setWhat(e.target.value)} placeholder="Till exempel hasselnötter" />
          <button className="btn ghost" type="submit">Lägg till</button>
        </form>
      </div>
      <div className="panel">
        <label className="fld"><span>Gräns för Lätt, kcal per portion</span>
          <input className="tin" type="number" inputMode="numeric" min="100" max="2000" value={kcal} onChange={(e) => setKcal(e.target.value)} />
        </label>
        <p className="hint">Rätter under gränsen märks Lätt och syns under filtret Lätt. Gäller för hela familjen.</p>
        <div><button className="btn" type="button" onClick={() => save({ lightKcal: Number(kcal) }).then(() => toast("Sparat")).catch((e) => toast(e.message))}>Spara</button></div>
      </div>
      <div className="panel">
        <label className="fld"><span>Ditt namn på den här enheten</span>
          <input className="tin" value={name} onChange={(e) => setN(e.target.value)} />
        </label>
        <p className="hint">Visas på anteckningar och dryckesomdömen du gör härifrån.</p>
        <div><button className="btn" type="button" onClick={() => { setName(name.trim()); toast("Sparat"); }}>Spara</button></div>
      </div>
      <Households />
      <div className="panel">
        <p className="hint" style={{ margin: 0 }}><Link href="/genvag">Dela recept från Safari</Link></p>
        <div><button className="btn ghost" type="button" onClick={async () => { await fetch("/api/logout", { method: "POST" }); window.location.href = "/login"; }}>Logga ut på den här enheten</button></div>
      </div>
      <p className="hint">Näringsvärden beräknas med Livsmedelsverkets livsmedelsdatabas (CC BY 4.0).</p>
    </div>
  );
}
