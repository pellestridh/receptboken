"use client";
import { useEffect, useState } from "react";
import { api, lsGet, lsSet } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { DOUGHS, TECHNIQUES, doughFor } from "@/data/pizza";

const g = (x) => `${String(x.toFixed(1)).replace(".", ",")} g`;

function Stepper({ label, value, set, step = 1, min = 1, unit }) {
  return (
    <label className="fld"><span>{label}</span>
      <span className="stepper">
        <button type="button" aria-label="Minska" onClick={() => set(Math.max(min, value - step))}>−</button>
        <input className="tin" type="number" inputMode="numeric" min={min} value={value} onChange={(e) => set(Math.max(min, parseInt(e.target.value, 10) || min))} />
        <button type="button" aria-label="Öka" onClick={() => set(value + step)}>+</button>
        {unit && <span className="muted">{unit}</span>}
      </span>
    </label>
  );
}

export default function Pizza() {
  const { toast } = useApp();
  const [s, setS] = useState({ count: 4, weight: 280, kind: "dag", flour: "tipo00", knead: "hand" });
  useEffect(() => { const v = lsGet("rb-pizza", null); if (v) setS((x) => ({ ...x, ...v })); }, []);
  useEffect(() => { lsSet("rb-pizza", s); }, [s]);
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const D = DOUGHS[s.kind];
  const r = doughFor(s);
  const toShop = () => api("/api/shopping", { method: "POST", json: { items: [
    { name: s.kind === "napoli" && s.flour === "tipo00" ? "Tipo 00-mjöl" : "Vetemjöl", unit: "g", q: r.mjol, pantry: true, from: "Pizzadeg" },
    { name: "Torrjäst", unit: "g", q: r.jast, pantry: true, from: "Pizzadeg" },
    { name: "Durumvetemjöl", unit: "", q: null, pantry: true, from: "Pizzadeg" },
  ] } }).then(() => toast("Mjöl och jäst ligger i inköpslistan")).catch((e) => toast(e.message));

  return (
    <div className="narrow pizza">
      <span className="kicker">Pizzadeg</span>
      <h1>Ge mig pizza!</h1>
      <p className="lead">Välj deg, antal pizzor och hur mycket varje degboll ska väga, så räknas allt ut. Samma uträkning som på ettgotland.se.</p>

      <div className="boxseg" role="tablist">{Object.entries(DOUGHS).map(([k, d]) => <button key={k} type="button" role="tab" aria-selected={s.kind === k} onClick={() => set("kind", k)}>{d.name}</button>)}</div>
      <p className="hint">{D.intro}</p>

      <div className="panel festform">
        <Stepper label="Antal pizzor" value={s.count} set={(v) => set("count", v)} />
        <Stepper label="Gram per degboll" value={s.weight} set={(v) => set("weight", v)} step={10} min={100} />
        {s.kind === "napoli" && (
          <div className="fld wide"><span>Mjöl</span>
            <div className="frow">{[["tipo00", "Tipo 00"], ["vete", "Vanligt vetemjöl"]].map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={s.flour === k} onClick={() => set("flour", k)}>{l}</button>)}</div>
            {s.flour === "vete" && <p className="hint">{D.flourNote}</p>}
          </div>
        )}
      </div>

      <section className="bsec">
        <h2>Det här behöver du</h2>
        <div className="doughres">
          <div><span>{s.kind === "napoli" && s.flour === "tipo00" ? "Mjöl, Tipo 00" : "Vetemjöl"}</span><b>{g(r.mjol)}</b></div>
          <div><span>Vatten{s.kind === "napoli" ? ", kallt" : ""}</span><b>{g(r.vatten)}</b></div>
          <div><span>{D.yeastName}</span><b>{g(r.jast)}</b></div>
          <div><span>Salt</span><b>{g(r.salt)}</b></div>
        </div>
        <p className="hint">{s.count} {s.count === 1 ? "pizza" : "pizzor"} à {s.weight} g. Jäsning: {D.rise} Till utbakningen: durumvetemjöl.</p>
        <p className="arow"><button className="btn ghost" type="button" onClick={toShop}>Lägg mjöl och jäst i inköpslistan</button></p>
      </section>

      <section className="bsec">
        <h2>Gör så här</h2>
        <div className="boxseg small" role="tablist">{[["hand", "För hand"], ["machine", "Med köksassistent"]].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={s.knead === k} onClick={() => set("knead", k)}>{l}</button>)}</div>
        <ol className="steps">{[...D[s.knead], ...D.after].map((t) => <li key={t}>{t}</li>)}</ol>
      </section>

      <section className="bsec">
        {TECHNIQUES.map((x) => <div key={x.t} className="card2 tech"><h3>{x.t}</h3><p>{x.d}</p></div>)}
      </section>
    </div>
  );
}
