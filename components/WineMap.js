"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { GRAPES } from "@/data/wine";
import { wineMapPos, WINE_MAPS } from "@/data/wineExtra";
import { swatch } from "@/components/Wine";
import TasteGrid, { spread, placeLabels } from "@/components/TasteGrid";

const FAM = [["alla", "Alla"], ["vitt", "Vitt"], ["rott", "Rött"], ["ovrigt", "Rosé, bubbel och sött"]];
const famOf = (g) => (g.color === "vitt" ? "vitt" : g.color === "rott" ? "rott" : "ovrigt");

// Vinets smakkarta, med två axelpar att växla mellan.
export default function WineMap({ usage = {}, focus = null, compact = false }) {
  const [mode, setMode] = useState("stil");
  const [fam, setFam] = useState("alla");
  const [sel, setSel] = useState(focus);
  const [view, setView] = useState("punkter");
  const M = WINE_MAPS[mode];
  const W = 1000, H = 1000, P = 70;
  const pts = useMemo(() => spread(GRAPES.map((g) => { const p = wineMapPos(g, mode); return { g, x: P + p.x * (W - 2 * P), y: P + p.y * (H - 2 * P) }; }), 38), [mode]);
  const chosen = sel ? GRAPES.find((g) => g.key === sel) : null;
  const used = (k) => (usage[k] || []).length;

  const labels = placeLabels([...pts].filter((o) => !compact || sel === o.g.key).sort((a, b) => (sel === b.g.key) - (sel === a.g.key) || used(b.g.key) - used(a.g.key)).map((o) => ({ key: o.g.key, x: o.x, y: o.y, r: (sel === o.g.key ? 20 : used(o.g.key) ? 16 : 13), name: o.g.short || o.g.name })), 1000, 19, 36, !compact, pts.map((o) => ({ x: o.x, y: o.y, r: 14 })));

  return (
    <div className={"bmap wmap" + (compact ? " compact" : "")}>
      {!compact && (
        <>
          <div className="boxseg small mapmode two" role="tablist">
            <button type="button" role="tab" aria-selected={view === "punkter"} onClick={() => setView("punkter")}>Karta</button>
            <button type="button" role="tab" aria-selected={view === "rutnat"} onClick={() => setView("rutnat")}>Lista</button>
          </div>
          <div className="boxseg small mapmode" role="tablist">{Object.entries(WINE_MAPS).map(([k, m]) => <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)}>{m.name}</button>)}</div>
          <p className="hint">{M.hint}</p>
          <div className="frow fams">{FAM.map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={fam === k} onClick={() => setFam(k)}>{l}</button>)}</div>
        </>
      )}
      {view === "rutnat" ? (
        <TasteGrid axes={M} items={GRAPES.filter((g) => fam === "alla" || famOf(g) === fam).map((g) => { const p = wineMapPos(g, mode); return { key: g.key, name: g.name, x: p.x, y: p.y, color: swatch(g.color), used: used(g.key) > 0, href: `/dryck/vin/druva/${g.key}` }; })} />
      ) : (
      <div className="bmap-box">
        <span className="ax top">{M.top}</span><span className="ax bottom">{M.bottom}</span>
        <span className="ax left">{M.left}</span><span className="ax right">{M.right}</span>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vinkarta">
          <defs><linearGradient id="wbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--map-wine-a)" /><stop offset="1" stopColor="var(--map-wine-b)" /></linearGradient></defs>
          <rect x="0" y="0" width={W} height={H} rx="28" fill="url(#wbg)" />
          <line x1={W / 2} y1="30" x2={W / 2} y2={H - 30} className="grid" />
          <line x1="30" y1={H / 2} x2={W - 30} y2={H / 2} className="grid" />
          {[...pts].sort((a, b) => (sel === a.g.key) - (sel === b.g.key) || (used(a.g.key) > 0) - (used(b.g.key) > 0)).map(({ g, x, y }) => {
            const dim = fam !== "alla" && famOf(g) !== fam;
            const on = sel === g.key, u = used(g.key);
            const named = on || (!compact && !!labels[g.key]);
            const r = on ? 20 : u ? 16 : 13;
            return (
              <g key={g.key} className={"pt" + (dim ? " dim" : "") + (on ? " on" : "") + (u ? " used" : "") + (named ? " named" : "")}
                onClick={() => setSel(on ? null : g.key)} role="button" tabIndex={0} aria-label={g.name} onKeyDown={(e) => { if (e.key === "Enter") setSel(on ? null : g.key); }}>
                <title>{g.name}</title>
                {u > 0 && <circle cx={x} cy={y} r={r + 9} className="halo" />}
                <circle cx={x} cy={y} r={r} fill={swatch(g.color)} className="mk" />
                <text x={labels[g.key]?.x ?? x + r + 10} y={labels[g.key]?.y ?? y + 9} textAnchor={labels[g.key]?.a || "start"} className="lbl">{g.short || g.name}</text>
              </g>
            );
          })}
        </svg>
      </div>
      )}
      <div className="bmap-key muted"><span><i className="k ale" style={{ background: "#E8D27A" }} />Vitt</span><span><i className="k ale" style={{ background: "#7A1E2C" }} />Rött</span><span><i className="k halo" />Föreslagen till era recept</span></div>
      {chosen && !compact && view === "punkter" && (
        <Link href={`/dryck/vin/druva/${chosen.key}`} className="bpeek">
          <span className="glass" style={{ background: swatch(chosen.color) }} />
          <span className="bpeek-t"><b>{chosen.name}</b><span className="muted">{chosen.where.split(",").slice(0, 2).join(",")}{used(chosen.key) ? ` · föreslagen till ${used(chosen.key)} recept` : ""}</span><span>{chosen.food.split(".")[0]}.</span></span>
          <span className="go">›</span>
        </Link>
      )}
    </div>
  );
}
