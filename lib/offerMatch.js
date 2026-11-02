// Ren matchning mellan varor/ingredienser och erbjudanden. Används i webbläsaren och på servern.
// Matchar en vara eller ingrediens mot erbjudandena.
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-zåäöé ]/g, " ").trim();
const hit = (n, i) => {
  if (i.length < 3) return false;
  if (n === i) return true;
  const words = n.split(/\s+/);
  // Hela ord, eller sammansättningar som "matlagningsgrädde" för "grädde" (minst fem bokstäver).
  return words.some((w) => w === i || (i.length >= 5 && w.endsWith(i))) || (i.includes(" ") && n.includes(i));
};
export function matchOffer(name, offers) {
  const n = norm(name);
  if (n.length < 3) return null;
  for (const o of offers) {
    if (!o.food) continue;
    if ((o.ingredients || []).some((ing) => hit(n, norm(ing)))) return o;
  }
  return null;
}

// Alla erbjudanden från alla butiker i en lista, med butiksnamn.
export const flatOffers = (stores) => (stores || []).flatMap((s) => (s.offers || []).map((o) => ({ ...o, store: s.name, storeKey: s.key })));

// Recept som använder minst en vara på erbjudande, flest träffar först.
export function recipesOnOffer(recipes, offers) {
  return recipes.map((r) => {
    const names = String(r.ingredients || "").split(",").map((x) => x.trim()).filter(Boolean);
    const hits = [];
    for (const o of offers) {
      if (!o.food) continue;
      if ((o.ingredients || []).some((ing) => names.some((n) => matchOffer(n, [{ ...o, ingredients: [ing] }])))) hits.push(o);
    }
    return { r, hits: [...new Map(hits.map((h) => [h.name, h])).values()] };
  }).filter((x) => x.hits.length).sort((a, b) => b.hits.length - a.hits.length);
}
