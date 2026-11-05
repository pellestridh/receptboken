"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { amtText } from "@/lib/format";
import { AISLE_ORDER } from "@/lib/aisles";
import { useApp } from "@/components/Providers";
import Staples from "@/components/Staples";
import Pantry from "@/components/Pantry";
import { useRecipes } from "@/components/useRecipes";
import Link from "next/link";
import { flatOffers, matchOffer } from "@/lib/offerMatch";

export default function Shopping() {
  const { toast } = useApp();
  const [items, setItems] = useState(null);
  const [custom, setCustom] = useState("");
  const [armed, setArmed] = useState(false);
  const [tab, setTab] = useState("lista");
  const { recipes } = useRecipes();
  useEffect(() => { if (new URLSearchParams(window.location.search).get("vy") === "hemma") setTab("hemma"); }, []);
  const [offers, setOffers] = useState([]);
  useEffect(() => { api("/api/offers").then((d) => setOffers(flatOffers(d.stores))).catch(() => {}); }, []);

  const load = useCallback(() => api("/api/shopping").then((d) => setItems(d.items)).catch((e) => toast(e.message)), [toast]);
  useEffect(() => {
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), 15000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [load]);

  async function check(it, done) {
    setItems((xs) => xs.map((x) => (x.id === it.id ? { ...x, done } : x)));
    try { await api(`/api/shopping/${it.id}`, { method: "PATCH", json: { done } }); } catch (e) { toast(e.message); load(); }
  }
  async function add(e) {
    e.preventDefault();
    if (!custom.trim()) return;
    const d = await api("/api/shopping", { method: "POST", json: { custom } }).catch((er) => { toast(er.message); return null; });
    if (d) { setItems(d.items); setCustom(""); }
  }
  async function clear(scope) {
    const d = await api(`/api/shopping?scope=${scope}`, { method: "DELETE" }).catch((er) => { toast(er.message); return null; });
    if (d) setItems(d.items);
    setArmed(false);
  }

  const list = items || [];
  const open = list.filter((i) => !i.done).length;
  const groups = AISLE_ORDER.map((a) => [a, list.filter((i) => (i.aisle || "Skafferi och övrigt") === a)]).filter(([, xs]) => xs.length);
  const other = list.filter((i) => !AISLE_ORDER.includes(i.aisle || "Skafferi och övrigt"));
  if (other.length) groups.push(["Övrigt", other]);

  return (
    <div className="shop">
      <div className="hero"><h1>Inköpslista</h1>
        <p className="muted" style={{ margin: 0 }}>{items ? `${open} varor kvar att handla. Listan är gemensam och sorterad efter butikens avdelningar.` : "Hämtar listan …"}</p>
      </div>
      <div className="boxseg shoptabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "lista"} onClick={() => setTab("lista")}>Listan{items ? ` (${open})` : ""}</button>
        <button type="button" role="tab" aria-selected={tab === "bas"} onClick={() => setTab("bas")}>Baslistan</button>
        <button type="button" role="tab" aria-selected={tab === "hemma"} onClick={() => setTab("hemma")}>Kvar hemma</button>
      </div>
      {tab === "hemma" ? <Pantry recipes={recipes} /> : tab === "bas" ? <Staples shopping={list} onAdded={load} offers={offers} /> : <>
      <form className="addrow" onSubmit={add}>
        <input id="add-in" className="tin" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Lägg till en egen vara" autoComplete="off" />
        <button className="btn" type="submit">Lägg till</button>
      </form>
      {offers.length > 0 && list.some((i) => !i.done && matchOffer(i.name, offers)) && (
        <p className="offbanner"><b>{list.filter((i) => !i.done && matchOffer(i.name, offers)).length} varor</b> på listan är på erbjudande. <Link href="/erbjudanden">Se veckans erbjudanden ›</Link></p>
      )}
      {items && !list.length && <div className="empty">Listan är tom. Öppna ett recept och tryck på Lägg i inköpslistan.</div>}
      {groups.map(([name, xs]) => (
        <div className="sgroup" key={name}>
          <h2>{name === "Skafferi" ? "Kolla skafferiet först" : name}</h2>
          <ul className="ing">
            {xs.map((it) => (
              <li className="sitem" key={it.id}>
                <label>
                  <input type="checkbox" checked={it.done} onChange={(e) => check(it, e.target.checked)} />
                  <span className="amt">{amtText(it)}</span>
                  <span>{it.name}{it.from?.length > 0 && <small>{it.from.join(", ")}</small>}{!it.done && (() => { const o = matchOffer(it.name, offers); return o ? <small className="offtag">{o.price} på {o.store}{o.member ? ` (${o.member})` : ""}</small> : null; })()}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {list.length > 0 && (
        <div className="arow">
          <button className="btn ghost" type="button" onClick={() => clear("done")}>Ta bort avbockade nu</button>
          {armed
            ? <button className="link" type="button" onClick={() => clear("all")}>Tryck igen för att tömma hela listan</button>
            : <button className="link" type="button" onClick={() => { setArmed(true); setTimeout(() => setArmed(false), 4000); }}>Töm hela listan</button>}
        </div>
      )}
      </>}
    </div>
  );
}
