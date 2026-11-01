"use client";
import { useEffect, useRef, useState } from "react";
import { api, getName } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { label } from "@/lib/drinkLabel";
import Link from "next/link";
import { styleFor } from "@/data/beer";
import { WineLog, WineNote } from "@/components/Wine";

function Label({ kind, d, small }) {
  const l = label(kind, d);
  return <span className={"dlabel " + l.tone + (small ? " sm" : "")}><i className="sw" aria-hidden="true" />{l.text}</span>;
}

const LABEL = { wine: "Vin", beer: "Öl", nonAlcoholic: "Alkoholfritt" };
const sb = (q) => `https://www.systembolaget.se/sok/?textQuery=${encodeURIComponent(q)}`;
// Gamla eller tomma förslag görs om automatiskt.
const usable = (d) => d && d.v >= 3 && d.wine?.name && d.beer?.name && !/<\/?parameter/.test(JSON.stringify(d));

function Product({ name, kind }) {
  if (kind === "nonAlcoholic") return <>{name}</>;
  return <a href={sb(name)} target="_blank" rel="noopener noreferrer">{name}</a>;
}

function DrinkCard({ kind, d, own = [], busy, onAction, onTaste }) {
  const [mode, setMode] = useState(null); // "swap" | "add"
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const close = () => { setMode(null); setText(""); setNote(""); };

  return (
    <div className="drink">
      <div className="dhead">
        <span className="dk">{LABEL[kind]}</span>
        {d?.liked && <span className="liked">Gillad</span>}
      </div>

      {own.map((o, i) => (
        <div className="own-pick" key={i}>
          <span className="ownbadge">Ert val{o.author ? ` · ${o.author}` : ""}</span>
          <b><Product name={o.name} kind={kind} /></b>
          {kind !== "nonAlcoholic" && !/none/.test(label(kind, o).tone) && <Label kind={kind} d={o} small />}
          {o.note && <p>{o.note}</p>}
          <button className="link" type="button" onClick={() => onAction({ action: "removeOwn", kind, index: i })}>Ta bort</button>
        </div>
      ))}

      {d && (
        <div className="sugg">
          <div className="lrow"><Label kind={kind} d={d} />{d.style && d.style !== d.name && <span className="style">{d.style}</span>}</div>
          <b><Product name={d.name} kind={kind} /></b>
          {d.why && <p>{d.why}</p>}
          {kind === "beer" && (() => { const st = styleFor(`${d.style} ${d.name}`); return st ? <Link className="stylelink" href={`/dryck/ol/${st.key}`}>Om {st.name.toLowerCase().startsWith("ipa") ? "IPA" : st.name.toLowerCase()} och mat ›</Link> : null; })()}
          {d.alternatives?.length > 0 && (
            <div className="alts"><span className="muted">Eller</span>{d.alternatives.map((a, i) => (
              <span key={i} className="alt">{kind !== "nonAlcoholic" && <i className={"sw " + label(kind, { ...a, color: a.color }).tone} aria-hidden="true" />}<Product name={a.name} kind={kind} />{a.style && <small>{a.style}</small>}</span>
            ))}</div>
          )}
        </div>
      )}

      {busy ? <span className="muted"><span className="spinner" />Tänker om …</span>
        : mode === "swap" ? (
          <form className="dform" onSubmit={(e) => { e.preventDefault(); onAction({ action: "feedback", kind, verdict: "down", reason: text }); close(); }}>
            <input className="tin" autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Vad var fel? (valfritt, hjälper nästa förslag)" />
            <div className="arow"><button className="btn" type="submit">Ge ett nytt förslag</button><button className="link" type="button" onClick={close}>Avbryt</button></div>
          </form>
        ) : mode === "add" ? (
          <form className="dform" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onAction({ action: "add", kind, name: text, note }); close(); } }}>
            <input className="tin" autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={kind === "beer" ? "Till exempel Orval" : kind === "wine" ? "Till exempel Domaine Weinbach Riesling" : "Till exempel Äppelmust från Kiviks"} />
            <input className="tin" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Varför den passar (valfritt)" />
            <div className="arow"><button className="btn" type="submit" disabled={!text.trim()}>Lägg till</button><button className="link" type="button" onClick={close}>Avbryt</button></div>
          </form>
        ) : (
          <div className="thumbs">
            {d && <button type="button" className="chip" aria-pressed={!!d.liked} onClick={() => onAction({ action: "feedback", kind, verdict: "up" })}>Bra val</button>}
            {d && <button type="button" className="chip" onClick={() => setMode("swap")}>Byt förslag</button>}
            <button type="button" className="chip" onClick={() => setMode("add")}>Lägg till eget</button>
            {kind === "wine" && <button type="button" className="chip taste-btn" onClick={() => onTaste(d)}>Vi provade ett vin</button>}
          </div>
        )}
    </div>
  );
}

export default function Drinks({ id, drinks: initial, onChange, title }) {
  const { toast } = useApp();
  const [drinks, setDrinks] = useState(initial || null);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState("");
  const started = useRef(false);
  const [notes, setNotes] = useState([]);
  const [tasting, setTasting] = useState(null);
  useEffect(() => { api(`/api/wine-notes?recept=${encodeURIComponent(id)}`).then((x) => setNotes(x.notes)).catch(() => {}); }, [id]);
  const delNote = (nid) => api(`/api/wine-notes/${nid}`, { method: "DELETE" }).then(() => setNotes((n) => n.filter((x) => x.id !== nid))).catch((e) => toast(e.message));
  const tastings = (
    <>
      {tasting && <div className="panel"><WineLog initial={tasting} recipeId={id} recipeTitle={title} onSaved={(n) => setNotes(n)} onCancel={() => setTasting(null)} /></div>}
      {notes.length > 0 && (
        <div className="tastings"><h3>Era provningar</h3><div className="wnotes">{notes.map((n) => <WineNote key={n.id} n={n} showRecipe={false} onDelete={delNote} />)}</div></div>
      )}
    </>
  );

  useEffect(() => { setDrinks(initial || null); }, [initial]);
  const generate = () => {
    setBusy("all"); setErr("");
    api(`/api/recipes/${id}/drinks`, { method: "POST", json: { action: "generate" } })
      .then((d) => { setDrinks(d.drinks); onChange?.(d.drinks); })
      .catch((e) => setErr(e.message))
      .finally(() => setBusy(null));
  };
  useEffect(() => {
    if (usable(initial) || started.current) return;
    started.current = true;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initial]);

  async function act(json) {
    setBusy(json.kind);
    try {
      const d = await api(`/api/recipes/${id}/drinks`, { method: "POST", json: { ...json, author: getName() } });
      setDrinks(d.drinks); onChange?.(d.drinks);
      if (json.verdict === "up") toast("Noterat. Förslagen lär sig av det.");
      if (json.action === "add") toast("Tillagt. Det används som exempel för nya recept.");
    } catch (e) { toast(e.message); } finally { setBusy(null); }
  }

  if (!usable(drinks)) {
    return (
      <section className="rsec"><h2>Att dricka till</h2>
        <div className="empty">
          {busy ? <><span className="spinner" />Claude väljer vin, öl och alkoholfritt …</> : <>{err || "Dryckesförslagen kunde inte hämtas just nu."} <button className="link" type="button" onClick={generate}>Försök igen</button></>}
        </div>
      </section>
    );
  }
  const order = drinks.order === "beer" ? ["beer", "wine", "nonAlcoholic"] : ["wine", "beer", "nonAlcoholic"];
  return (
    <section className="rsec"><h2>Att dricka till</h2>
      <div className="drinks">
        {order.map((k) => <DrinkCard key={k} kind={k} d={drinks[k]} own={drinks.own?.[k] || []} busy={busy === k} onAction={act} onTaste={(x) => setTasting({ wine: "", style: x?.style || "", color: x?.color || "" , suggested: x })} />)}
      </div>
      {tastings}
      <p className="hint">Namnen länkar till Systembolagets sökning. Era egna val och omdömen används när Claude föreslår drycker till nya recept.</p>
    </section>
  );
}
