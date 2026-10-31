"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

// Näringsvärde per portion. Räknas fram första gången receptet öppnas.
export default function Nutrition({ id, nutrition: initial, lightKcal, onChange }) {
  const [n, setN] = useState(initial || null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const started = useRef(false);

  useEffect(() => { setN(initial || null); }, [initial]);
  const run = () => {
    setBusy(true); setErr("");
    api(`/api/recipes/${id}/nutrition`, { method: "POST" })
      .then((d) => { setN(d.nutrition); onChange?.(d.nutrition); })
      .catch((e) => setErr(e.message))
      .finally(() => setBusy(false));
  };
  useEffect(() => {
    if (initial || started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initial]);

  if (!n) {
    return (
      <section className="rsec"><h2>Näringsvärde per portion</h2>
        <div className="empty">{busy ? <><span className="spinner" />Räknar fram näringsvärdet …</> : <>{err || "Näringsvärdet kunde inte räknas fram."} <button className="link" type="button" onClick={run}>Försök igen</button></>}</div>
      </section>
    );
  }
  const e = (n.protein || 0) * 4 + (n.carbs || 0) * 4 + (n.fat || 0) * 9 || 1;
  const parts = [
    ["Protein", n.protein, (n.protein * 4) / e, "var(--c-sea)"],
    ["Kolhydrater", n.carbs, (n.carbs * 4) / e, "var(--c-dijon)"],
    ["Fett", n.fat, (n.fat * 9) / e, "var(--c-ember)"],
  ];
  const light = n.kcal && n.kcal <= lightKcal;
  return (
    <section className="rsec"><h2>Näringsvärde per portion</h2>
      <div className="nutri">
        <div className="kcal"><b>{n.kcal}</b><span>kcal</span>{light && <em className="light">Lätt</em>}</div>
        <div className="macro">
          <div className="bar" role="img" aria-label="Energifördelning">
            {parts.map(([l, , p, c]) => <span key={l} style={{ width: `${Math.round(p * 100)}%`, background: c }} />)}
          </div>
          <div className="legend">
            {parts.map(([l, g, p, c]) => (
              <span key={l}><i style={{ background: c }} />{l} <b>{g} g</b> <span className="muted">{Math.round(p * 100)} %</span></span>
            ))}
          </div>
        </div>
      </div>
      <p className="hint">{n.source === "livsmedelsverket" ? "Beräknat med Livsmedelsverkets livsmedelsdatabas." : "Uppskattat av Claude."} Värdena är ungefärliga.{" "}
        <button className="link" type="button" disabled={busy} onClick={run}>{busy ? "Räknar …" : "Räkna om"}</button></p>
    </section>
  );
}
