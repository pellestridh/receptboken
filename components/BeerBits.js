"use client";
import Link from "next/link";
import { styleColor, ebcColor } from "@/data/beer";

export function Glass({ s, size = 64 }) {
  const c = styleColor(s);
  return (
    <svg className="bglass" width={size} height={size * 1.4} viewBox="0 0 50 70" aria-hidden="true">
      <path d="M8 8 h34 l-3 52 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 z" fill={c} />
      <path d="M7 6 q4 -6 9 -2 q4 -5 9 -1 q5 -4 9 0 q5 -3 9 3 v6 h-36 z" fill="#FFF8E8" />
      <path d="M8 8 h34 l-3 52 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 z" fill="none" stroke="rgb(0 0 0 / .25)" strokeWidth="1.5" />
      <path d="M13 16 l-1.5 40" stroke="rgb(255 255 255 / .35)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Bar({ label, min, max, lo, hi, unit, gradient }) {
  const L = Math.max(0, (lo - min) / (max - min)) * 100, R = Math.min(1, (hi - min) / (max - min)) * 100;
  return (
    <div className="sbar">
      <span className="sl">{label}</span>
      <span className="track" style={gradient ? { background: gradient } : undefined}>
        <span className="rng" style={{ left: `${L}%`, width: `${Math.max(3, R - L)}%` }} />
      </span>
      <span className="sv">{String(lo).replace(".", ",")}–{String(hi).replace(".", ",")} {unit}</span>
    </div>
  );
}

const EBC_GRAD = `linear-gradient(90deg, ${[4, 10, 18, 28, 40, 55, 80].map((e, i) => `${ebcColor(e)} ${i * 16.6}%`).join(", ")})`;

export function Stats({ s }) {
  return (
    <div className="stats">
      {s.abv && <Bar label="Alkohol" min={0} max={14} lo={s.abv[0]} hi={s.abv[1]} unit="%" />}
      {s.ibu && <Bar label="Beska" min={0} max={100} lo={s.ibu[0]} hi={s.ibu[1]} unit="IBU" />}
      {s.ebc && <Bar label="Färg" min={0} max={80} lo={s.ebc[0]} hi={s.ebc[1]} unit="EBC" gradient={EBC_GRAD} />}
    </div>
  );
}

export function StyleRow({ s, uses = 0 }) {
  return (
    <Link href={`/dryck/ol/${s.key}`} className="srow">
      <Glass s={s} size={26} />
      <span className="st"><b>{s.name}</b><span className="muted">{s.food?.[0]}</span></span>
      {uses > 0 && <span className="uses">{uses} recept</span>}
      <span className="go">›</span>
    </Link>
  );
}
