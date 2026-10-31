"use client";
import { useEffect, useRef, useState } from "react";
import { api, getName } from "@/lib/api";
import { useApp } from "@/components/Providers";

const LABEL = { wine: "Vin", beer: "Öl", nonAlcoholic: "Alkoholfritt" };
const sb = (q) => `https://www.systembolaget.se/sok/?textQuery=${encodeURIComponent(q)}`;
// Gamla eller tomma förslag görs om automatiskt.
const usable = (d) => d && d.v === 2 && d.wine?.name && d.beer?.name && !/<\/?parameter/.test(JSON.stringify(d));

function Product({ name, kind }) {
  if (kind === "nonAlcoholic") return <>{name}</>;
  return <a href={sb(name)} target="_blank" rel="noopener noreferrer">{name}</a>;
}

function DrinkCard({ kind, d, own = [], busy, onAction }) {
  const [mode, setMode] = useState(null); // "swap" | "add"
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const close = () => { setMode(null); setText(""); setNote(""); };

  return (
    <div className="drink">
      <span className="dk">{LABEL[kind]}{d?.liked ? " · gillat" : ""}</span>

      {own.map((o, i) => (
        <div className="own-pick" key={i}>
          <span className="ownbadge">Ert val{o.author ? ` · ${o.author}` : ""}</span>
          <b><Product name={o.name} kind={kind} /></b>
          {o.note && <p>{o.note}</p>}
          <button className="link" type="button" onClick={() => onAction({ action: "removeOwn", kind, index: i })}>Ta bort</button>
        </div>
      ))}

      {d && (
        <div className="sugg">
          <b><Product name={d.name} kind={kind} /></b>
          {d.style && d.style !== d.name && <span className="style">{d.style}</span>}
          {d.why && <p>{d.why}</p>}
          {d.alternatives?.length > 0 && (
            <p className="ex">Eller {d.alternatives.map((a, i) => <span key={i}>{i > 0 && ", "}<Product name={a.name} kind={kind} /></span>)}</p>
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
          </div>
        )}
    </div>
  );
}

export default function Drinks({ id, drinks: initial, onChange }) {
  const { toast } = useApp();
  const [drinks, setDrinks] = useState(initial || null);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState("");
  const started = useRef(false);

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
        {order.map((k) => <DrinkCard key={k} kind={k} d={drinks[k]} own={drinks.own?.[k] || []} busy={busy === k} onAction={act} />)}
      </div>
      <p className="hint">Namnen länkar till Systembolagets sökning. Era egna val och omdömen används när Claude föreslår drycker till nya recept.</p>
    </section>
  );
}
