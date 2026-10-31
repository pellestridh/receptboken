// Räknar näringsvärde per portion. Claude kopplar varje ingrediens till ett livsmedel i
// Livsmedelsverkets databas och uppskattar vikten i gram. Värdena per 100 g hämtas sedan från
// Livsmedelsverket. Går databasen inte att nå används Claudes egen uppskattning för ingrediensen.
import { ensureFoods, candidatesFor, nutrientsFor } from "@/lib/livsmedel";
import { askJson } from "@/lib/claude";


const SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          i: { type: "integer", description: "Ingrediensens index" },
          nummer: { type: ["integer", "null"], description: "Valt livsmedelsnummer bland kandidaterna, null om ingen passar" },
          grams: { type: "number", description: "Uppskattad ätbar vikt i gram för hela receptet. 0 för vatten och sådant som inte äts" },
          kcal: { type: "number", description: "Din uppskattning av energi i kcal för den mängden" },
          protein: { type: "number" }, carbs: { type: "number" }, fat: { type: "number" },
        },
        required: ["i", "grams", "kcal", "protein", "carbs", "fat"],
      },
    },
  },
  required: ["items"],
};

export async function computeNutrition(recipe) {
  const ings = (recipe.groups || []).flatMap((g) => g.items).map((it) => ({
    name: it.name, note: it.note || "", amount: it.q == null ? (it.amt || "efter smak") : `${it.q2 != null ? `${it.q}–${it.q2}` : it.q} ${it.unit || "st"}`,
  }));

  let cands = ings.map(() => []);
  let lv = true;
  try { await ensureFoods(); cands = await candidatesFor(ings.map((i) => i.name)); } catch { lv = false; }

  const list = ings.map((it, i) =>
    `${i}. ${it.amount} ${it.name}${it.note ? ` (${it.note})` : ""}` +
    (cands[i]?.length ? `\n   Kandidater: ${cands[i].map((c) => `${c.nummer}=${c.namn}`).join("; ")}` : "")
  ).join("\n");

  const out = await askJson({
    system: "Du räknar näringsvärden för recept. Välj för varje ingrediens det livsmedelsnummer bland kandidaterna som bäst motsvarar råvaran som den används (rå, okokt om inget annat sägs). Uppskatta ätbar vikt i gram för hela receptet: en gul lök ca 100 g, en vitlöksklyfta 5 g, 1 dl vetemjöl 60 g, 1 msk olja 13 g. Räkna 'efter smak' som en liten mängd. Ge också din egen uppskattning av kcal, protein, kolhydrater och fett för den mängden.",
    content: `Recept: ${recipe.title}, ${recipe.servings} ${recipe.servingsUnit || "portioner"}.\n\nIngredienser:\n${list}`,
    schema: SCHEMA, toolName: "save_nutrition", maxTokens: 4000,
  });
  if (!Array.isArray(out?.items)) throw new Error("Näringsvärdet gick inte att räkna ut.");

  const total = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  let fromLv = 0, counted = 0;
  for (const it of out.items) {
    const g = Number(it.grams) || 0;
    if (g <= 0) continue;
    counted++;
    let n = null;
    if (lv && it.nummer && cands[it.i]?.some((c) => c.nummer === it.nummer)) {
      try { n = await nutrientsFor(it.nummer); } catch { n = null; }
    }
    if (n) {
      fromLv++;
      total.kcal += (n.kcal || 0) * g / 100;
      total.protein += (n.protein || 0) * g / 100;
      total.carbs += (n.carbs || 0) * g / 100;
      total.fat += (n.fat || 0) * g / 100;
    } else {
      total.kcal += Number(it.kcal) || 0;
      total.protein += Number(it.protein) || 0;
      total.carbs += Number(it.carbs) || 0;
      total.fat += Number(it.fat) || 0;
    }
  }
  const s = recipe.servings || 1;
  return {
    kcal: Math.round(total.kcal / s / 10) * 10,
    protein: Math.round(total.protein / s),
    carbs: Math.round(total.carbs / s),
    fat: Math.round(total.fat / s),
    source: counted && fromLv / counted >= 0.6 ? "livsmedelsverket" : "uppskattat",
    computedAt: new Date().toISOString(),
  };
}
