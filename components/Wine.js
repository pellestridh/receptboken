"use client";
import { useState } from "react";
import Link from "next/link";
import { api, getName } from "@/lib/api";
import { DIMS, AROMAS, grapeFor, grapeByKey, GRAPES } from "@/data/wine";
import { dateSv } from "@/lib/format";

export const COLORS = [["vitt", "Vitt"], ["rott", "Rött"], ["rosé", "Rosé"], ["mousserande", "Mousserande"], ["sött", "Sött"]];
const SW = { vitt: "#E8D27A", rott: "#7A1E2C", "rosé": "#F0A2A0", mousserande: "#E9D9A0", "sött": "#A8641E", orange: "#E08A3A" };
export const swatch = (c) => SW[c] || "#C9B98F";
const normColor = (c) => (c === "rött" ? "rott" : c || "");

export function Stars({ value = 0, onChange, label, size = "md" }) {
  return (
    <span className={"stars-in " + size} role={onChange ? "radiogroup" : undefined} aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => onChange
        ? <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} av 5`} className={n <= value ? "on" : ""} onClick={() => onChange(value === n ? 0 : n)}>★</button>
        : <span key={n} className={n <= value ? "on" : ""}>★</span>)}
    </span>
  );
}

function Scale({ d, value, onChange }) {
  const [help, setHelp] = useState(false);
  return (
    <div className="scale">
      <div className="scale-h"><b>{d.name}</b><button type="button" className="qm" aria-expanded={help} onClick={() => setHelp(!help)} aria-label={`Hur känner man ${d.name.toLowerCase()}?`}>?</button></div>
      {help && <p className="scale-help">{d.how}</p>}
      <div className="scale-row">
        <span className="muted">{d.lo}</span>
        <div className="dots5">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`${d.name} ${n} av 5`} aria-pressed={value === n} onClick={() => onChange(value === n ? 0 : n)} />)}</div>
        <span className="muted">{d.hi}</span>
      </div>
    </div>
  );
}

// Jämför familjens bedömning med druvans typiska profil. Det är så man kalibrerar smaken.
function Calibrate({ dims, grape }) {
  const diffs = DIMS.filter((d) => dims[d.key] && grape.p[d.key] && Math.abs(dims[d.key] - grape.p[d.key]) >= 2);
  const close = DIMS.filter((d) => dims[d.key] && grape.p[d.key] && Math.abs(dims[d.key] - grape.p[d.key]) <= 1);
  if (!diffs.length && !close.length) return null;
  const w = (v) => ["", "mycket låg", "låg", "medel", "hög", "mycket hög"][v];
  return (
    <div className="calib">
      <h3>Jämfört med en typisk {grape.name}</h3>
      {close.length > 0 && <p>Bra känt: {close.map((d) => d.name.toLowerCase()).join(", ")} stämmer med hur druvan brukar vara.</p>}
      {diffs.map((d) => (
        <p key={d.key}><b>{d.name}:</b> ni kände {w(dims[d.key])}, druvan brukar ha {w(grape.p[d.key])}. {d.how.split(".")[0]}. Det kan också vara just det här vinet, producent och årgång spelar roll.</p>
      ))}
    </div>
  );
}

export function WineLog({ initial = {}, recipeId, recipeTitle, onSaved, onCancel }) {
  const g0 = initial.grape ? grapeByKey(initial.grape) : grapeFor(`${initial.wine || ""} ${initial.style || ""}`);
  const [f, setF] = useState({
    wine: initial.wine || "", style: initial.style || "", color: normColor(initial.color) || (g0?.color === "rott" ? "rott" : g0?.color) || "",
    rating: 0, match: 0, dims: {}, aromas: [], note: "", price: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const grape = grapeFor(`${f.wine} ${f.style}`);
  const red = f.color === "rott";
  const aromas = red ? AROMAS.rott : AROMAS.vitt;

  async function save() {
    if (!f.wine.trim()) { setErr("Skriv vinets namn."); return; }
    setBusy(true); setErr("");
    try {
      const d = await api("/api/wine-notes", { method: "POST", json: { ...f, recipeId: recipeId || null, grape: grape?.key, author: getName() } });
      setDone({ dims: f.dims, grape });
      onSaved?.(d.notes);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  if (done) return (
    <div className="wlog">
      <h2>Sparat</h2>
      <p className="muted">Betyget används när Claude föreslår vin till nya recept.</p>
      {done.grape && <Calibrate dims={done.dims} grape={done.grape} />}
      {done.grape && <p><Link href={`/dryck/vin/druva/${done.grape.key}`}>Läs om {done.grape.name} ›</Link></p>}
      <div className="arow"><button className="btn" type="button" onClick={onCancel}>Klar</button></div>
    </div>
  );

  return (
    <div className="wlog">
      <h2>{recipeTitle ? `Vin till ${recipeTitle}` : "Logga ett vin"}</h2>
      {initial.suggested?.name && (
        <div className="fld"><span>Drack ni något av förslagen?</span>
          <div className="frow">{[initial.suggested, ...(initial.suggested.alternatives || [])].filter((x) => x?.name).map((x) => (
            <button key={x.name} type="button" className="chip" aria-pressed={f.wine === x.name} onClick={() => setF((y) => ({ ...y, wine: x.name, style: x.style || y.style }))}>{x.name}</button>
          ))}</div>
        </div>
      )}
      <label className="fld"><span>Vin</span><input className="tin" value={f.wine} onChange={(e) => set("wine", e.target.value)} placeholder="Producent och namn, till exempel Trimbach Riesling" /></label>
      <label className="fld"><span>Druva eller område</span><input className="tin" value={f.style} onChange={(e) => set("style", e.target.value)} placeholder="Till exempel Riesling, Alsace eller Chianti" /></label>
      {grape && <p className="hint">Det här är troligen <Link href={`/dryck/vin/druva/${grape.key}`}>{grape.name}</Link>.</p>}
      <div className="frow">{COLORS.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={f.color === k} onClick={() => set("color", k)}><i className="sw" style={{ "--sw": swatch(k) }} /> {l}</button>)}</div>

      <div className="wgrades">
        <div><span className="flabel2">Hur gott var vinet?</span><Stars value={f.rating} onChange={(v) => set("rating", v)} label="Betyg på vinet" size="lg" /></div>
        {recipeId && <div><span className="flabel2">Hur passade det till maten?</span><Stars value={f.match} onChange={(v) => set("match", v)} label="Betyg på kombinationen" size="lg" /></div>}
      </div>

      <details className="feel" open>
        <summary>Känn efter <span className="muted">(valfritt, men det är så man lär sig)</span></summary>
        {DIMS.filter((d) => d.key !== "tannin" || red || !f.color).map((d) => <Scale key={d.key} d={d} value={f.dims[d.key] || 0} onChange={(v) => set("dims", { ...f.dims, [d.key]: v })} />)}
        <div className="fld"><span>Vad doftar och smakar det?</span>
          <div className="frow">{aromas.map((a) => <button key={a} type="button" className="chip" aria-pressed={f.aromas.includes(a)} onClick={() => set("aromas", f.aromas.includes(a) ? f.aromas.filter((x) => x !== a) : [...f.aromas, a])}>{a}</button>)}</div>
        </div>
      </details>

      <label className="fld"><span>Anteckning</span><textarea className="tin" rows={3} value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Vad gillade ni, och hur fungerade det med maten?" /></label>
      <label className="fld" style={{ maxWidth: "12rem" }}><span>Pris, kr</span><input className="tin" type="number" inputMode="numeric" value={f.price} onChange={(e) => set("price", e.target.value)} /></label>
      {err && <p className="err">{err}</p>}
      <div className="arow"><button className="btn" type="button" disabled={busy} onClick={save}>{busy ? "Sparar …" : "Spara"}</button><button className="link" type="button" onClick={onCancel}>Avbryt</button></div>
    </div>
  );
}

export function WineNote({ n, onDelete, showRecipe = true }) {
  const [arm, setArm] = useState(false);
  const g = n.grape ? grapeByKey(n.grape) : null;
  return (
    <div className="wnote">
      <div className="wnote-h">
        <i className="sw big" style={{ "--sw": swatch(n.color || g?.color) }} />
        <div className="wnote-t">
          <b>{n.wine}</b>
          <span className="muted">{[n.style, g && !String(n.style || "").toLowerCase().includes(g.name.toLowerCase().split(" ")[0]) ? g.name : null, n.price ? `${n.price} kr` : null].filter(Boolean).join(" · ")}</span>
        </div>
        <Stars value={n.rating || 0} label={`Vinet ${n.rating} av 5`} />
      </div>
      {showRecipe && n.recipeTitle && <p className="wnote-r">Till <Link href={`/recept/${n.recipeId}`}>{n.recipeTitle}</Link>{n.match ? <> · passade <Stars value={n.match} size="sm" label={`Kombinationen ${n.match} av 5`} /></> : null}</p>}
      {!showRecipe && n.match ? <p className="wnote-r">Till maten <Stars value={n.match} size="sm" label={`Kombinationen ${n.match} av 5`} /></p> : null}
      {Object.keys(n.dims || {}).length > 0 && <div className="mini-dims">{DIMS.filter((d) => n.dims[d.key]).map((d) => <span key={d.key}>{d.name} <i style={{ "--v": n.dims[d.key] }} /></span>)}</div>}
      {n.aromas?.length > 0 && <p className="wnote-a">{n.aromas.join(", ")}</p>}
      {n.note && <p>{n.note}</p>}
      <p className="wnote-f muted">{n.author ? `${n.author}, ` : ""}{dateSv(n.createdAt)}
        {onDelete && (arm ? <button className="link" type="button" onClick={() => onDelete(n.id)}>Tryck igen för att ta bort</button> : <button className="link" type="button" onClick={() => { setArm(true); setTimeout(() => setArm(false), 4000); }}>Ta bort</button>)}
      </p>
    </div>
  );
}

export function ProfileBars({ p, compare }) {
  return (
    <div className="pbars">
      {DIMS.map((d) => (p[d.key] || compare?.[d.key]) ? (
        <div key={d.key} className="pbar">
          <span className="pl">{d.name}</span>
          <span className="pt"><span className="pv" style={{ width: `${((p[d.key] || 0) / 5) * 100}%` }} />{compare?.[d.key] ? <span className="pc" style={{ left: `${(compare[d.key] / 5) * 100}%` }} title="Er smakprofil" /> : null}</span>
          <span className="pe muted">{p[d.key] ? (p[d.key] <= 2 ? d.lo : p[d.key] >= 4 ? d.hi : "Medel") : ""}</span>
        </div>
      ) : null)}
    </div>
  );
}

export const GRAPE_LIST = GRAPES;
