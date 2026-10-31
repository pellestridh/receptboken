"use client";
import { useEffect, useRef, useState } from "react";
import { api, getName } from "@/lib/api";
import { useApp } from "@/components/Providers";

const LABEL = { wine: "Vin", beer: "Öl", nonAlcoholic: "Alkoholfritt" };
const sbLink = (q) => `https://www.systembolaget.se/sok/?textQuery=${encodeURIComponent(q)}`;

function DrinkCard({ kind, d, onFeedback, busy }) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const [reason, setReason] = useState("");
  if (!d) return null;
  return (
    <div className={"drink" + (d.own ? " own" : "")}>
      <span className="dk">{LABEL[kind]}{d.own ? " · ert val" : d.liked ? " · gillat" : ""}</span>
      <b>{d.style}</b>
      <p>{d.why}</p>
      {d.examples?.length > 0 && kind !== "nonAlcoholic" && (
        <p className="ex">Till exempel {d.examples.map((e, i) => <span key={i}>{i > 0 && " eller "}<a href={sbLink(e)} target="_blank" rel="noopener noreferrer">{e}</a></span>)}</p>
      )}
      {busy ? <span className="muted"><span className="spinner" />Tänker om …</span> : open ? (
        <form className="dform" onSubmit={(e) => { e.preventDefault(); onFeedback(kind, "down", choice, reason); setOpen(false); }}>
          <input className="tin" value={choice} onChange={(e) => setChoice(e.target.value)} placeholder="Vad hade du valt? (valfritt)" />
          <input className="tin" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Varför? (valfritt)" />
          <div className="arow">
            <button className="btn" type="submit">{choice.trim() ? "Spara mitt val" : "Ge ett nytt förslag"}</button>
            <button className="link" type="button" onClick={() => setOpen(false)}>Avbryt</button>
          </div>
        </form>
      ) : (
        <div className="thumbs">
          <button type="button" className="chip" aria-pressed={!!d.liked} onClick={() => onFeedback(kind, "up")}>Bra val</button>
          <button type="button" className="chip" onClick={() => setOpen(true)}>Inte rätt</button>
        </div>
      )}
    </div>
  );
}

export default function Drinks({ id, drinks: initial, onChange }) {
  const { toast } = useApp();
  const [drinks, setDrinks] = useState(initial || null);
  const [busy, setBusy] = useState(null);
  const started = useRef(false);

  useEffect(() => { setDrinks(initial || null); }, [initial]);
  useEffect(() => {
    if (initial || started.current) return;
    started.current = true;
    setBusy("all");
    api(`/api/recipes/${id}/drinks`, { method: "POST", json: { action: "generate" } })
      .then((d) => { setDrinks(d.drinks); onChange?.(d.drinks); })
      .catch(() => {})
      .finally(() => setBusy(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initial]);

  async function feedback(kind, verdict, yourChoice, reason) {
    setBusy(kind);
    try {
      const d = await api(`/api/recipes/${id}/drinks`, { method: "POST", json: { action: "feedback", kind, verdict, yourChoice, reason, author: getName() } });
      setDrinks(d.drinks); onChange?.(d.drinks);
      if (verdict === "up") toast("Noterat. Förslagen lär sig av det.");
    } catch (e) { toast(e.message); } finally { setBusy(null); }
  }

  if (!drinks) {
    return (
      <section className="rsec"><h2>Att dricka till</h2>
        <div className="empty">{busy ? <><span className="spinner" />Claude föreslår drycker …</> : "Dryckesförslagen kunde inte hämtas just nu."}</div>
      </section>
    );
  }
  const order = drinks.order === "beer" ? ["beer", "wine", "nonAlcoholic"] : ["wine", "beer", "nonAlcoholic"];
  return (
    <section className="rsec"><h2>Att dricka till</h2>
      <div className="drinks">
        {order.map((k) => <DrinkCard key={k} kind={k} d={drinks[k]} busy={busy === k} onFeedback={feedback} />)}
      </div>
      <p className="hint">Tryck Bra val eller Inte rätt. Dina val sparas och styr förslagen till nya recept.</p>
    </section>
  );
}
