"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useRecipes } from "@/components/useRecipes";
import { useApp } from "@/components/Providers";
import { suggest } from "@/lib/suggest";
import { accentVar, mins } from "@/lib/format";

const DAYS = ["sön", "mån", "tis", "ons", "tor", "fre", "lör"];
const dayLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
};
const KIND = { vecka: "Veckomeny", helg: "Helgmeny", middag: "Trerätters" };
const MODE = { vecka: "vardag", helg: "helg" };
const courseMode = (c) => (c === "Förrätt" ? "forratt" : c === "Dessert" ? "dessert" : "helg");

function Picker({ recipes, onPick, onClose }) {
  const [q, setQ] = useState("");
  const hits = recipes.filter((r) => `${r.title} ${r.kitchen} ${r.base} ${r.ingredients}`.toLowerCase().includes(q.toLowerCase())).slice(0, 12);
  return (
    <div className="picker">
      <div className="arow">
        <input className="tin" autoFocus placeholder="Sök bland era recept" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="link" type="button" onClick={onClose}>Stäng</button>
      </div>
      <ul className="plist">
        {hits.map((r) => (
          <li key={r.id}><button type="button" onClick={() => onPick(r)} style={{ "--rc": accentVar(r.accent) }}>
            <span className="dot" />{r.title}<span className="muted"> · {r.kitchen} · {mins(r.minutes)}</span>
          </button></li>
        ))}
        {!hits.length && <li className="muted">Inget recept matchar.</li>}
      </ul>
    </div>
  );
}

function MenuCard({ menu, recipes, setMenus, onShop }) {
  const { toast } = useApp();
  const [picking, setPicking] = useState(null);
  const [armed, setArmed] = useState(false);
  const patchItem = async (item, json) => {
    try { const d = await api(`/api/menus/${menu.id}/items/${item.id}`, { method: "PATCH", json }); setMenus(d.menus); }
    catch (e) { toast(e.message); }
  };
  const swap = (item) => {
    const inMenu = menu.items.map((i) => i.recipeId).filter(Boolean);
    const chosen = menu.items.filter((i) => i.recipeId && i.id !== item.id).map((i) => recipes.find((r) => r.id === i.recipeId)).filter(Boolean);
    const mode = menu.kind === "middag" ? courseMode(item.course) : MODE[menu.kind];
    const pick = suggest(recipes, { mode, exclude: inMenu, chosen });
    if (!pick) { toast("Inga fler förslag. Välj ett recept själv."); return; }
    patchItem(item, { recipeId: pick.id });
  };
  const del = async () => {
    try { const d = await api(`/api/menus/${menu.id}`, { method: "DELETE" }); setMenus(d.menus); } catch (e) { toast(e.message); }
  };
  const addDay = async () => {
    try { const d = await api(`/api/menus/${menu.id}`, { method: "PATCH", json: { addItem: { day: menu.items.at(-1)?.day || null } } }); setMenus(d.menus); } catch (e) { toast(e.message); }
  };
  const filled = menu.items.filter((i) => i.recipeId).length;

  return (
    <section className="menu">
      <header className="mhead">
        <div><span className="kind">{KIND[menu.kind]}</span><h2>{menu.title}</h2></div>
        <div className="stepper" role="group" aria-label="Antal personer">
          <button type="button" aria-label="Färre" onClick={() => api(`/api/menus/${menu.id}`, { method: "PATCH", json: { servings: Math.max(1, menu.servings - 1) } }).then((d) => setMenus(d.menus))}>−</button>
          <span>{menu.servings} pers</span>
          <button type="button" aria-label="Fler" onClick={() => api(`/api/menus/${menu.id}`, { method: "PATCH", json: { servings: menu.servings + 1 } }).then((d) => setMenus(d.menus))}>+</button>
        </div>
      </header>
      <ol className="mitems">
        {menu.items.map((it) => (
          <li key={it.id} className="mitem" style={{ "--rc": accentVar(it.accent) }}>
            <span className="when">{menu.kind === "middag" ? it.course : dayLabel(it.day)}</span>
            {it.recipeId ? (
              <Link href={`/recept/${it.recipeId}`} className="mdish">
                <span className="thumb">{it.image && <img src={it.image} alt="" referrerPolicy="no-referrer" />}</span>
                <span><b>{it.title}</b><small>{it.kitchen} · {mins(it.minutes)}</small></span>
              </Link>
            ) : <span className="mdish muted">Ingen rätt vald</span>}
            <span className="mact">
              <button type="button" className="chip" onClick={() => swap(it)}>Byt</button>
              <button type="button" className="chip" onClick={() => setPicking(picking === it.id ? null : it.id)}>Välj</button>
              <button type="button" className="link" aria-label="Ta bort rätten" onClick={() => api(`/api/menus/${menu.id}/items/${it.id}`, { method: "DELETE" }).then((d) => setMenus(d.menus))}>✕</button>
            </span>
            {picking === it.id && <Picker recipes={recipes} onClose={() => setPicking(null)} onPick={(r) => { setPicking(null); patchItem(it, { recipeId: r.id }); }} />}
          </li>
        ))}
      </ol>
      <div className="arow">
        <button className="btn" type="button" disabled={!filled} onClick={() => onShop(menu)}>Skapa inköpslista</button>
        {menu.kind !== "middag" && <button className="btn ghost" type="button" onClick={addDay}>Lägg till en dag</button>}
        {armed
          ? <button className="link" type="button" onClick={del}>Tryck igen för att ta bort menyn</button>
          : <button className="link" type="button" onClick={() => { setArmed(true); setTimeout(() => setArmed(false), 4000); }}>Ta bort menyn</button>}
      </div>
    </section>
  );
}

function StaplesPanel({ menu, onDone, onCancel }) {
  const { toast } = useApp();
  const [staples, setStaples] = useState(null);
  const [sel, setSel] = useState({});
  const [add, setAdd] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/api/staples").then((d) => { setStaples(d.staples); setSel(Object.fromEntries(d.staples.map((s) => [s.id, s.selected]))); }).catch((e) => toast(e.message));
  }, [toast]);
  const addStaple = async (e) => {
    e.preventDefault(); if (!add.trim()) return;
    const d = await api("/api/staples", { method: "POST", json: { add } }).catch((er) => { toast(er.message); return null; });
    if (d) { setStaples(d.staples); setSel((s) => ({ ...s, ...Object.fromEntries(d.staples.filter((x) => !(x.id in s)).map((x) => [x.id, true])) })); setAdd(""); }
  };
  const go = async () => {
    setBusy(true);
    try {
      const ids = Object.entries(sel).filter(([, v]) => v).map(([k]) => k);
      const d = await api(`/api/menus/${menu.id}/shop`, { method: "POST", json: { staples: ids } });
      onDone(d.added);
    } catch (e) { toast(e.message); setBusy(false); }
  };
  return (
    <div className="panel narrow">
      <h2 style={{ fontSize: "1.5rem" }}>Inköpslista för {menu.title}</h2>
      <p className="hint">Alla rätter i menyn läggs i inköpslistan. Kryssa i det ni också behöver från baslistan.</p>
      {staples && !staples.length && <p className="hint">Baslistan är tom. Lägg till det ni brukar handla, till exempel mjölk, kaffe, bröd, frukt. Flera på en gång går att skriva med kommatecken.</p>}
      <div className="frow">
        {(staples || []).map((s) => (
          <button key={s.id} type="button" className="chip" aria-pressed={!!sel[s.id]} onClick={() => setSel({ ...sel, [s.id]: !sel[s.id] })}>{s.name}</button>
        ))}
      </div>
      <form className="addrow" onSubmit={addStaple}>
        <input className="tin" value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Lägg till i baslistan" />
        <button className="btn ghost" type="submit">Lägg till</button>
      </form>
      <div className="arow">
        <button className="btn" type="button" disabled={busy} onClick={go}>{busy ? "Skapar …" : "Skapa inköpslistan"}</button>
        <button className="link" type="button" onClick={onCancel}>Avbryt</button>
      </div>
    </div>
  );
}

export default function Menus() {
  const router = useRouter();
  const { toast } = useApp();
  const { recipes } = useRecipes();
  const [menus, setMenus] = useState(null);
  const [busy, setBusy] = useState("");
  const [shopFor, setShopFor] = useState(null);
  useEffect(() => { api("/api/menus").then((d) => setMenus(d.menus)).catch((e) => toast(e.message)); }, [toast]);

  const create = async (kind) => {
    setBusy(kind);
    try { const d = await api("/api/menus", { method: "POST", json: { kind } }); setMenus(d.menus); window.scrollTo(0, 0); }
    catch (e) { toast(e.message); } finally { setBusy(""); }
  };
  const list = useMemo(() => recipes || [], [recipes]);

  if (shopFor) {
    return <StaplesPanel menu={shopFor} onCancel={() => setShopFor(null)} onDone={(n) => { toast(`${n} varor ligger i inköpslistan`); router.push("/inkop"); }} />;
  }
  return (
    <>
      <div className="hero"><h1>Matsedel</h1>
        <p className="muted" style={{ margin: 0 }}>Appen föreslår rätter ni inte ätit på ett tag, med variation i kök och råvaror. Byt det ni inte är sugna på och skapa inköpslistan med ett tryck.</p>
      </div>
      <div className="arow" style={{ marginBottom: "1.5rem" }}>
        <button className="btn" type="button" disabled={!!busy} onClick={() => create("vecka")}>{busy === "vecka" ? "Skapar …" : "Ny veckomeny, mån–tor"}</button>
        <button className="btn ghost" type="button" disabled={!!busy} onClick={() => create("helg")}>{busy === "helg" ? "Skapar …" : "Ny helgmeny"}</button>
        <button className="btn ghost" type="button" disabled={!!busy} onClick={() => create("middag")}>{busy === "middag" ? "Skapar …" : "Ny trerätters"}</button>
      </div>
      {!menus && <div className="empty">Hämtar matsedlarna …</div>}
      {menus && !menus.length && <div className="empty">Ingen matsedel än. Tryck på Ny veckomeny så föreslår appen fyra middagar.</div>}
      <div className="menus">
        {(menus || []).map((m) => <MenuCard key={m.id} menu={m} recipes={list} setMenus={setMenus} onShop={setShopFor} />)}
      </div>
    </>
  );
}
