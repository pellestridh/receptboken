"use client";
import { useEffect, useState } from "react";
import { api, lsGet, lsSet } from "@/lib/api";
import { useApp } from "@/components/Providers";
import Link from "next/link";
import { DOUGHS, TECHNIQUES, OVENS, READ_MORE, doughFor, sizeFor, toppingItems } from "@/data/pizza";
import { useRecipes } from "@/components/useRecipes";
import { dishesOf } from "@/lib/dishes";

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
  const [s, setS] = useState({ count: 4, weight: 280, kind: "dag", flour: "tipo00", knead: "hand", oven: "ugn" });
  const [view, setView] = useState("deg");
  const [night, setNight] = useState({ free: 0, list: {} });
  const { recipes } = useRecipes();
  useEffect(() => {
    const v = lsGet("rb-pizza", null); if (v) setS((x) => ({ ...x, ...v }));
    const n = lsGet("rb-pizzakvall", null);
    const q = new URLSearchParams(window.location.search);
    const base = n || { free: 0, list: {} };
    if (q.get("pizza")) base.list = { ...base.list, [q.get("pizza")]: Math.max(1, parseInt(q.get("antal"), 10) || 1) };
    setNight(base);
    if (q.get("vy") === "kvall") setView("kvall");
  }, []);
  useEffect(() => { lsSet("rb-pizzakvall", night); }, [night]);
  useEffect(() => { lsSet("rb-pizza", s); }, [s]);
  const set = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const D = DOUGHS[s.kind];
  const r = doughFor(s);
  const pizzas = (recipes || []).filter((x) => dishesOf(x).includes("pizza"));
  const chosen = Object.entries(night.list).map(([id, n]) => ({ r: pizzas.find((x) => x.id === id) || (recipes || []).find((x) => x.id === id), n })).filter((x) => x.r && x.n > 0);
  const total = chosen.reduce((a, x) => a + x.n, 0) + (night.free || 0);
  const nd = doughFor({ ...s, count: Math.max(1, total) });
  const setN = (id, n) => setNight((x) => { const list = { ...x.list }; if (n > 0) list[id] = n; else delete list[id]; return { ...x, list }; });
  const doughItems = (d) => [
    { name: s.kind === "napoli" && s.flour === "vete" ? "Vetemjöl" : "Tipo 00-mjöl", unit: "g", q: d.mjol, pantry: true, from: "Pizzadeg" },
    { name: "Torrjäst", unit: "g", q: d.jast, pantry: true, from: "Pizzadeg" },
    { name: "Durumvetemjöl", unit: "", q: null, pantry: true, from: "Pizzadeg" },
  ];
  const nightToShop = async () => {
    try {
      const items = [...doughItems(nd)];
      for (const x of chosen) { const d = await api(`/api/recipes/${x.r.id}`); items.push(...toppingItems(d.recipe, x.n)); }
      await api("/api/shopping", { method: "POST", json: { items } });
      toast("Deg och pålägg ligger i inköpslistan");
    } catch (e) { toast(e.message); }
  };
  const toShop = () => api("/api/shopping", { method: "POST", json: { items: doughItems(r) } }).then(() => toast("Mjöl och jäst ligger i inköpslistan")).catch((e) => toast(e.message));

  return (
    <div className="narrow pizza">
      <span className="kicker">Pizzadeg</span>
      <h1>Ge mig pizza!</h1>
      <div className="boxseg drinktabs" role="tablist">{[["deg", "Degen"], ["kvall", "Pizzakväll"]].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)}>{l}</button>)}</div>

      {view === "kvall" ? (
        <>
          <p className="lead">Välj vilka pizzor ni ska baka och hur många av varje. Degen räknas ut för alla, påläggen per pizza.</p>
          <section className="bsec">
            <h2>Pizzorna</h2>
            <ul className="festlist">
              {chosen.map((x) => (
                <li key={x.r.id}>
                  <div><Link href={`/recept/${x.r.id}`}><b>{x.r.title}</b></Link><span className="muted">Pålägg för {x.n}</span></div>
                  <span className="stepper"><button type="button" aria-label="Färre" onClick={() => setN(x.r.id, x.n - 1)}>−</button><b className="pzn">{x.n}</b><button type="button" aria-label="Fler" onClick={() => setN(x.r.id, x.n + 1)}>+</button></span>
                  <span />
                </li>
              ))}
              <li>
                <div><b>Egen topping</b><span className="muted">Bara deg, ni toppar själva</span></div>
                <span className="stepper"><button type="button" aria-label="Färre" onClick={() => setNight((y) => ({ ...y, free: Math.max(0, (y.free || 0) - 1) }))}>−</button><b className="pzn">{night.free || 0}</b><button type="button" aria-label="Fler" onClick={() => setNight((y) => ({ ...y, free: (y.free || 0) + 1 }))}>+</button></span>
                <span />
              </li>
            </ul>
            {pizzas.filter((x) => !night.list[x.id]).length > 0 && <>
              <h3 className="pzh">Lägg till från era recept</h3>
              <ul className="festcands">{pizzas.filter((x) => !night.list[x.id]).map((x) => <li key={x.id}><button type="button" onClick={() => setN(x.id, 1)}><span className="plus">+</span><b>{x.title}</b><span className="muted">{x.kitchen}</span></button></li>)}</ul>
            </>}
            {!pizzas.length && <p className="muted">Ni har inga pizzarecept än. Lägg till ett, eller räkna bara deg med Egen topping.</p>}
          </section>
          {total > 0 && (
            <section className="bsec">
              <h2>Degen för {total} {total === 1 ? "pizza" : "pizzor"}</h2>
              <div className="doughres">
                <div><span>{s.kind === "napoli" && s.flour === "vete" ? "Vetemjöl" : "Mjöl, Tipo 00"}</span><b>{g(nd.mjol)}</b></div>
                <div><span>Vatten</span><b>{g(nd.vatten)}</b></div>
                <div><span>{D.yeastName}</span><b>{g(nd.jast)}</b></div>
                <div><span>Salt</span><b>{g(nd.salt)}</b></div>
              </div>
              <p className="hint">{D.name}, {s.weight} g per degboll, {OVENS[s.oven].name.toLowerCase()}. <button type="button" className="link" onClick={() => setView("deg")}>Ändra degen</button></p>
              <p className="arow"><button className="btn" type="button" onClick={nightToShop}>Lägg deg och pålägg i inköpslistan</button></p>
            </section>
          )}
        </>
      ) : (
      <>
      <p className="lead">Välj deg, antal pizzor och hur mycket varje degboll ska väga, så räknas allt ut. Samma uträkning som på ettgotland.se.</p>

      <div className="boxseg" role="tablist">{Object.entries(DOUGHS).map(([k, d]) => <button key={k} type="button" role="tab" aria-selected={s.kind === k} onClick={() => set("kind", k)}>{d.name}</button>)}</div>
      <p className="hint">{D.intro}</p>

      <div className="panel festform">
        <Stepper label="Antal pizzor" value={s.count} set={(v) => set("count", v)} />
        <Stepper label="Gram per degboll" value={s.weight} set={(v) => set("weight", v)} step={10} min={100} />
        <p className="hint wide">{s.weight} g blir en pizza på {sizeFor(s.weight)}. Riktmärke: 200 g ger 22–24 cm, 250 g är standard och 280 g ger 28–35 cm.</p>
        <div className="fld wide"><span>Ugn</span>
          <div className="frow">{Object.entries(OVENS).map(([k, o]) => <button key={k} type="button" className="chip" aria-pressed={s.oven === k} onClick={() => set("oven", k)}>{o.name}</button>)}</div>
        </div>
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
          <div><span>{s.kind === "napoli" && s.flour === "vete" ? "Vetemjöl" : "Mjöl, Tipo 00"}</span><b>{g(r.mjol)}</b></div>
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
        <h2>Gräddning i {OVENS[s.oven].name.toLowerCase()}</h2>
        <ul className="ticks">{OVENS[s.oven].tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </section>

      <section className="bsec">
        {TECHNIQUES.map((x) => <div key={x.t} className="card2 tech"><h3>{x.t}</h3><p>{x.d}</p></div>)}
      </section>
      <section className="bsec">
        <h2>Vill du lära dig mer</h2>
        <ul className="readmore">{READ_MORE.map((x) => <li key={x.h}><a href={x.h} target="_blank" rel="noopener noreferrer"><b>{x.t}</b></a><span className="muted">{x.d}</span></li>)}</ul>
      </section>
      </>
      )}
    </div>
  );
}
