"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useApp } from "@/components/Providers";
import { useSettings } from "@/components/useSettings";

const DEF = [
  { name: "Maxi ICA Eskilstuna", url: "https://www.ica.se/erbjudanden/maxi-ica-stormarknad-eskilstuna-1004513/" },
  { name: "ICA Kvantum Ekängen", url: "https://www.ica.se/erbjudanden/ica-kvantum-ekangen-1004152/" },
  { name: "Willys", url: "https://www.willys.se/erbjudanden/ehandel" },
];

export default function Stores() {
  const { toast } = useApp();
  const [settings, save] = useSettings();
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => { setList(settings.stores?.length ? settings.stores : DEF); }, [settings.stores]);
  const persist = (l) => save({ stores: l }).then(() => toast("Butikerna är sparade")).catch((e) => toast(e.message));
  return (
    <div className="panel">
      <h2 style={{ fontSize: "1.4rem" }}>Butiker för erbjudanden</h2>
      <p className="hint">Klistra in adressen till butikens erbjudandesida, till exempel från ica.se. Erbjudandena hämtas en gång om dagen.</p>
      <ul className="nlist">{list.map((s, i) => (
        <li key={s.url}><b>{s.name}</b> <span className="muted" style={{ fontSize: ".85rem", wordBreak: "break-all" }}>{s.url}</span>{" "}
          <button className="link" type="button" onClick={() => { const l = list.filter((_, j) => j !== i); setList(l); persist(l); }}>Ta bort</button></li>
      ))}</ul>
      <form className="arow" onSubmit={(e) => { e.preventDefault(); const l = [...list, { name: name.trim(), url: url.trim() }]; setList(l); persist(l); setName(""); setUrl(""); }}>
        <input className="tin" style={{ maxWidth: "12rem" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Namn, t.ex. ICA Ekängen" />
        <input className="tin" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.ica.se/erbjudanden/…" inputMode="url" />
        <button className="btn ghost" type="submit" disabled={!name.trim() || !/^https:\/\//.test(url.trim())}>Lägg till</button>
      </form>
    </div>
  );
}
