"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { accentVar, mins, daysSince } from "@/lib/format";
import { lsGet, lsSet } from "@/lib/api";

const thumb = (r) => r.image
  ? <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
  : <span className="mono">{r.title?.[0]}</span>;

function lastLine(r) {
  if (!r.timesCooked) return "Inte lagad än";
  const d = daysSince(r.lastCooked);
  return d === Infinity ? `Lagad ${r.timesCooked} gånger` : d < 1 ? "Lagad idag" : `Lagad för ${d} dagar sedan`;
}

// Bläddra kort för kort, som skivor i en back.
function Deck({ card, start = 0, onClose, onIndex }) {
  const items = card.items;
  const [i, setI] = useState(Math.min(start, items.length - 1));
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState(0); // -1 vänster, 1 höger
  const down = useRef(null);
  const dragged = useRef(false);

  const go = (step) => {
    const n = i + step;
    if (n < 0 || n >= items.length) { setDx(0); return; }
    setLeaving(step);
    setTimeout(() => { setI(n); setLeaving(0); setDx(0); }, 180);
  };
  useEffect(() => { onIndex?.(i); }, [i, onIndex]);
  useEffect(() => {
    const k = (e) => { if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); else if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    const o = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = o; };
  });
  useEffect(() => {
    try { sessionStorage.setItem("rb-order", JSON.stringify(items.map((r) => r.id))); } catch {}
  }, [items]);

  const r = items[i];
  const behind = items.slice(i + 1, i + 3);
  const pd = (e) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} dragged.current = false; down.current = { x: e.clientX, y: e.clientY, moved: false }; };
  const pm = (e) => { if (!down.current) return; const d = e.clientX - down.current.x; if (Math.abs(d) > 6) { down.current.moved = true; dragged.current = true; } setDx(d); };
  const pu = () => { if (!down.current) return; const moved = down.current.moved; down.current = null; if (dx < -60) go(1); else if (dx > 60) go(-1); else setDx(0); return moved; };

  return (
    <div className="deck-bg" role="dialog" aria-modal="true" aria-label={card.name} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="deck" style={{ "--dc": accentVar(card.color) }}>
        <div className="deck-h">
          <div><span className="deck-tab">{card.name}</span><span className="muted"> {i + 1} av {items.length}</span></div>
          <button type="button" className="hbtn" aria-label="Stäng" onClick={onClose}>×</button>
        </div>
        <div className="stack">
          {behind.map((b, j) => (
            <div key={b.id} className="sc behind" style={{ "--d": j + 1, "--rc": accentVar(b.accent) }} aria-hidden="true">
              <div className="sc-img">{thumb(b)}</div>
            </div>
          )).reverse()}
          <Link
            key={r.id} href={`/recept/${r.id}`} className={"sc front" + (leaving ? " leave" : "")} draggable={false}
            style={{ "--rc": accentVar(r.accent), transform: leaving ? `translateX(${leaving * -120}%) rotate(${leaving * -8}deg)` : `translateX(${dx}px) rotate(${dx / 30}deg)`, transition: dx && !leaving ? "none" : undefined }}
            onPointerDown={pd} onPointerMove={pm} onPointerUp={pu} onPointerCancel={() => { down.current = null; setDx(0); }}
            onClick={(e) => { if (dragged.current) e.preventDefault(); }}
          >
            <div className="sc-img">{thumb(r)}</div>
            <div className="sc-txt">
              <span className="sc-kicker">{[r.kitchen, r.type !== "Huvudrätt" ? r.type : null, mins(r.minutes), r.kcal ? `${r.kcal} kcal` : null].filter(Boolean).join(" · ")}</span>
              <h3>{r.title}</h3>
              {r.short && <p>{r.short}</p>}
              <div className="sc-foot">
                <span>{lastLine(r)}</span>
                {r.rating ? <span className="stars">{"★".repeat(r.rating)}</span> : null}
                {r.allergens?.hits?.length > 0 && <span className="warnbadge">Innehåller {r.allergens.hits.join(" och ")}</span>}
              </div>
            </div>
          </Link>
        </div>
        <div className="deck-nav">
          <button type="button" className="btn ghost" disabled={i === 0} onClick={() => go(-1)} aria-label="Föregående">‹</button>
          <div className="dots" aria-hidden="true">
            {items.length <= 14 ? items.map((x, j) => <span key={x.id} className={j === i ? "on" : ""} />) : <span className="on wide" style={{ "--p": (i + 1) / items.length }} />}
          </div>
          <button type="button" className="btn ghost" disabled={i === items.length - 1} onClick={() => go(1)} aria-label="Nästa">›</button>
        </div>
        <p className="hint deck-hint">Svep eller använd pilarna. Tryck på kortet för att öppna receptet.</p>
      </div>
    </div>
  );
}

function Divider({ card, n, onOpen }) {
  const faces = card.items.filter((r) => r.image).slice(0, 3);
  const fill = faces.length ? faces : card.items.slice(0, 3);
  return (
    <button type="button" className="divider" style={{ "--dc": accentVar(card.color), "--tab": `${(n % 4) * 12}%` }} onClick={onOpen}>
      <span className="dtab">{card.name}</span>
      <span className="dbody">
        <span className="dfan">{fill.map((r, j) => <span key={r.id} className="dthumb" style={{ "--j": j, "--rc": accentVar(r.accent) }}>{thumb(r)}</span>)}</span>
        <span className="dcount"><b>{card.items.length}</b> {card.items.length === 1 ? "kort" : "kort"}</span>
      </span>
    </button>
  );
}

export default function Box({ drawers }) {
  const [tab, setTab] = useState("ratt");
  const [open, setOpen] = useState(null); // { drawer, key, idx }
  useEffect(() => {
    setTab(lsGet("rb-drawer2", "ratt"));
    try { const s = JSON.parse(sessionStorage.getItem("rb-deck") || "null"); if (s) setOpen(s); } catch {}
  }, []);
  const drawer = drawers.find((d) => d.key === tab) || drawers[0];
  const openCard = useMemo(() => {
    if (!open) return null;
    return drawers.find((d) => d.key === open.drawer)?.cards.find((c) => c.key === open.key) || null;
  }, [open, drawers]);
  const save = (s) => { try { s ? sessionStorage.setItem("rb-deck", JSON.stringify(s)) : sessionStorage.removeItem("rb-deck"); } catch {} };
  const setIdx = useMemo(() => (idx) => { if (open) save({ ...open, idx }); }, [open]);

  return (
    <section className="box">
      <div className="box-h">
        <div>
          <h2>Receptlådan</h2>
          <p className="hint">{drawer.hint}</p>
        </div>
        <div className="boxswitch"><span className="flabel">Dela in efter</span>
        <div className="boxseg" role="tablist">
          {drawers.map((d) => (
            <button key={d.key} type="button" role="tab" aria-selected={d.key === drawer.key} onClick={() => { setTab(d.key); lsSet("rb-drawer2", d.key); }}>{d.name}</button>
          ))}
        </div></div>
      </div>
      <div className="dividers">
        {drawer.cards.map((c, n) => <Divider key={c.key} card={c} n={n} onOpen={() => { const s = { drawer: drawer.key, key: c.key, idx: 0 }; setOpen(s); save(s); }} />)}
        {!drawer.cards.length && <div className="empty">Inga kort här än.</div>}
      </div>
      {openCard && <Deck card={openCard} start={open.idx || 0} onIndex={setIdx} onClose={() => { setOpen(null); save(null); }} />}
    </section>
  );
}
