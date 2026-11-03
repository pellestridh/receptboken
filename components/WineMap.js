"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GRAPES } from "@/data/wine";
import { wineMapPos, WINE_MAPS } from "@/data/wineExtra";
import { swatch } from "@/components/Wine";
import { spread, placeLabels } from "@/components/TasteGrid";

// Vinkartan: lätt till fyllig åt sidan, frisk till rund uppifrån och ner. Det är syran och fylligheten som avgör mest till mat.
const W = 1000, H = 1000, P = 70;

export default function WineMap({ focus = null, compact = false }) {
  const router = useRouter();
  const M = WINE_MAPS.stil;
  const pts = useMemo(() => spread(GRAPES.map((g) => { const p = wineMapPos(g, "stil"); return { g, x: P + p.x * (W - 2 * P), y: P + p.y * (H - 2 * P) }; }), 38), []);
  const labels = placeLabels([...pts].filter((o) => !compact || focus === o.g.key).sort((a, b) => (focus === b.g.key) - (focus === a.g.key)).map((o) => ({ key: o.g.key, x: o.x, y: o.y, r: 13, name: o.g.short || o.g.name })), W, 16.5, 32, !compact, pts.map((o) => ({ x: o.x, y: o.y, r: 14 })));
  const go = (k) => router.push(`/dryck/vin/druva/${k}`);

  return (
    <div className={"bmap wmap" + (compact ? " compact" : "")}>
      {!compact && <p className="hint">{M.hint} Prickens färg är vinets färg. Tryck på en druva för att öppna kortet.</p>}
      <div className="bmap-box">
        <span className="ax top">{M.top}</span><span className="ax bottom">{M.bottom}</span>
        <span className="ax left">{M.left}</span><span className="ax right">{M.right}</span>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vinkarta">
          <defs><linearGradient id="wbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--map-wine-a)" /><stop offset="1" stopColor="var(--map-wine-b)" /></linearGradient></defs>
          <rect x="0" y="0" width={W} height={H} rx="28" fill="url(#wbg)" />
          <line x1={W / 2} y1="30" x2={W / 2} y2={H - 30} className="grid" />
          <line x1="30" y1={H / 2} x2={W - 30} y2={H / 2} className="grid" />
          {pts.map(({ g, x, y }) => {
            const on = focus === g.key, L = labels[g.key];
            return (
              <g key={g.key} className={"pt named" + (on ? " on" : "")} onClick={() => go(g.key)} role="link" tabIndex={0} aria-label={g.name}
                onKeyDown={(e) => { if (e.key === "Enter") go(g.key); }}>
                <title>{g.name}</title>
                <circle cx={x} cy={y} r={on ? 20 : 13} fill={swatch(g.color)} className="mk" />
                {L && <text x={L.x} y={L.y} textAnchor={L.a} className="lbl">{g.short || g.name}</text>}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
