"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { STYLES, styleColor } from "@/data/beer";
import { spread, placeLabels } from "@/components/TasteGrid";

// Ölkartan: söt till besk uppifrån och ner, som i Liten Ölguide.
// Åt sidan intensitet, lätt till kraftig, eftersom det är det Garrett Oliver sätter först: drycken ska orka med maten.
// Intensiteten räknas fram ur alkoholhalt och färg (rostad malt).
const W = 1000, H = 1000, P = 70;
const mid = (r, d) => (r ? (r[0] + r[1]) / 2 : d);
export function intensity(s) {
  const abv = mid(s.abv, 5), ebc = mid(s.ebc, 15);
  const a = Math.min(1, Math.max(0, (abv - 3.5) / 7.5)), e = Math.min(1, Math.max(0, ebc / 80));
  return Math.min(1, a * 0.75 + e * 0.25);
}

export default function BeerMap({ focus = null, compact = false }) {
  const router = useRouter();
  const pts = useMemo(() => {
    // Rangordningen sprider ut de många lätta stilarna utan att ändra ordningen från lätt till kraftig.
    const list = STYLES.filter((s) => s.map), raw = list.map(intensity);
    const lo = Math.min(...raw), hi = Math.max(...raw), order = [...raw].sort((a, b) => a - b);
    const xOf = (v) => 0.5 * ((v - lo) / (hi - lo || 1)) + 0.5 * (order.indexOf(v) / (order.length - 1));
    return spread(list.map((s, i) => ({ s, x: P + xOf(raw[i]) * (W - 2 * P), y: P + s.map.y * (H - 2 * P) })), 40);
  }, []);
  const labels = placeLabels([...pts].filter((o) => !compact || focus === o.s.key).sort((a, b) => (focus === b.s.key) - (focus === a.s.key)).map((o) => ({ key: o.s.key, x: o.x, y: o.y, r: 13, name: o.s.short || o.s.name })), W, 16.5, 32, !compact, pts.map((o) => ({ x: o.x, y: o.y, r: 14 })));
  const go = (k) => router.push(`/dryck/ol/${k}`);

  return (
    <div className={"bmap" + (compact ? " compact" : "")}>
      <div className="bmap-box">
        <span className="ax top">Söt</span><span className="ax bottom">Besk</span>
        <span className="ax left">Lätt</span><span className="ax right">Kraftig</span>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ölkarta">
          <defs><linearGradient id="bg-sweet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--map-sweet)" /><stop offset="1" stopColor="var(--map-bitter)" /></linearGradient></defs>
          <rect x="0" y="0" width={W} height={H} rx="28" fill="url(#bg-sweet)" />
          <line x1={W / 2} y1="30" x2={W / 2} y2={H - 30} className="grid" />
          <line x1="30" y1={H / 2} x2={W - 30} y2={H / 2} className="grid" />
          {pts.map(({ s, x, y }) => {
            const on = focus === s.key, L = labels[s.key];
            return (
              <g key={s.key} className={"pt named" + (on ? " on" : "")} onClick={() => go(s.key)} role="link" tabIndex={0} aria-label={s.name}
                onKeyDown={(e) => { if (e.key === "Enter") go(s.key); }}>
                <title>{s.name}</title>
                <circle cx={x} cy={y} r={on ? 20 : 13} fill={styleColor(s)} className="mk" />
                {L && <text x={L.x} y={L.y} textAnchor={L.a} className="lbl">{s.short || s.name}</text>}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
