"use client";
import Link from "next/link";
import { accentVar, dateSv, mins } from "@/lib/format";

const stars = (n) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

export function Card({ r, lightKcal = 500 }) {
  return (
    <Link href={`/recept/${r.id}`} className="card" style={{ "--rc": accentVar(r.accent) }}>
      <div className="img">{r.image ? <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="mono">{r.title?.[0]}</span>}</div>
      <div className="txt">
        <h3>{r.title}</h3>
        {r.allergens?.hits?.length > 0 && <span className="warnbadge">Innehåller {r.allergens.hits.join(" och ")}</span>}
        {r.short && <p>{r.short}</p>}
        <div className="meta"><b>{r.kitchen}</b><span>{r.type}</span><span>{mins(r.minutes)}</span>{r.kcal ? <span>{r.kcal} kcal</span> : null}{r.kcal && r.kcal <= lightKcal ? <span className="light">Lätt</span> : null}{r.allergens?.gluten === "nej" ? <span className="light">Glutenfri</span> : null}{r.allergens?.lactose === "nej" ? <span className="light">Laktosfri</span> : null}</div>
        <div className="meta">
          {r.rating ? <span className="stars" aria-label={`${r.rating} av 5`}>{stars(r.rating)}</span> : null}
          {r.lastCooked && <span>Lagad {dateSv(r.lastCooked)}</span>}
          {r.source && <span>{r.source}</span>}
        </div>
      </div>
    </Link>
  );
}

export function Pick({ r, note, badge }) {
  return (
    <Link href={`/recept/${r.id}`} className="pick" style={{ "--rc": accentVar(r.accent) }}>
      {r.image ? <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="mono">{r.title?.[0]}</span>}
      {badge && <span className="pbadge">{badge}</span>}
      <div className="cap"><b>{r.title}</b><span>{note || `${r.kitchen} · ${mins(r.minutes)}`}</span></div>
    </Link>
  );
}
