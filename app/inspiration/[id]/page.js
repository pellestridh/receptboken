"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { accentVar, mins } from "@/lib/format";
import { useApp } from "@/components/Providers";
import RecipeBody from "@/components/RecipeBody";

export default function InspirationRecipe() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useApp();
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { api(`/api/inspiration/${id}`).then(setD).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <div className="narrow"><div className="empty">{err} <Link href="/inspiration">Tillbaka</Link></div></div>;
  if (!d) return <div className="narrow"><div className="empty">Hämtar …</div></div>;
  const r = d.recipe;
  const save = () => { setBusy(true); api(`/api/inspiration/${id}`, { method: "POST" }).then((x) => { toast(`${r.title} finns nu i er receptbok`); router.push(`/recept/${x.id}`); }).catch((e) => { toast(e.message); setBusy(false); }); };

  return (
    <article className="r" style={{ "--rc": accentVar(r.accent) }}>
      <div className="savebar">
        <div><b>Från {d.from.name}</b><br /><span className="muted" style={{ fontSize: ".9rem" }}>{d.rating ? `${"★".repeat(d.rating)} hos dem` : ""}{d.timesCooked ? ` · lagad ${d.timesCooked} gånger` : ""}</span></div>
        <button className="btn" type="button" disabled={busy} onClick={save}>{busy ? "Sparar …" : "Spara i vår receptbok"}</button>
      </div>
      {d.hits.length > 0 && <p className="warn">Innehåller {d.hits.join(" och ")}, som någon hos er är allergisk mot. Spara och be Claude byta ut det under Ändra.</p>}
      {r.image && <div className="rhero"><img src={r.image} alt="" referrerPolicy="no-referrer" /></div>}
      <header className="rhead">
        <h1>{r.title}</h1>
        {r.lede && <p className="lede">{r.lede}</p>}
        <div className="tags"><b>{r.kitchen}</b><span>{r.type}</span><span>{mins(r.minutes)}</span><span>{r.servings} {r.servingsUnit || "portioner"}</span></div>
      </header>
      <RecipeBody recipe={r} id={`insp-${id}`} />
      {r.source?.name && <p className="hint" style={{ marginTop: "2rem" }}>Källa: {r.source.url ? <a href={r.source.url} target="_blank" rel="noopener noreferrer">{r.source.name}</a> : r.source.name}</p>}
    </article>
  );
}
