"use client";
// Provningsloggen och profilstaplarna, gemensamma för vin och öl.
import { useState } from "react";
import Link from "next/link";
import { api, getName } from "@/lib/api";
import { DIMS, AROMAS, grapeFor, grapeByKey, GRAPES } from "@/data/wine";
import { BEER_DIMS, BEER_AROMAS, beerProfile } from "@/data/beerSchool";
import { styleFor, styleByKey, styleColor } from "@/data/beer";
import { dateSv } from "@/lib/format";

export const COLORS = [["vitt", "Vitt"], ["rott", "Rött"], ["rosé", "Rosé"], ["mousserande", "Mousserande"], ["sött", "Sött"]];
const BEER_COLORS = [["ljus", "Ljus"], ["bärnsten", "Bärnsten"], ["mörk", "Mörk"]];
const SW = { vitt: "#E8D27A", rott: "#7A1E2C", "rosé": "#F0A2A0", mousserande: "#E9D9A0", "sött": "#A8641E", orange: "#E08A3A", ljus: "#F0BE3C", "bärnsten": "#B8661F", "mörk": "#2A1710" };
export const swatch = (c) => SW[c] || "#C9B98F";
const normColor = (c) => (c === "rött" ? "rott" : c || "");
export const dimsFor = (kind) => (kind === "beer" ? BEER_DIMS : DIMS);

// Det man provat: druva för vin, ölstil för öl. Med typisk profil att jämföra mot.
export function itemFor(kind, text, key) {
  if (kind === "beer") {
    const s = key ? styleByKey(key) : styleFor(text);
    return s ? { key: s.key, name: s.name, p: beerProfile(s), href: `/dryck/ol/${s.key}`, color: styleColor(s) } : null;
  }
  const g = key ? grapeByKey(key) : grapeFor(text);
  return g ? { key: g.key, name: g.name, p: g.p, href: `/dryck/vin/druva/${g.key}`, color: swatch(g.color) } : null;
}

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

// Jämför familjens bedömning med den typiska profilen. Det är så man kalibrerar smaken.
function Calibrate({ kind, dims, item }) {
  const D = dimsFor(kind);
  const diffs = D.filter((d) => dims[d.key] && item.p[d.key] && Math.abs(dims[d.key] - item.p[d.key]) >= 2);
  const close = D.filter((d) => dims[d.key] && item.p[d.key] && Math.abs(dims[d.key] - item.p[d.key]) <= 1);
  if (!diffs.length && !close.length) return null;
  const w = (v) => ["", "mycket låg", "låg", "medel", "hög", "mycket hög"][v];
  return (
    <div className="calib">
      <h3>Jämfört med en typisk {item.name.toLowerCase().startsWith("ipa") ? "IPA" : item.name}</h3>
      {close.length > 0 && <p>Bra känt: {close.map((d) => d.name.toLowerCase()).join(", ")} stämmer med hur {kind === "beer" ? "stilen" : "druvan"} brukar vara.</p>}
      {diffs.map((d) => (
        <p key={d.key}><b>{d.name}:</b> ni kände {w(dims[d.key])}, {kind === "beer" ? "stilen" : "druvan"} brukar ha {w(item.p[d.key])}. {d.how.split(".")[0]}. {kind === "beer" ? "Det kan också vara just den här ölen, bryggerier tolkar stilar olika." : "Det kan också vara just den här flaskan, producent och årgång spelar roll."}</p>
      ))}
    </div>
  );
}

export function WineLog({ kind = "wine", initial = {}, recipeId, recipeTitle, onSaved, onCancel }) {
  const beer = kind === "beer";
  const i0 = itemFor(kind, `${initial.wine || ""} ${initial.style || ""}`, initial.grape);
  const [f, setF] = useState({
    wine: initial.wine || "", style: initial.style || "",
    color: normColor(initial.color) || (!beer && i0 ? (grapeByKey(i0.key)?.color === "rott" ? "rott" : grapeByKey(i0.key)?.color) : "") || "",
    rating: 0, match: 0, dims: {}, aromas: [], note: "", price: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const item = itemFor(kind, `${f.style} ${f.wine}`);
  const red = f.color === "rott";
  const aromas = beer ? BEER_AROMAS : red ? AROMAS.rott : AROMAS.vitt;
  const D = dimsFor(kind).filter((d) => d.key !== "tannin" || red || !f.color);
  const word = beer ? "ölen" : "vinet";

  async function save() {
    if (!f.wine.trim()) { setErr(beer ? "Skriv ölets namn." : "Skriv vinets namn."); return; }
    setBusy(true); setErr("");
    try {
      const d = await api("/api/wine-notes", { method: "POST", json: { ...f, kind, recipeId: recipeId || null, grape: item?.key, author: getName() } });
      setDone({ dims: f.dims, item });
      onSaved?.(d.notes);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  if (done) return (
    <div className="wlog">
      <h2>Sparat</h2>
      <p className="muted">Betyget används när Claude föreslår {beer ? "öl" : "vin"} till nya recept.</p>
      {done.item && <Calibrate kind={kind} dims={done.dims} item={done.item} />}
      {done.item && <p><Link href={done.item.href}>Läs om {done.item.name} ›</Link></p>}
      <div className="arow"><button className="btn" type="button" onClick={onCancel}>Klar</button></div>
    </div>
  );

  return (
    <div className="wlog">
      <h2>{recipeTitle ? `${beer ? "Öl" : "Vin"} till ${recipeTitle}` : beer ? "Logga en öl" : "Logga ett vin"}</h2>
      {initial.suggested?.name && (
        <div className="fld"><span>Drack ni något av förslagen?</span>
          <div className="frow">{[initial.suggested, ...(initial.suggested.alternatives || [])].filter((x) => x?.name).map((x) => (
            <button key={x.name} type="button" className="chip" aria-pressed={f.wine === x.name} onClick={() => setF((y) => ({ ...y, wine: x.name, style: x.style || y.style }))}>{x.name}</button>
          ))}</div>
        </div>
      )}
      <label className="fld"><span>{beer ? "Öl" : "Vin"}</span><input className="tin" value={f.wine} onChange={(e) => set("wine", e.target.value)} placeholder={beer ? "Bryggeri och namn, till exempel Westmalle Tripel" : "Producent och namn, till exempel Trimbach Riesling"} /></label>
      <label className="fld"><span>{beer ? "Ölstil" : "Druva eller område"}</span><input className="tin" value={f.style} onChange={(e) => set("style", e.target.value)} placeholder={beer ? "Till exempel belgisk tripel eller IPA" : "Till exempel Riesling, Alsace eller Chianti"} /></label>
      {item && <p className="hint">Det här är troligen <Link href={item.href}>{item.name}</Link>.</p>}
      <div className="frow">{(beer ? BEER_COLORS : COLORS).map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={f.color === k} onClick={() => set("color", k)}><i className="sw" style={{ "--sw": swatch(k) }} /> {l}</button>)}</div>

      <div className="wgrades">
        <div><span className="flabel2">Hur god var {word}?</span><Stars value={f.rating} onChange={(v) => set("rating", v)} label={`Betyg på ${word}`} size="lg" /></div>
        {recipeId && <div><span className="flabel2">Hur passade {beer ? "den" : "det"} till maten?</span><Stars value={f.match} onChange={(v) => set("match", v)} label="Betyg på kombinationen" size="lg" /></div>}
      </div>

      <details className="feel" open>
        <summary>Känn efter <span className="muted">(valfritt, men det är så man lär sig)</span></summary>
        {D.map((d) => <Scale key={d.key} d={d} value={f.dims[d.key] || 0} onChange={(v) => set("dims", { ...f.dims, [d.key]: v })} />)}
        <div className="fld"><span>Vad doftar och smakar {beer ? "den" : "det"}?</span>
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

function Why({ n }) {
  const [w, setW] = useState(n.why);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const good = (n.match || 0) >= 4;
  const ask = () => { setBusy(true); setErr(""); api("/api/wine-notes", { method: "POST", json: { action: "why", id: n.id } }).then((d) => setW(d.why)).catch((e) => setErr(e.message)).finally(() => setBusy(false)); };
  if (!w) return <p className="wwhy-ask">{busy ? <span className="muted">Claude tänker …</span> : <button type="button" className="link" onClick={ask}>{good ? "Varför passade det?" : (n.match || 0) <= 2 ? "Varför passade det inte?" : "Vad hände i kombinationen?"}</button>}{err && <span className="err"> {err}</span>}</p>;
  return (
    <div className={"wwhy" + (good ? " good" : "")}>
      <b>{good ? "Därför passade det" : "Därför blev det så"}{w.principle ? <span className="bchip">{w.principle}</span> : null}</b>
      <p>{w.why}</p>
      {w.met?.length > 0 && <ul>{w.met.map((m) => <li key={m}>{m}</li>)}</ul>}
      {w.next && <p className="muted"><b>Nästa gång:</b> {w.next}</p>}
    </div>
  );
}

export function WineNote({ n, onDelete, showRecipe = true }) {
  const [arm, setArm] = useState(false);
  const kind = n.kind || "wine";
  const it = itemFor(kind, `${n.style || ""} ${n.wine}`, n.grape);
  const col = n.color ? swatch(n.color) : it?.color;
  return (
    <div className="wnote">
      <div className="wnote-h">
        <i className="sw big" style={{ "--sw": col }} />
        <div className="wnote-t">
          <b>{n.wine}</b>
          <span className="muted">{[kind === "beer" ? "Öl" : null, n.style, it && !String(n.style || "").toLowerCase().includes(it.name.toLowerCase().split(" ")[0]) ? it.name : null, n.price ? `${n.price} kr` : null].filter(Boolean).join(" · ")}</span>
        </div>
        <Stars value={n.rating || 0} label={`${n.rating} av 5`} />
      </div>
      {showRecipe && n.recipeTitle && <p className="wnote-r">Till <Link href={`/recept/${n.recipeId}`}>{n.recipeTitle}</Link>{n.match ? <> · passade <Stars value={n.match} size="sm" label={`Kombinationen ${n.match} av 5`} /></> : null}</p>}
      {!showRecipe && n.match ? <p className="wnote-r">Till maten <Stars value={n.match} size="sm" label={`Kombinationen ${n.match} av 5`} /></p> : null}
      {Object.keys(n.dims || {}).length > 0 && <div className="mini-dims">{dimsFor(kind).filter((d) => n.dims[d.key]).map((d) => <span key={d.key}>{d.name} <i style={{ "--v": n.dims[d.key] }} /></span>)}</div>}
      {n.aromas?.length > 0 && <p className="wnote-a">{n.aromas.join(", ")}</p>}
      {n.note && <p>{n.note}</p>}
      {n.recipeId && n.match ? <Why n={n} /> : null}
      <p className="wnote-f muted">{n.author ? `${n.author}, ` : ""}{dateSv(n.createdAt)}
        {onDelete && (arm ? <button className="link" type="button" onClick={() => onDelete(n.id)}>Tryck igen för att ta bort</button> : <button className="link" type="button" onClick={() => { setArm(true); setTimeout(() => setArm(false), 4000); }}>Ta bort</button>)}
      </p>
    </div>
  );
}

export function ProfileBars({ p, compare, kind = "wine" }) {
  return (
    <div className="pbars">
      {dimsFor(kind).map((d) => (p[d.key] || compare?.[d.key]) ? (
        <div key={d.key} className="pbar">
          <span className="pl">{d.name}</span>
          <span className="pt"><span className="pv" style={{ width: `${((p[d.key] || 0) / 5) * 100}%` }} />{compare?.[d.key] ? <span className="pc" style={{ left: `${(compare[d.key] / 5) * 100}%` }} title="Er smakprofil" /> : null}</span>
          <span className="pe muted">{p[d.key] ? (p[d.key] <= 2 ? d.lo : p[d.key] >= 4 ? d.hi : "Medel") : ""}</span>
        </div>
      ) : null)}
    </div>
  );
}

// Smakprofil av det familjen gillat (4–5 stjärnor), för vin eller öl.
export function profileOf(kind, notes, candidates) {
  const mine = notes.filter((n) => (n.kind || "wine") === kind);
  const liked = mine.filter((n) => (n.rating || 0) >= 4 && Object.keys(n.dims || {}).length);
  const avg = {};
  for (const d of dimsFor(kind)) {
    const v = liked.map((n) => n.dims?.[d.key]).filter((x) => x > 0);
    if (v.length) avg[d.key] = Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
  }
  const by = {};
  for (const n of mine) {
    const it = itemFor(kind, `${n.style || ""} ${n.wine}`, n.grape);
    if (!it) continue;
    const x = (by[it.key] ||= { it, n: 0, sum: 0 });
    x.n++; x.sum += n.rating || 0;
  }
  const ranked = Object.values(by).map((x) => ({ ...x, avg: x.sum / x.n })).sort((a, b) => b.avg - a.avg || b.n - a.n);
  const tried = new Set(ranked.map((x) => x.it.key));
  const dist = (p) => dimsFor(kind).reduce((s, d) => s + (avg[d.key] ? Math.abs((p[d.key] || 0) - avg[d.key]) : 0), 0);
  const suggest = Object.keys(avg).length ? candidates.filter((c) => !tried.has(c.key)).sort((a, b) => dist(a.p) - dist(b.p)).slice(0, 3) : [];
  return { avg, liked: liked.length, ranked, suggest, count: mine.length };
}

export const GRAPE_LIST = GRAPES;
