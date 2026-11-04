"use client";
import { realMay } from "@/lib/allergenFilter";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export const allergyKey = (allergies) => (allergies || []).map((a) => a.what.toLowerCase().trim()).sort().join("|");

// Kompakt märkning överst i receptet. Varningar visas som etiketter som fälls ut vid tryck.
export default function Allergens({ id, allergens: initial, allergies, onChange }) {
  const [a, setA] = useState(initial || null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const key = allergyKey(allergies);

  useEffect(() => { setA(initial || null); }, [initial]);
  useEffect(() => {
    if (started.current || !allergies) return;
    if (initial && initial.forAllergies === key) return;
    started.current = true;
    setBusy(true);
    api(`/api/recipes/${id}/allergens`, { method: "POST" })
      .then((d) => { setA(d.allergens); onChange?.(d.allergens); })
      .catch(() => {})
      .finally(() => setBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initial, key]);

  if (!a) return busy ? <span className="tag muted-tag"><span className="spinner" />Kontrollerar allergener</span> : null;
  const hits = [...new Set((a.hits || []).map((h) => h.allergen))];
  const mayList = realMay(a.mayContain);
  const may = [...new Set(mayList.map((h) => h.allergen))];
  return (
    <>
      {hits.length > 0 && (
        <details className="atag danger">
          <summary>Innehåller {hits.join(" och ")}</summary>
          <p>{a.hits.map((h) => h.ingredient).join(", ")}. Byt ut innan ni lagar, eller tryck Ändra och be Claude ersätta det.</p>
        </details>
      )}
      {may.length > 0 && (
        <details className="atag caution">
          <summary>Kan innehålla {may.join(" och ")}</summary>
          <p>{mayList.map((h) => `${h.ingredient}${h.why ? ` (${h.why})` : ""}`).join(", ")}. Kontrollera innehållsförteckningen när ni handlar.</p>
        </details>
      )}
      <span className={"tag" + (a.gluten === "nej" ? " ok-tag" : "")} title={a.glutenWhy || ""}>{a.gluten === "nej" ? "Glutenfri" : a.gluten === "ja" ? "Gluten" : "Kan innehålla gluten"}</span>
      <span className={"tag" + (a.lactose === "nej" ? " ok-tag" : "")} title={a.lactoseWhy || ""}>{a.lactose === "nej" ? "Laktosfri" : a.lactose === "ja" ? "Laktos" : "Lite laktos"}</span>
    </>
  );
}
