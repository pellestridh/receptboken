"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { amtText } from "@/lib/format";
import { AISLE_ORDER } from "@/lib/aisles";
import { useApp } from "@/components/Providers";

export default function Shopping() {
  const { toast } = useApp();
  const [items, setItems] = useState(null);
  const [custom, setCustom] = useState("");
  const [armed, setArmed] = useState(false);
  const [staples, setStaples] = useState([]);
  const [sel, setSel] = useState({});
  const [newStaple, setNewStaple] = useState("");
  const [editStaples, setEditStaples] = useState(false);

  const load = useCallback(() => api("/api/shopping").then((d) => setItems(d.items)).catch((e) => toast(e.message)), [toast]);
  useEffect(() => {
    api("/api/staples").then((d) => { setStaples(d.staples); setSel(Object.fromEntries(d.staples.map((x) => [x.id, x.selected]))); }).catch(() => {});
  }, []);
  async function staplesAct(json) {
    const d = await api("/api/staples", { method: "POST", json }).catch((er) => { toast(er.message); return null; });
    if (d) { setStaples(d.staples); setSel((cur) => ({ ...Object.fromEntries(d.staples.map((x) => [x.id, cur[x.id] ?? true])) })); }
    return d;
  }
  async function staplesToList() {
    const ids = Object.entries(sel).filter(([, v]) => v).map(([k]) => k);
    if (!ids.length) return;
    if (await staplesAct({ toShopping: ids })) { toast(`${ids.length} varor från baslistan ligger i listan`); load(); }
  }
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
      <form className="addrow" onSubmit={add}>
        <input id="add-in" className="tin" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Lägg till en egen vara" autoComplete="off" />
        <button className="btn" type="submit">Lägg till</button>
      </form>
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
                  <span>{it.name}{it.from?.length > 0 && <small>{it.from.join(", ")}</small>}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {list.length > 0 && (
        <div className="arow">
          <button className="btn ghost" type="button" onClick={() => clear("done")}>Ta bort avbockade</button>
          {armed
            ? <button className="link" type="button" onClick={() => clear("all")}>Tryck igen för att tömma hela listan</button>
            : <button className="link" type="button" onClick={() => { setArmed(true); setTimeout(() => setArmed(false), 4000); }}>Töm hela listan</button>}
        </div>
      )}
      <section className="panel">
        <h2 style={{ fontSize: "1.4rem" }}>Baslistan</h2>
        <p className="hint">Det ni brukar handla oavsett meny. Markera det som behövs och lägg till det i listan.{" "}
          {staples.length > 0 && <button className="link" type="button" onClick={() => setEditStaples(!editStaples)}>{editStaples ? "Klar" : "Ändra baslistan"}</button>}</p>
        <div className="frow">
          {staples.map((x) => (
            editStaples
              ? <button key={x.id} type="button" className="chip" aria-label={`Ta bort ${x.name}`} onClick={() => staplesAct({ remove: x.id })}>{x.name} ✕</button>
              : <button key={x.id} type="button" className="chip" aria-pressed={!!sel[x.id]} onClick={() => setSel({ ...sel, [x.id]: !sel[x.id] })}>{x.name}</button>
          ))}
          {!staples.length && <span className="muted">Baslistan är tom än.</span>}
        </div>
        <form className="addrow" style={{ margin: 0 }} onSubmit={(e) => { e.preventDefault(); if (newStaple.trim()) staplesAct({ add: newStaple }).then(() => setNewStaple("")); }}>
          <input className="tin" value={newStaple} onChange={(e) => setNewStaple(e.target.value)} placeholder="Till exempel mjölk, kaffe, bröd" />
          <button className="btn ghost" type="submit">Lägg till</button>
        </form>
        {staples.length > 0 && <div><button className="btn" type="button" onClick={staplesToList}>Lägg valda i inköpslistan</button></div>}
      </section>
    </div>
  );
}
