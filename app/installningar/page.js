"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/components/useSettings";
import { useApp } from "@/components/Providers";
import { getName, setName } from "@/lib/api";

export default function Settings() {
  const { toast } = useApp();
  const [settings, save] = useSettings();
  const [kcal, setKcal] = useState("");
  const [name, setN] = useState("");
  useEffect(() => { setKcal(String(settings.lightKcal)); }, [settings.lightKcal]);
  useEffect(() => { setN(getName()); }, []);

  return (
    <div className="narrow">
      <div className="hero"><h1>Inställningar</h1></div>
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
      <div className="panel">
        <p className="hint" style={{ margin: 0 }}><Link href="/genvag">Dela recept från Safari</Link></p>
        <div><button className="btn ghost" type="button" onClick={async () => { await fetch("/api/logout", { method: "POST" }); window.location.href = "/login"; }}>Logga ut på den här enheten</button></div>
      </div>
      <p className="hint">Näringsvärden beräknas med Livsmedelsverkets livsmedelsdatabas (CC BY 4.0).</p>
    </div>
  );
}
