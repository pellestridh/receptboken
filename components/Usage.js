"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dateSv } from "@/lib/format";

const NAMES = {
  save_recipe: "Läsa in recept", save_drinks: "Dryckesförslag", save_offers: "Läsa erbjudanden", save_allergens: "Allergenkontroll",
  save_nutrition: "Näringsvärden", save_dishes: "Sortera i fack", save_holidays: "Högtider", save_difficulty: "Nivå",
  ideas: "Räcker till mer", why: "Varför passade det", explain: "Förklaringar", page_text: "Läsa receptsidor", fix_base: "Rätta huvudråvara",
};
// Ungefärlig vikt: utdata kostar cirka fem gånger mer än indata, och den snabba modellen cirka en tredjedel.
const weight = (r) => (r.input + 5 * r.output) * (/haiku/.test(r.model) ? 1 / 3 : 1);
const k = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".", ",")} M` : n >= 1000 ? `${Math.round(n / 1000)} k` : String(n));

export default function Usage() {
  const [d, setD] = useState(null);
  const [days, setDays] = useState(7);
  useEffect(() => { api(`/api/usage?dagar=${days}`).then(setD).catch(() => setD(null)); }, [days]);
  if (!d?.rows) return null;
  const by = new Map();
  for (const r of d.rows) { const n = NAMES[r.feature] || r.feature; const o = by.get(n) || { name: n, calls: 0, input: 0, output: 0, w: 0, fast: false }; o.calls += r.calls; o.input += r.input; o.output += r.output; o.w += weight(r); o.fast ||= /haiku/.test(r.model); by.set(n, o); }
  const list = [...by.values()].sort((a, b) => b.w - a.w);
  const total = list.reduce((a, x) => a + x.w, 0) || 1;
  return (
    <div className="panel">
      <h2 style={{ fontSize: "1.4rem" }}>Användning av Claude</h2>
      <p className="hint">Vad appen har använt Claude till, så att ni ser vad som kostar. Andelen är ungefärlig. Bara huvudhushållet ser det här.{d.since ? ` Mäts sedan ${dateSv(d.since).replace(/\.$/, "")}.` : ""}</p>
      <div className="frow">{[7, 30].map((n) => <button key={n} type="button" className="chip" aria-pressed={days === n} onClick={() => setDays(n)}>{n} dagar</button>)}</div>
      {list.length ? (
        <table className="usage">
          <thead><tr><th>Funktion</th><th>Anrop</th><th>Tokens in / ut</th><th>Andel</th></tr></thead>
          <tbody>{list.map((x) => <tr key={x.name}><td>{x.name}{x.fast ? <span className="muted"> · snabb modell</span> : null}</td><td>{x.calls}</td><td>{k(x.input)} / {k(x.output)}</td><td>{Math.round((100 * x.w) / total)} %</td></tr>)}</tbody>
        </table>
      ) : <p className="muted">Inga anrop ännu under perioden.</p>}
    </div>
  );
}
