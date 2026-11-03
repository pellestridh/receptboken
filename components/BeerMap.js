"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { STYLES, FAMILIES, styleColor, familyName, styleByKey } from "@/data/beer";
import { SPECTRUM, spectrumFor } from "@/data/beerSpectrum";
import TasteGrid, { spread, placeLabels } from "@/components/TasteGrid";

// Två kartor: Pelles stora ölkarta (beska och fruktighet, 0–100) och smakkartan ur Liten Ölguide.
const MODES = {
  spektrum: {
    name: "Beska och fruktighet", top: "Fruktig", bottom: "Ren", left: "Låg beska", right: "Hög beska", ticks: true,
    rows: ["Mycket frukt", "Lite frukt", "Ren"], cols: ["låg beska", "medelbeska", "hög beska"], cuts: { x: [0.25, 0.45], y: [0.4, 0.7] },
    hint: "Den stora ölkartan. Åt höger mer humlebeska, uppåt mer frukt från jästens estrar och modern humle.",
    pos: (s) => { const p = spectrumFor(s.key); return p ? { x: p.b / 100, y: 1 - p.f / 100 } : null; },
  },
  guide: {
    name: "Söt–besk och fruktig–maltig", top: "Söt", bottom: "Besk", left: "Fruktig", right: "Maltig",
    hint: "Smakkartan ur Liten Ölguide. Vänster fruktigt, höger maltigt, uppåt sött och nedåt beskt.",
    pos: (s) => s.map || null,
  },
};

export default function BeerMap({ usage = {}, focus = null, compact = false }) {
  const [mode, setMode] = useState("spektrum");
  const [fam, setFam] = useState(null);
  const [sel, setSel] = useState(focus);
  const [view, setView] = useState(compact ? "punkter" : "rutnat");
  const M = MODES[mode];
  const W = 1000, H = 1000, P = 70;
  const pts = useMemo(() => spread(STYLES.map((s) => ({ s, p: M.pos(s) })).filter((o) => o.p).map(({ s, p }) => ({ s, est: p.est, x: P + p.x * (W - 2 * P), y: P + p.y * (H - 2 * P) })), 38), [mode]);
  const chosen = sel ? STYLES.find((s) => s.key === sel) : null;
  const used = (k) => (usage[k] || []).length;
  const labels = placeLabels([...pts].filter((o) => sel === o.s.key || used(o.s.key) > 0 || (fam && o.s.family === fam)).sort((a, b) => (sel === b.s.key) - (sel === a.s.key) || used(b.s.key) - used(a.s.key)).map((o) => ({ key: o.s.key, x: o.x, y: o.y, r: sel === o.s.key ? 20 : used(o.s.key) ? 16 : 12, name: o.s.name })));

  return (
    <div className={"bmap" + (compact ? " compact" : "")}>
      {!compact && (
        <>
          <div className="boxseg small mapmode two" role="tablist">
            <button type="button" role="tab" aria-selected={view === "rutnat"} onClick={() => setView("rutnat")}>Rutnät</button>
            <button type="button" role="tab" aria-selected={view === "punkter"} onClick={() => setView("punkter")}>Punktkarta</button>
          </div>
          <div className="boxseg small mapmode" role="tablist">{Object.entries(MODES).map(([k, m]) => <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)}>{m.name}</button>)}</div>
          <p className="hint">{M.hint}</p>
          <div className="frow fams">
            <button type="button" className="chip" aria-pressed={!fam} onClick={() => setFam(null)}>Alla</button>
            {FAMILIES.map((f) => <button key={f.key} type="button" className="chip" aria-pressed={fam === f.key} onClick={() => setFam(fam === f.key ? null : f.key)}>{f.name}</button>)}
          </div>
        </>
      )}
      {view === "rutnat" ? (
        <TasteGrid axes={M} items={STYLES.filter((s) => !fam || s.family === fam).map((s) => ({ s, p: M.pos(s) })).filter((o) => o.p).map(({ s, p }) => ({ key: s.key, name: s.name, x: p.x, y: p.y, color: styleColor(s), square: s.kind === "lager", used: used(s.key) > 0, href: `/dryck/ol/${s.key}` }))} />
      ) : (
        <div className="bmap-box">
          {M.ticks
            ? <><span className="ax bottom">Beska →</span><span className="ax left">Fruktighet →</span></>
            : <><span className="ax top">{M.top}</span><span className="ax bottom">{M.bottom}</span><span className="ax left">{M.left}</span><span className="ax right">{M.right}</span></>}
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ölstilskarta">
            <defs>
              <linearGradient id="bg-sweet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--map-sweet)" /><stop offset="1" stopColor="var(--map-bitter)" /></linearGradient>
            </defs>
            <rect x="0" y="0" width={W} height={H} rx="28" fill="url(#bg-sweet)" />
            {M.ticks
              ? [0, 25, 50, 75, 100].map((t) => {
                const v = P + (t / 100) * (W - 2 * P);
                return (
                  <g key={t} className="ticks">
                    <line x1={v} y1="30" x2={v} y2={H - 30} className="grid" />
                    <line x1="30" y1={v} x2={W - 30} y2={v} className="grid" />
                    <text x={v} y={H - 8} textAnchor="middle" className="tick">{t}</text>
                    <text x="12" y={H - v + 9} className="tick">{t}</text>
                  </g>
                );
              })
              : <><line x1={W / 2} y1="30" x2={W / 2} y2={H - 30} className="grid" /><line x1="30" y1={H / 2} x2={W - 30} y2={H / 2} className="grid" /></>}
            {[...pts].sort((a, b) => (sel === a.s.key) - (sel === b.s.key) || (used(a.s.key) > 0) - (used(b.s.key) > 0)).map(({ s, x, y, est }) => {
              const dim = fam && s.family !== fam;
              const on = sel === s.key;
              const u = used(s.key);
              const r = on ? 20 : u ? 16 : 12;
              const named = on || u > 0 || (fam && s.family === fam);
              return (
                <g key={s.key} className={"pt" + (dim ? " dim" : "") + (on ? " on" : "") + (u ? " used" : "") + (named ? " named" : "") + (est ? " est" : "")}
                  onClick={() => setSel(on ? null : s.key)} role="button" tabIndex={0} aria-label={s.name}
                  onKeyDown={(e) => { if (e.key === "Enter") setSel(on ? null : s.key); }}>
                  {u > 0 && <circle cx={x} cy={y} r={r + 9} className="halo" />}
                  {s.kind === "lager"
                    ? <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx="5" fill={styleColor(s)} className="mk" />
                    : <circle cx={x} cy={y} r={r} fill={styleColor(s)} className="mk" />}
                  <title>{s.name}</title>
                  <text x={labels[s.key]?.x ?? x + r + 10} y={labels[s.key]?.y ?? y + 9} textAnchor={labels[s.key]?.a || "start"} className="lbl">{s.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
      <div className="bmap-key muted"><span><i className="k ale" />Överjäst</span><span><i className="k lager" />Underjäst</span><span><i className="k halo" />Föreslagen till era recept</span></div>
      {chosen && !compact && view === "punkter" && (
        <Link href={`/dryck/ol/${chosen.key}`} className="bpeek">
          <span className="glass" style={{ background: styleColor(chosen) }} />
          <span className="bpeek-t"><b>{chosen.name}</b><span className="muted">{familyName(chosen.family)}{used(chosen.key) ? ` · föreslagen till ${used(chosen.key)} recept` : ""}</span><span>{spectrumFor(chosen.key)?.d || chosen.food?.slice(0, 2).join(". ")}</span></span>
          <span className="go">›</span>
        </Link>
      )}
      {!compact && <Spectrum fam={fam} used={used} />}
    </div>
  );
}

const Meter = ({ v, label }) => <span className="smeter" title={`${label} ${v} av 100`}><i style={{ width: `${v}%` }} /></span>;

// Ölspektrumet: alla stilar per grupp, med beska och fruktighet och en rad om varje.
function Spectrum({ fam, used }) {
  return (
    <section className="spectrum">
      <h2>Ölspektrumet</h2>
      <p className="hint">Alla stilar i grupper efter vad som bär smaken. Staplarna visar beska och fruktighet på samma skala som kartan.</p>
      {SPECTRUM.map((g) => {
        const items = g.items.filter((i) => !fam || styleByKey(i.key)?.family === fam);
        if (!items.length) return null;
        return (
          <div key={g.key} className="sgroup">
            <h3>{g.name}</h3>
            <p className="muted sfocus">{g.focus}</p>
            <ul>
              {items.map((i) => {
                const s = styleByKey(i.key);
                return (
                  <li key={i.key} className={used(i.key) ? "used" : ""}>
                    <Link href={`/dryck/ol/${i.key}`} className="sname"><i className={"tdot" + (s.kind === "lager" ? " sq" : "")} style={{ background: styleColor(s) }} />{s.name}</Link>
                    <span className="sbars"><span><small>Beska</small><Meter v={i.b} label="Beska" /></span><span><small>Frukt</small><Meter v={i.f} label="Fruktighet" /></span></span>
                    <p>{i.d}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
