"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { WineLog, WineNote, ProfileBars, swatch, itemFor, profileOf, COLORS } from "@/components/Wine";
import { STYLES, FAMILIES, styleByKey } from "@/data/beer";
import { GRAPES } from "@/data/wine";
import { beerProfile } from "@/data/beerSchool";
import { dateSv } from "@/lib/format";

const sb = (q) => `https://www.systembolaget.se/sok/?textQuery=${encodeURIComponent(q)}`;
const sub = (d) => (d.style && d.it && d.style.toLowerCase().includes(d.it.name.toLowerCase().split(" ")[0]) ? d.style : [d.it?.name, d.style].filter(Boolean).join(" · "));
const star = (v) => (v ? v.toFixed(1).replace(".", ",") : "–");

// Samlar provningar och favoriter till en rad per dryck.
function group(notes, kind) {
  const by = new Map();
  for (const n of notes) {
    const k = n.wine.trim().toLowerCase();
    const g = by.get(k) || { key: k, name: n.wine.trim(), notes: [], fav: false };
    g.notes.push(n);
    g.fav ||= n.fav;
    by.set(k, g);
  }
  return [...by.values()].map((g) => {
    const rated = g.notes.filter((n) => n.rating);
    const avg = rated.length ? rated.reduce((a, n) => a + n.rating, 0) / rated.length : 0;
    const first = g.notes.find((n) => n.style) || g.notes[0];
    const it = itemFor(kind, `${first.style || ""} ${g.name}`, first.grape);
    const color = g.notes.find((n) => n.color)?.color || (kind === "wine" ? GRAPES.find((x) => x.key === it?.key)?.color : null);
    const recipes = [...new Map(g.notes.filter((n) => n.recipeId).map((n) => [n.recipeId, { id: n.recipeId, title: n.recipeTitle, match: n.match }])).values()];
    const tasted = rated.length;
    const last = g.notes.map((n) => n.createdAt).sort().pop();
    const liked = g.fav || avg >= 4;
    return { ...g, avg, style: first.style, it, color, recipes, tasted, last, liked, nope: tasted > 0 && avg > 0 && avg <= 2 && !g.fav };
  });
}

export default function Cellar({ kind }) {
  const beer = kind === "beer";
  const { toast } = useApp();
  const [notes, setNotes] = useState(null);
  const [show, setShow] = useState("alla");
  const [fam, setFam] = useState("");
  const [sort, setSort] = useState("senast");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState(null); // "log" | "fav"
  const [fav, setFav] = useState({ name: "", style: "", note: "" });
  useEffect(() => { setNotes(null); api(`/api/wine-notes?typ=${kind}`).then((d) => setNotes(d.notes)).catch(() => setNotes([])); }, [kind]);
  const drinks = useMemo(() => group(notes || [], kind), [notes, kind]);
  const famOf = (d) => (beer ? styleByKey(d.it?.key)?.family || "" : d.color || "");
  const fams = beer ? FAMILIES.map((f) => [f.key, f.name]) : COLORS.map(([k, l]) => [k, l]);
  const list = drinks
    .filter((d) => show === "alla" || (show === "gillar" ? d.liked : show === "provat" ? d.tasted > 0 : d.nope))
    .filter((d) => !fam || famOf(d) === fam)
    .filter((d) => !q || `${d.name} ${d.style || ""} ${d.it?.name || ""}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === "betyg" ? (b.avg || 0) - (a.avg || 0) : sort === "az" ? a.name.localeCompare(b.name, "sv") : String(b.last).localeCompare(String(a.last)));
  const count = (k) => drinks.filter((d) => k === "alla" || (k === "gillar" ? d.liked : k === "provat" ? d.tasted > 0 : d.nope)).length;

  const cands = beer ? STYLES.map((s) => ({ key: s.key, name: s.name, p: beerProfile(s), href: `/dryck/ol/${s.key}` })) : GRAPES.map((g) => ({ key: g.key, name: g.name, p: g.p, href: `/dryck/vin/druva/${g.key}` }));
  const prof = notes ? profileOf(kind, notes, cands) : null;
  const toggleFav = (d, on) => api("/api/wine-notes", { method: "POST", json: { action: "fav", kind, name: d.name, style: d.style, color: d.color, on } }).then((x) => { setNotes(x.notes); toast(on ? `${d.name} ligger under Gillar` : `${d.name} är borttagen ur Gillar`); }).catch((e) => toast(e.message));
  const addFav = (e) => { e.preventDefault(); toggleFav({ name: fav.name, style: fav.style, note: fav.note }, true).then(() => { setFav({ name: "", style: "", note: "" }); setAdding(null); }); };
  const del = (id) => api(`/api/wine-notes/${id}`, { method: "DELETE" }).then(() => setNotes((n) => n.filter((x) => x.id !== id))).catch((e) => toast(e.message));
  const cur = open && drinks.find((d) => d.key === open);
  const word = beer ? "öl" : "viner";

  return (
    <section className="dsec cellar">
      <div className="section-h" style={{ margin: 0 }}>
        <h2>{beer ? "Våra öl" : "Våra viner"}</h2>
        <span className="arow"><button className="btn" type="button" onClick={() => setAdding(adding === "log" ? null : "log")}>{beer ? "Logga en öl" : "Logga ett vin"}</button><button className="btn ghost" type="button" onClick={() => setAdding(adding === "fav" ? null : "fav")}>Lägg till en favorit</button></span>
      </div>
      {adding === "log" && <div className="panel"><WineLog kind={kind} onSaved={(n) => setNotes(n)} onCancel={() => setAdding(null)} /></div>}
      {adding === "fav" && (
        <form className="panel favadd" onSubmit={addFav}>
          <input className="tin" value={fav.name} onChange={(e) => setFav({ ...fav, name: e.target.value })} placeholder={beer ? "Till exempel Westmalle Tripel" : "Till exempel Tommasi Ripasso"} autoFocus />
          <input className="tin" value={fav.style} onChange={(e) => setFav({ ...fav, style: e.target.value })} placeholder={beer ? "Stil, valfritt" : "Druva eller område, valfritt"} />
          <input className="tin" value={fav.note} onChange={(e) => setFav({ ...fav, note: e.target.value })} placeholder="Varför ni gillar den, valfritt" />
          <button className="btn" type="submit" disabled={!fav.name.trim()}>Spara</button>
        </form>
      )}

      <div className="quick">{[["alla", "Alla"], ["gillar", "Gillar"], ["provat", "Provat"], ["nope", "Inte för oss"]].map(([k, l]) => <button key={k} type="button" className="chip" aria-pressed={show === k} onClick={() => setShow(k)}>{l} <span className="muted">{count(k)}</span></button>)}</div>
      {drinks.length > 4 && (
        <div className="cl-filters">
          <input className="tin" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Sök bland era ${word}`} />
          <select className="tin" value={fam} onChange={(e) => setFam(e.target.value)} aria-label={beer ? "Stilfamilj" : "Färg"}><option value="">{beer ? "Alla stilar" : "Alla färger"}</option>{fams.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <select className="tin" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sortera"><option value="senast">Senast</option><option value="betyg">Bäst betyg</option><option value="az">A–Ö</option></select>
        </div>
      )}

      {notes && !drinks.length && !adding && <div className="empty">Inga {word} än. Logga en provning, eller lägg till en favorit ni vet att ni gillar.</div>}
      {!notes && <div className="empty">Hämtar …</div>}
      <div className="clgrid">{list.map((d) => (<Fragment key={d.key}>
        <button type="button" className={"clcard" + (open === d.key ? " on" : "")} onClick={() => setOpen(open === d.key ? null : d.key)}>
          <span className="cl-sw" style={{ background: d.color ? swatch(d.color) : d.it?.color || "var(--line)" }} />
          <span className="cl-t">
            <b>{d.name}</b>
            <span className="muted">{sub(d) || (beer ? "Öl" : "Vin")}</span>
            <span className="cl-m">{d.liked && <i className="cl-heart" aria-label="Gillar">♥</i>}{d.tasted > 0 ? <><span className="cl-star">★ {star(d.avg)}</span> <span className="muted">{d.tasted} {d.tasted === 1 ? "provning" : "provningar"}</span></> : <span className="muted">Inte provad i appen</span>}</span>
          </span>
        </button>
        {open === d.key && cur && (
        <div className="panel cl-detail">
          <p className="muted cl-dh"><span>{sub(cur)}{cur.last ? ` · senast ${dateSv(cur.last)}` : ""}</span><button type="button" className="link" onClick={() => setOpen(null)}>Stäng</button></p>
          <p className="arow">
            <button className={"chip" + (cur.fav ? " on" : "")} aria-pressed={cur.fav} type="button" onClick={() => toggleFav(cur, !cur.fav)}>{cur.fav ? "♥ Gillar" : "♡ Gillar"}</button>
            <a className="chip" href={sb(cur.name)} target="_blank" rel="noopener noreferrer">Systembolaget ›</a>
            {cur.it && <Link className="chip" href={cur.it.href}>Om {cur.it.name.toLowerCase()} ›</Link>}
          </p>
          {cur.recipes.length > 0 && <p><b>Druckits till:</b> {cur.recipes.map((r, i) => <span key={r.id}>{i > 0 && ", "}<Link href={`/recept/${r.id}`}>{r.title}</Link>{r.match ? ` (${r.match}/5)` : ""}</span>)}</p>}
          <div className="wnotes">{cur.notes.filter((n) => n.rating || n.note || n.recipeId).map((n) => <WineNote key={n.id} n={n} onDelete={del} />)}</div>
        </div>
        )}
      </Fragment>))}</div>
      {notes && drinks.length > 0 && !list.length && <div className="empty">Inget som matchar.</div>}


      <details className="cl-prof" open={!!prof?.liked}>
        <summary><h2>Er smakprofil</h2></summary>
        {!prof?.liked ? <p className="muted">Profilen byggs av det ni gett fyra eller fem stjärnor och där ni fyllt i Känn efter. Det ni gillar och betygsätter väger in när Claude föreslår {beer ? "öl" : "vin"}, efter att det passar maten.</p> : (
          <div className="duo">
            <div className="card2"><h3>Det ni gillar</h3><ProfileBars p={prof.avg} kind={kind} /><p className="hint">Av {prof.liked} med högt betyg.</p></div>
            <div className="card2">
              <h3>{beer ? "Era stilar" : "Era druvor"}</h3>
              {prof.ranked.length ? <ul className="glist">{prof.ranked.slice(0, 5).map((x) => <li key={x.it.key}><Link href={x.it.href}>{x.it.name}</Link> <span className="muted">{x.avg.toFixed(1).replace(".", ",")} av 5, {x.n} st</span></li>)}</ul> : <p className="muted">Inga igenkända än.</p>}
              {prof.suggest.length > 0 && <><h3 style={{ marginTop: ".8rem" }}>Prova härnäst</h3><p>{prof.suggest.map((c, i) => <span key={c.key}>{i > 0 && ", "}<Link href={c.href}>{c.name}</Link></span>)}</p></>}
            </div>
          </div>
        )}
      </details>
    </section>
  );
}
