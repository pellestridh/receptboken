"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useRecipes } from "@/components/useRecipes";
import ReviewForm from "@/components/ReviewForm";
import { useApp } from "@/components/Providers";

export default function EditRecipe({ params }) {
  const id = params.id;
  const router = useRouter();
  const { toast } = useApp();
  const { recipes } = useRecipes();
  const [recipe, setRecipe] = useState(null);
  const [version, setVersion] = useState(0);
  const [ask, setAsk] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [armDelete, setArmDelete] = useState(false);
  const [original, setOriginal] = useState(null);

  useEffect(() => { api(`/api/recipes/${id}`).then((d) => { setRecipe(d.recipe); setOriginal(d.recipe); }).catch((e) => setErr(e.message)); }, [id]);

  // Från Ändra kategorier på receptet: gå direkt till fälten.
  useEffect(() => {
    if (recipe && window.location.hash === "#kategorier") setTimeout(() => document.getElementById("kategorier")?.scrollIntoView({ block: "start" }), 50);
  }, [!!recipe]); // eslint-disable-line react-hooks/exhaustive-deps

  async function revise() {
    if (!ask.trim()) return;
    setBusy(true); setErr("");
    try {
      const d = await api(`/api/recipes/${id}/revise`, { method: "POST", json: { instruction: ask } });
      setRecipe(d.recipe); setVersion((v) => v + 1); setAsk("");
      toast("Ändringen är klar att granska. Spara när du är nöjd.");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  async function save(r) {
    setSaving(true);
    try {
      const out = { ...r, pairsWith: recipe.pairsWith || [] };
      if (JSON.stringify(r.groups) !== JSON.stringify(original?.groups)) { delete out.nutrition; delete out.allergens; }
      await api(`/api/recipes/${id}`, { method: "PATCH", json: { recipe: out } }); toast("Sparat"); router.replace(`/recept/${id}`);
    }
    catch (e) { toast(e.message); setSaving(false); }
  }
  async function remove() {
    try { await api(`/api/recipes/${id}`, { method: "DELETE" }); toast(`${recipe.title} är borttaget`); router.replace("/"); }
    catch (e) { toast(e.message); }
  }
  const togglePair = (pid) => {
    const cur = new Set(recipe.pairsWith || []);
    cur.has(pid) ? cur.delete(pid) : cur.add(pid);
    setRecipe({ ...recipe, pairsWith: [...cur] });
  };

  if (err && !recipe) return <div className="empty">{err}</div>;
  if (!recipe) return <div className="empty">Hämtar receptet …</div>;
  const others = (recipes || []).filter((r) => r.id !== id);

  return (
    <>
      <div className="panel narrow" style={{ marginTop: 0, marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem" }}>Ändra med Claude</h2>
        <p className="hint">Skriv vad som ska ändras, till exempel "mer citron och dill istället för persilja" eller "gör den för 6 personer och lite starkare".</p>
        <textarea className="tin" id="ask-in" rows={3} value={ask} onChange={(e) => setAsk(e.target.value)} />
        <div className="arow">
          <button className="btn" type="button" disabled={busy || !ask.trim()} onClick={revise}>Ändra receptet</button>
          {busy && <span className="muted"><span className="spinner" />Claude ändrar receptet …</span>}
          {err && <span className="err">{err}</span>}
        </div>
      </div>

      <ReviewForm key={version} recipe={recipe} recipes={recipes || []} onSave={save} onDiscard={() => router.back()} busy={saving} saveLabel="Spara ändringarna" />

      {others.length > 0 && (
        <details className="panel narrow" style={{ marginTop: "1.5rem" }}>
          <summary><h2 style={{ fontSize: "1.5rem", display: "inline" }}>Passar ihop med</h2> <span className="muted">{(recipe.pairsWith || []).length ? `${(recipe.pairsWith || []).length} valda` : "tillbehör och rätter som serveras ihop"}</span></summary>
          <div className="frow">
            {others.map((o) => (
              <button key={o.id} type="button" className="chip" aria-pressed={(recipe.pairsWith || []).includes(o.id)} onClick={() => togglePair(o.id)}>{o.title}</button>
            ))}
          </div>
        </details>
      )}

      <div className="foot">
        {armDelete
          ? <button className="btn ghost" type="button" style={{ "--rc": "var(--c-ember)" }} onClick={remove}>Tryck igen för att ta bort receptet</button>
          : <button className="link" type="button" onClick={() => { setArmDelete(true); setTimeout(() => setArmDelete(false), 4000); }}>Ta bort receptet</button>}
      </div>
    </>
  );
}
