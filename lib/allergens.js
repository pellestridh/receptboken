// Allergenmärkning per recept: gluten, laktos och familjens egna allergier.
// Claude bedömer ingredienserna, och en egen ordkontroll fångar familjens allergier
// även om Claude skulle missa dem.
import { askJson } from "@/lib/claude";
import { allergyKey } from "@/lib/settings";

const SCHEMA = {
  type: "object",
  properties: {
    gluten: { type: "string", enum: ["ja", "nej", "kanske"], description: "Innehåller rätten gluten" },
    glutenWhy: { type: "string", description: "Vilka ingredienser, kort" },
    lactose: { type: "string", enum: ["ja", "nej", "kanske"], description: "Innehåller rätten laktos" },
    lactoseWhy: { type: "string" },
    hits: {
      type: "array",
      description: "Familjens allergener som finns i rätten",
      items: { type: "object", properties: { allergen: { type: "string" }, ingredient: { type: "string" } }, required: ["allergen", "ingredient"] },
    },
    mayContain: {
      type: "array",
      description: "Familjens allergener som kan finnas i en färdig produkt i receptet, t.ex. pesto, currypasta, müsli, bröd",
      items: { type: "object", properties: { allergen: { type: "string" }, ingredient: { type: "string" }, why: { type: "string" } }, required: ["allergen", "ingredient"] },
    },
    other: { type: "array", items: { type: "string" }, description: "Övriga av EU:s 14 allergener som finns: t.ex. ägg, fisk, kräftdjur, selleri, senap, sesam, soja, jordnötter, andra nötter" },
  },
  required: ["gluten", "lactose", "hits", "mayContain"],
};

// Ord som alltid räknas som träff för vanliga allergier, oavsett vad Claude säger.
export const ALIASES = {
  cashew: ["cashew", "kashew", "acajou"],
  pistage: ["pistage", "pistasch", "pistach"],
  jordnöt: ["jordnöt", "jordnötter", "peanut"],
  hasselnöt: ["hasselnöt"],
  mandel: ["mandel", "mandlar", "mandelmjöl", "marsipan"],
  valnöt: ["valnöt"],
  sesam: ["sesam", "tahini"],
};

export function keywordHits(recipe, allergies) {
  const names = (recipe.groups || []).flatMap((g) => g.items.map((i) => `${i.name} ${i.note || ""}`.toLowerCase()));
  const hits = [];
  for (const a of allergies || []) {
    const w = a.what.toLowerCase();
    const key = Object.keys(ALIASES).find((k) => w.includes(k));
    const words = key ? ALIASES[key] : [w.replace(/(nötter|nöt|er|ar|or)$/, "")].filter((x) => x.length >= 4);
    for (const n of names) if (words.some((x) => n.includes(x))) hits.push({ allergen: a.what, ingredient: n.trim() });
  }
  return hits;
}

export async function computeAllergens(recipe, allergies) {
  const ings = (recipe.groups || []).flatMap((g) => g.items).map((i) => `${i.name}${i.note ? ` (${i.note})` : ""}`).join("\n");
  const fam = (allergies || []).map((a) => a.what).join(", ") || "inga";
  const out = await askJson({
    system: "Du bedömer allergener i recept noggrant och försiktigt. Vanligt vetemjöl, pasta, bröd, panko, sojasås och öl innehåller gluten. Mjölk, grädde, smör, ost, yoghurt, crème fraiche och paneer innehåller laktos; lagrade hårdostar som parmesan är nästan laktosfria (ange 'kanske'). Om du är osäker, välj 'kanske'. Var särskilt noggrann med familjens allergier, och tänk på färdiga produkter som ofta innehåller nötter: pesto, currypastor, kormasås, müsli, granola, nougat, praliner, baklava, dukkah, vissa bröd och kakor.",
    content: `Familjens allergier: ${fam}.\n\nRecept: ${recipe.title}\nIngredienser:\n${ings}`,
    schema: SCHEMA, toolName: "save_allergens", maxTokens: 1500,
  });
  const yn = (v) => (["ja", "nej", "kanske"].includes(v) ? v : "kanske");
  const hits = [...(out.hits || []), ...keywordHits(recipe, allergies)];
  const seen = new Set();
  return {
    gluten: yn(out.gluten), glutenWhy: String(out.glutenWhy || ""),
    lactose: yn(out.lactose), lactoseWhy: String(out.lactoseWhy || ""),
    hits: hits.filter((h) => { const k = h.allergen + "|" + h.ingredient; if (seen.has(k)) return false; seen.add(k); return true; }),
    mayContain: (out.mayContain || []).map((m) => ({ allergen: String(m.allergen), ingredient: String(m.ingredient), why: String(m.why || "") })),
    other: (out.other || []).map(String),
    forAllergies: allergyKey(allergies),
    computedAt: new Date().toISOString(),
  };
}
