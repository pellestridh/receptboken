"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, lsGet, lsSet } from "@/lib/api";
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
    const pick = suggest(recipes, { mode, exclude: inMenu, chosen, kcal: menu.kcal });
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
        <div><span className="kind">{KIND[menu.kind]}{menu.kcal ? ` · ${menu.kcal.min}–${menu.kcal.max} kcal per portion` : ""}</span><h2>{menu.title}</h2></div>
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
                <span><b>{it.title}</b><small>{it.kitchen} · {mins(it.minutes)}{it.kcal ? <> · <span className={menu.kcal && (it.kcal < menu.kcal.min || it.kcal > menu.kcal.max) ? "kout" : menu.kcal ? "kin" : ""}>{it.kcal} kcal</span></> : null}</small></span>
              </Link>
            ) : <span className="mdish muted">Ingen rätt vald</span>}
            <span className="mact">
              <button type="button" className="chip ico" aria-label="Byt till ett annat förslag" title="Byt" onClick={() => swap(it)}>↻</button>
              <button type="button" className="chip ico" aria-label="Välj recept själv" title="Välj" onClick={() => setPicking(picking === it.id ? null : it.id)}>⌕</button>
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
  const { recipes, reload } = useRecipes();
  const [menus, setMenus] = useState(null);
  const [busy, setBusy] = useState("");
  const [shopFor, setShopFor] = useState(null);
  useEffect(() => { api("/api/menus").then((d) => setMenus(d.menus)).catch((e) => toast(e.message)); }, [toast]);

  const [useKcal, setUseKcal] = useState(false);
  const [kmin, setKmin] = useState(600);
  const [kmax, setKmax] = useState(700);
  const [progress, setProgress] = useState("");
  useEffect(() => { const k = lsGet("rb-kcal", null); if (k) { setUseKcal(!!k.on); setKmin(k.min); setKmax(k.max); } }, []);
  useEffect(() => { lsSet("rb-kcal", { on: useKcal, min: kmin, max: kmax }); }, [useKcal, kmin, kmax]);

  const create = async (kind) => {
    setBusy(kind);
    try {
      if (useKcal) {
        // Räkna fram kalorier för huvudrätter som saknar dem, så att urvalet blir rätt.
        const missing = (recipes || []).filter((r) => !r.kcal && !r.allergens?.hits?.length && (r.type || "Huvudrätt").toLowerCase().includes(kind === "middag" ? "" : "huvudrätt")).slice(0, 10);
        for (let i = 0; i < missing.length; i++) {
          setProgress(`Räknar kalorier för ${missing[i].title} (${i + 1} av ${missing.length}) …`);
          try { await api(`/api/recipes/${missing[i].id}/nutrition`, { method: "POST" }); } catch {}
        }
        setProgress("");
      }
      const d = await api("/api/menus", { method: "POST", json: { kind, ...(useKcal ? { kcalMin: kmin, kcalMax: kmax } : {}) } });
      setMenus(d.menus); reload(); window.scrollTo(0, 0);
      const m = d.menus.find((x) => x.id === d.id);
      if (useKcal && m) {
        const out = m.items.filter((i) => i.recipeId && (!i.kcal || i.kcal < kmin || i.kcal > kmax)).length;
        if (out) toast(`${out} rätter ligger utanför ${kmin}–${kmax} kcal. Lägg in fler recept så blir urvalet större.`);
      }
    }
    catch (e) { toast(e.message); } finally { setBusy(""); setProgress(""); }
  };
  const list = useMemo(() => (recipes || []).filter((r) => !r.allergens?.hits?.length), [recipes]);

  if (shopFor) {
    return <StaplesPanel menu={shopFor} onCancel={() => setShopFor(null)} onDone={(n) => { toast(`${n} varor ligger i inköpslistan`); router.push("/inkop"); }} />;
  }
  return (
    <>
      <div className="hero"><h1>Matsedel</h1>
        <p className="muted" style={{ margin: 0 }}>Förslag på rätter ni inte ätit på ett tag. Byt det ni inte är sugna på.</p>
      </div>
      <div className="kcalopt">
        <label className="arow"><input type="checkbox" checked={useKcal} onChange={(e) => setUseKcal(e.target.checked)} /> <b>Kalorier per portion</b></label>
        {useKcal && (
          <span className="arow">
            <input className="tin knum" type="number" inputMode="numeric" value={kmin} onChange={(e) => setKmin(Number(e.target.value) || 0)} aria-label="Minst kcal" />
            <span>–</span>
            <input className="tin knum" type="number" inputMode="numeric" value={kmax} onChange={(e) => setKmax(Number(e.target.value) || 0)} aria-label="Högst kcal" />
            <span className="muted">kcal</span>
          </span>
        )}
      </div>
      {progress && <p className="hint"><span className="spinner" />{progress}</p>}
      <div className="createrow">
        <button className="btn" type="button" disabled={!!busy} onClick={() => create("vecka")}>{busy === "vecka" ? "Skapar …" : "Veckomeny"}</button>
        <button className="btn ghost" type="button" disabled={!!busy} onClick={() => create("helg")}>{busy === "helg" ? "Skapar …" : "Helg"}</button>
        <button className="btn ghost" type="button" disabled={!!busy} onClick={() => create("middag")}>{busy === "middag" ? "Skapar …" : "Trerätters"}</button>
      </div>
      {!menus && <div className="empty">Hämtar matsedlarna …</div>}
      {menus && !menus.length && <div className="empty">Ingen matsedel än. Tryck på Ny veckomeny så föreslår appen fyra middagar.</div>}
      <div className="menus">
        {(menus || []).map((m) => <MenuCard key={m.id} menu={m} recipes={list} setMenus={setMenus} onShop={setShopFor} />)}
      </div>
    </>
  );
}
