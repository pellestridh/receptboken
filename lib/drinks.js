import { db } from "@/lib/db";
import { askJson } from "@/lib/claude";

const product = {
  type: "object",
  properties: {
    name: { type: "string", description: "Konkret produkt: producent och namn, t.ex. 'Trimbach Riesling' eller 'Westmalle Tripel'" },
    style: { type: "string", description: "Stil, druva eller ölstil och område, kort" },
  },
  required: ["name", "style"],
};

const pick = {
  type: "object",
  properties: {
    name: { type: "string", description: "Huvudförslaget som konkret produkt: producent och namn" },
    style: { type: "string", description: "Stil och druva eller ölstil, kort, t.ex. 'Torr Riesling, Alsace' eller 'Belgisk tripel'" },
    why: { type: "string", description: "En mening om varför den passar just den här rätten" },
    alternatives: { type: "array", items: product, maxItems: 2, description: "Ett eller två andra konkreta produkter i samma anda" },
  },
  required: ["name", "style", "why"],
};

export const DRINKS_SCHEMA = {
  type: "object",
  properties: {
    order: { type: "string", enum: ["wine", "beer"], description: "Vad som rekommenderas först" },
    wine: pick,
    beer: pick,
    nonAlcoholic: pick,
  },
  required: ["order", "wine", "beer", "nonAlcoholic"],
};

export async function feedbackExamples(limit = 40) {
  try {
    const rows = await db()(`select recipe_title, kind, suggested, verdict, your_choice, reason from drink_feedback order by created_at desc limit $1`, [limit]);
    if (!rows.length) return "";
    const k = (x) => (x === "beer" ? "Öl" : x === "wine" ? "Vin" : "Alkoholfritt");
    const lines = rows.map((r) => {
      if (r.verdict === "added") return `- ${r.recipe_title}: ${k(r.kind)}. Familjen lade själva till "${r.your_choice}"${r.reason ? ` (${r.reason})` : ""}.`;
      if (r.your_choice) return `- ${r.recipe_title}: ${k(r.kind)}. Föreslaget "${r.suggested}" ersattes med "${r.your_choice}"${r.reason ? ` (${r.reason})` : ""}.`;
      return `- ${r.recipe_title}: ${k(r.kind)} "${r.suggested}" fick ${r.verdict === "up" ? "tummen upp" : "tummen ner"}${r.reason ? ` (${r.reason})` : ""}.`;
    });
    return `\n\nFamiljens tidigare omdömen och egna val. Följ deras smak, väg in egna val tyngst, och föreslå gärna producenter och bryggerier de gillat:\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}

export function drinksRules() {
  return `Dryckesförslag till familjens recept, på svenska.
- Ge ett vin, en öl och ett alkoholfritt alternativ till varje rätt, alltid som konkreta produkter med producent och namn.
- Välj produkter som finns i Systembolagets ordinarie sortiment eller är välkända klassiker som brukar finnas där. Hitta aldrig på produkter. Föredra etablerade producenter och bryggerier framför obskyra.
- Till varmrätter och förrätter rekommenderas vin först (order: "wine"). Till ostar och desserter rekommenderas öl först (order: "beer").
- En i familjen är ölexpert sedan 1980-talet med fokus på öl och mat. Ölförslagen ska hålla den nivån: rätt ölstil och en motivering som handlar om samspelet (sötma, beska, rostning, kolsyra, fett, syra, kryddor).
- Alkoholfritt: en konkret produkt, till exempel ett alkoholfritt vin eller öl, en must eller en kombucha.
- Ge ett eller två alternativ i samma anda för vin och öl.
- Kort och konkret. Inga utropstecken.`;
}

export async function generateDrinks(recipe, extra = "") {
  const summary = {
    title: recipe.title, kitchen: recipe.kitchen, type: recipe.type, base: recipe.base, lede: recipe.lede,
    ingredients: (recipe.groups || []).flatMap((g) => g.items.map((i) => i.name)),
  };
  let out = await askJson({
    system: drinksRules() + (await feedbackExamples()),
    content: `Föreslå drycker till den här rätten.${extra ? `\n\n${extra}` : ""}\n\n${JSON.stringify(summary)}`,
    schema: DRINKS_SCHEMA, toolName: "save_drinks", maxTokens: 2500,
  });
  // Godta både engelska och svenska fältnamn, och spara aldrig tomma förslag.
  const g = (o, ...keys) => { for (const k of keys) if (o?.[k]) return o[k]; return null; };
  if (out && !g(out, "wine", "vin") && typeof out === "object") out = g(out, "drinks", "drycker", "result") || out;
  const raw = {
    wine: g(out, "wine", "vin"), beer: g(out, "beer", "öl", "ol"), nonAlcoholic: g(out, "nonAlcoholic", "alkoholfritt", "non_alcoholic"),
  };
  const clean = (p) => {
    if (typeof p === "string" && p.trim()) return { name: p.trim(), style: "", why: "", alternatives: [] };
    if (!p || typeof p !== "object") return null;
    const name = String(g(p, "name", "namn", "produkt", "product") || "").trim();
    const style = String(g(p, "style", "stil", "typ") || "").trim();
    const why = String(g(p, "why", "varför", "varfor", "motivering", "reason") || "").trim();
    const alts = g(p, "alternatives", "alternativ") || [];
    if (!name && !style) return null;
    return {
      name: name || style, style, why,
      alternatives: (Array.isArray(alts) ? alts : []).slice(0, 2)
        .map((a) => (typeof a === "string" ? { name: a, style: "" } : { name: String(g(a, "name", "namn") || ""), style: String(g(a, "style", "stil") || "") }))
        .filter((a) => a.name),
    };
  };
  const res = { v: 2, order: String(g(out, "order", "ordning") || "") === "beer" ? "beer" : "wine", wine: clean(raw.wine), beer: clean(raw.beer), nonAlcoholic: clean(raw.nonAlcoholic), own: { wine: [], beer: [], nonAlcoholic: [] } };
  if (!res.wine || !res.beer) throw new Error("Claude gav inga dryckesförslag som gick att läsa. Försök igen.");
  return res;
}
