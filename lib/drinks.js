import { db } from "@/lib/db";
import { askJson } from "@/lib/claude";


const pick = {
  type: "object",
  properties: {
    style: { type: "string", description: "Stil och druva eller ölstil, kort, t.ex. 'Torr Riesling från Alsace' eller 'Belgisk tripel'" },
    why: { type: "string", description: "En mening om varför den passar just den här rätten" },
    examples: { type: "array", items: { type: "string" }, maxItems: 2, description: "Ett eller två sökord för Systembolaget: producent och vin eller bryggeri och öl som brukar finnas i Sverige. Hellre stil än en osäker produkt" },
  },
  required: ["style", "why"],
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

export async function feedbackExamples(limit = 30) {
  try {
    const rows = await db()(`select recipe_title, kind, suggested, verdict, your_choice, reason from drink_feedback order by created_at desc limit $1`, [limit]);
    if (!rows.length) return "";
    const lines = rows.map((r) => {
      const k = r.kind === "beer" ? "Öl" : r.kind === "wine" ? "Vin" : "Alkoholfritt";
      if (r.your_choice) return `- ${r.recipe_title}: ${k}. Föreslaget "${r.suggested}" ersattes med "${r.your_choice}"${r.reason ? ` (${r.reason})` : ""}.`;
      return `- ${r.recipe_title}: ${k} "${r.suggested}" fick ${r.verdict === "up" ? "tummen upp" : "tummen ner"}${r.reason ? ` (${r.reason})` : ""}.`;
    });
    return `\n\nFamiljens tidigare omdömen om dryckesförslag. Följ deras smak, och väg in egna val tyngst:\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}

export function drinksRules() {
  return `Dryckesförslag till familjens recept, på svenska.
- Ge ett vinförslag, ett ölförslag och ett alkoholfritt förslag till varje rätt.
- Till varmrätter och förrätter rekommenderas vin först (order: "wine"). Till ostar och desserter rekommenderas öl först (order: "beer").
- En i familjen är ölexpert sedan 1980-talet med fokus på öl och mat. Ölförslagen ska hålla den nivån: precis ölstil, och en motivering som handlar om samspelet (sötma, beska, rostning, kolsyra, fett, syra, kryddor).
- Vinförslag anges som stil och druva och område. Motivera kort.
- Exempel ska vara sådant som brukar finnas på Systembolaget. Är du osäker på en produkt, ge stilen i stället.
- Kort och konkret. Inga utropstecken.`;
}

export async function generateDrinks(recipe, extra = "") {
  const summary = {
    title: recipe.title, kitchen: recipe.kitchen, type: recipe.type, base: recipe.base, lede: recipe.lede,
    ingredients: (recipe.groups || []).flatMap((g) => g.items.map((i) => i.name)),
  };
  const out = await askJson({
    system: drinksRules() + (await feedbackExamples()),
    content: `Föreslå drycker till den här rätten.${extra ? `\n\n${extra}` : ""}\n\n${JSON.stringify(summary)}`,
    schema: DRINKS_SCHEMA, toolName: "save_drinks", maxTokens: 2000,
  });
  if (!out?.wine || !out?.beer) throw new Error("Claude gav inga dryckesförslag. Försök igen.");
  const clean = (p) => p ? { style: String(p.style || ""), why: String(p.why || ""), examples: (p.examples || []).slice(0, 2).map(String) } : null;
  return { order: out.order === "beer" ? "beer" : "wine", wine: clean(out.wine), beer: clean(out.beer), nonAlcoholic: clean(out.nonAlcoholic) };
}
