"use client";
import { useState } from "react";
import Link from "next/link";
import { BEER_WHEEL, WINE_WHEEL } from "@/data/aromaWheel";
import { styleByKey } from "@/data/beer";
import { grapeByKey } from "@/data/wine";

const W = 1000, C = W / 2, R0 = 120, R1 = 280, R2 = 495;
const dark = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 120; };
const pt = (r, a) => [C + r * Math.cos(a), C + r * Math.sin(a)];
function arc(r1, r2, a1, a2) {
  const big = a2 - a1 > Math.PI ? 1 : 0;
  const [x1, y1] = pt(r2, a1), [x2, y2] = pt(r2, a2), [x3, y3] = pt(r1, a2), [x4, y4] = pt(r1, a1);
  return `M${x1},${y1} A${r2},${r2} 0 ${big} 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${big} 0 ${x4},${y4} Z`;
}
// Text längs radien, vänd på vänstra halvan så att den alltid går att läsa.
function radial(r, a, text, cls, max) {
  const [x, y] = pt(r, a);
  let deg = (a * 180) / Math.PI;
  const flip = Math.cos(a) < 0;
  if (flip) deg += 180;
  return <text x={x} y={y} transform={`rotate(${deg} ${x} ${y})`} textAnchor="middle" dominantBaseline="central" className={cls} style={max ? { fontSize: Math.min(27, Math.round(max / (text.length * 0.56))) } : undefined}>{text}</text>;
}

export default function AromaWheel({ kind = "beer" }) {
  const data = kind === "beer" ? BEER_WHEEL : WINE_WHEEL;
  const [sel, setSel] = useState(null); // [gi, ii] eller [gi]
  const total = data.reduce((n, g) => n + g.items.length, 0);
  const step = (2 * Math.PI) / total;
  let i0 = 0;
  const groups = data.map((g) => { const start = i0; i0 += g.items.length; return { ...g, start }; });
  const start = -Math.PI / 2;
  const g = sel ? data[sel[0]] : null, it = sel && sel[1] != null ? g.items[sel[1]] : null;
  const ref = (k) => (kind === "beer" ? styleByKey(k) : grapeByKey(k));
  const href = (k) => (kind === "beer" ? `/dryck/ol/${k}` : `/dryck/vin/druva/${k}`);

  return (
    <div className="awheel">
      <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label="Doftcirkel">
        {groups.map((gr, gi) => {
          const a1 = start + gr.start * step, a2 = a1 + gr.items.length * step;
          const on = sel && sel[0] === gi;
          return (
            <g key={gr.name} className={"aw-g" + (on ? " on" : "") + (sel && !on ? " dim" : "")}>
              <path d={arc(R0, R1, a1, a2)} fill={gr.color} className="aw-in" onClick={() => setSel(on && sel[1] == null ? null : [gi])} />
              {radial((R0 + R1) / 2 + 6, (a1 + a2) / 2, gr.name.split(" ")[0], "aw-gl")}
              {gr.items.map((x, ii) => {
                const b1 = a1 + ii * step, b2 = b1 + step;
                const pick = on && sel[1] === ii;
                return (
                  <g key={x.n} className={"aw-i" + (pick ? " on" : "")} onClick={() => setSel(pick ? [gi] : [gi, ii])} role="button" tabIndex={0} aria-label={x.n}
                    onKeyDown={(e) => { if (e.key === "Enter") setSel([gi, ii]); }}>
                    <path d={arc(R1 + 4, R2, b1, b2)} fill={gr.color} className="aw-out" />
                    {radial((R1 + R2) / 2 + 4, (b1 + b2) / 2, x.n, "aw-il" + (dark(gr.color) ? " light" : ""), R2 - R1 - 26)}
                  </g>
                );
              })}
            </g>
          );
        })}
        <circle cx={C} cy={C} r={R0 - 6} className="aw-hub" onClick={() => setSel(null)} />
        <text x={C} y={C} textAnchor="middle" dominantBaseline="central" className="aw-hubt">{kind === "beer" ? "Öl" : "Vin"}</text>
      </svg>
      <div className={"aw-info" + (g?.fault ? " fault" : "")}>
        {!g && <p className="muted">Tryck på en del av cirkeln. Inre ringen visar var doften kommer ifrån, den yttre vad ni känner.</p>}
        {g && !it && <><h3><i style={{ background: g.color }} />{g.name}</h3><p>{g.from}</p><div className="frow">{g.items.map((x, ii) => <button key={x.n} type="button" className="chip" onClick={() => setSel([sel[0], ii])}>{x.n}</button>)}</div></>}
        {it && <>
          <span className="kicker">{g.name}</span>
          <h3><i style={{ background: g.color }} />{it.n}</h3>
          <p>{it.d}</p>
          {it.styles.length > 0 && <div className="frow">{it.styles.map((k) => { const x = ref(k); return x ? <Link key={k} href={href(k)} className="chip">{x.name} ›</Link> : null; })}</div>}
        </>}
      </div>
    </div>
  );
}
