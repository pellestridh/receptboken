"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { useRecipes } from "@/components/useRecipes";
import { flatOffers, matchOffer, recipesOnOffer } from "@/lib/offerMatch";
import { accentVar, mins, dateSv } from "@/lib/format";

function Offer({ o, showStore }) {
  return (
    <div className="offer">
      <div className="of-p">{o.price}</div>
      <div className="of-t">
        <b>{o.name}</b>
        <span className="muted">{[o.brand, o.size, o.unitPrice ? `jmf ${o.unitPrice}` : "", o.ordPrice ? `ord ${o.ordPrice}` : ""].filter(Boolean).join(" · ")}</span>
        <span className="of-tags">{showStore && <i>{o.store}</i>}{o.member && <i className="mem">{o.member}</i>}{o.limit && <i>{o.limit}</i>}</span>
      </div>
    </div>
  );
}

export default function Offers() {
  const { toast } = useApp();
  const { recipes } = useRecipes();
  const [stores, setStores] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(null);
  const [shop, setShop] = useState([]);
  const [staples, setStaples] = useState([]);
  const [q, setQ] = useState("");
  const [store, setStore] = useState(null);
  const [cat, setCat] = useState(null);
  const [foodOnly, setFoodOnly] = useState(true);
  useEffect(() => {
    api("/api/offers").then((d) => setStores(d.stores)).catch((e) => setErr(e.message));
    api("/api/shopping").then((d) => setShop(d.items)).catch(() => {});
    api("/api/staples").then((d) => setStaples(d.staples || [])).catch(() => {});
  }, []);
  const all = useMemo(() => flatOffers(stores), [stores]);
  const onList = shop.filter((i) => !i.done).map((i) => ({ i, o: matchOffer(i.name, all) })).filter((x) => x.o);
  const listed = new Set(shop.filter((i) => !i.done).map((i) => i.name.toLowerCase()));
  const onBase = staples.filter((s) => !listed.has(s.name.toLowerCase())).map((s) => ({ s, o: matchOffer(s.name, all) })).filter((x) => x.o);
  const addBase = (s) => api("/api/staples", { method: "POST", json: { toShopping: [s.id] } }).then(() => { setShop((x) => [...x, { id: "n" + s.id, name: s.name, done: false }]); toast(`${s.name} ligger i inköpslistan`); }).catch((e) => toast(e.message));
  const good = useMemo(() => recipesOnOffer((recipes || []).filter((r) => !r.allergens?.hits?.length && /huvud/i.test(r.type || "Huvudrätt")), all).slice(0, 6), [recipes, all]);
  const cats = [...new Set(all.filter((o) => !foodOnly || o.food).map((o) => o.category))].sort((a, b) => a.localeCompare(b, "sv"));
  const list = all.filter((o) => (!foodOnly || o.food) && (!store || o.storeKey === store) && (!cat || o.category === cat) && (!q || `${o.name} ${o.brand} ${(o.ingredients || []).join(" ")}`.toLowerCase().includes(q.toLowerCase())));
  const refresh = (k) => { setBusy(k); api("/api/offers", { method: "POST", json: { refresh: k } }).then((d) => { setStores(d.stores); toast("Uppdaterat"); }).catch((e) => toast(e.message)).finally(() => setBusy(null)); };

  return (
    <div className="narrow offers">
      <div className="hero">
        <span className="kicker">Veckans erbjudanden</span>
        <h1>Erbjudanden</h1>
        <p className="muted" style={{ margin: 0 }}>Hämtas från butikernas sidor en gång om dagen. Varor på er inköpslista och i baslistan, och recept som passar, visas först.</p>
      </div>
      {err && <div className="empty">{err}</div>}
      {!stores && !err && <div className="empty"><span className="spinner" />Hämtar erbjudanden. Första gången tar det en stund, Claude läser igenom butikernas sidor …</div>}
      {stores && (
        <>
          <div className="storehead">{stores.map((s) => (
            <div key={s.key} className="sh">
              <b>{s.name}</b>
              <span className="muted">{s.error ? <span className="err">{s.error}</span> : `${s.offers.length} erbjudanden${s.validTo ? `, gäller t.o.m. ${dateSv(s.validTo)}` : ""}${s.fetchedAt ? `, hämtat ${dateSv(s.fetchedAt)}` : ""}`}</span>
              <button className="link" type="button" disabled={busy === s.key} onClick={() => refresh(s.key)}>{busy === s.key ? "Hämtar …" : "Hämta igen"}</button>
            </div>
          ))}</div>

          {onList.length > 0 && (
            <section className="bsec"><h2>På er inköpslista</h2>
              <div className="offlist">{onList.map(({ i, o }) => <div key={i.id}><span className="muted">{i.name}</span><Offer o={o} showStore /></div>)}</div>
            </section>
          )}

          {onBase.length > 0 && (
            <section className="bsec"><h2>I er baslista</h2><p className="hint">Sådant ni brukar handla som är billigare just nu.</p>
              <div className="offlist">{onBase.map(({ s, o }) => (
                <div key={s.id} className="offbase"><span className="muted">{s.name}</span><Offer o={o} showStore /><button type="button" className="btn ghost small" onClick={() => addBase(s)}>Lägg i inköpslistan</button></div>
              ))}</div>
            </section>
          )}

          {good.length > 0 && (
            <section className="bsec"><h2>Laga på erbjudanden</h2><p className="hint">Era recept med flest råvaror på erbjudande just nu.</p>
              <div className="rail">{good.map(({ r, hits }) => (
                <Link key={r.id} href={`/recept/${r.id}`} className="pick" style={{ "--rc": accentVar(r.accent) }}>
                  {r.image ? <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <span className="mono">{r.title?.[0]}</span>}
                  <span className="pbadge">{hits.length} på erbjudande</span>
                  <div className="cap"><b>{r.title}</b><span>{hits.slice(0, 3).map((h) => (h.ingredients?.[0] || h.name)).join(", ")} · {mins(r.minutes)}</span></div>
                </Link>
              ))}</div>
            </section>
          )}

          <section className="bsec"><h2>Alla erbjudanden</h2>
            <div className="searchbar"><input className="tin" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök, till exempel grädde eller kyckling" /></div>
            <div className="frow">
              {stores.length > 1 && stores.map((s) => <button key={s.key} type="button" className="chip" aria-pressed={store === s.key} onClick={() => setStore(store === s.key ? null : s.key)}>{s.name}</button>)}
              <button type="button" className="chip" aria-pressed={foodOnly} onClick={() => setFoodOnly(!foodOnly)}>Bara mat</button>
            </div>
            {cats.length > 1 && <div className="frow">{cats.map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)}>{c}</button>)}</div>}
            <div className="offlist">{list.map((o, i) => <Offer key={o.storeKey + i} o={o} showStore={stores.length > 1} />)}</div>
            {!list.length && <div className="empty">Inget att visa.</div>}
          </section>
          <p className="hint">Butikerna ändrar du under Inställningar. Priserna kommer från butikernas sidor och kan avvika i kassan.</p>
        </>
      )}
    </div>
  );
}
