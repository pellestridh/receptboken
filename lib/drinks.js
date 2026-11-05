import { readSettings } from "@/lib/settings";
import { hh } from "@/lib/household";
import { db } from "@/lib/db";
import { askJson } from "@/lib/claude";
import { STYLES } from "@/data/beer";
import { wineExamples } from "@/lib/wineNotes";

const product = {
  type: "object",
  properties: {
    name: { type: "string", description: "Konkret produkt: producent och namn" },
    style: { type: "string", description: "Stil, druva eller ölstil och område, kort" },
  },
  required: ["name", "style"],
};

const pickFor = (kind) => ({
  type: "object",
  properties: {
    ...(kind === "wine" ? { color: { type: "string", enum: ["rött", "vitt", "rosé", "mousserande", "orange", "sött"], description: "Vinets typ" } } : {}),
    ...(kind === "beer" ? { color: { type: "string", enum: ["ljus", "bärnsten", "mörk"], description: "Ölets färg" } } : {}),
    name: { type: "string", description: "Huvudförslaget som konkret produkt: producent och namn" },
    style: { type: "string", description: kind === "beer" ? "Ölstilen, kort och vedertagen, t.ex. 'Belgisk tripel', 'Tysk pilsner', 'Irländsk stout'" : "Druva och område, kort, t.ex. 'Riesling, Alsace' eller 'Nebbiolo, Piemonte'" },
    why: { type: "string", description: "En mening om varför den passar just den här rätten" },
    basis: { type: "array", items: { type: "string" }, maxItems: 4, description: "De egenskaper hos rätten som avgjorde valet, korta, t.ex. 'chilihetta', 'lime och fisksås', 'grillat fläsk', 'gräddig sås'" },
    rule: { type: "string", enum: ["intensitet", "syra", "tanniner", "sotma", "hetta", "regionalt", "harmoni", "kontrast", "fett"], description: "Den viktigaste principen bakom valet" },
    alternatives: { type: "array", items: product, maxItems: 2, description: "Ett eller två andra konkreta produkter i samma anda" },
  },
  required: kind === "nonAlcoholic" ? ["name", "style", "why"] : ["name", "color", "style", "why"],
});

export const DRINKS_SCHEMA = {
  type: "object",
  properties: {
    order: { type: "string", enum: ["wine", "beer"], description: "Vad som rekommenderas först" },
    wine: pickFor("wine"),
    beer: pickFor("beer"),
    nonAlcoholic: pickFor("nonAlcoholic"),
  },
  required: ["order", "wine", "beer", "nonAlcoholic"],
};

export async function feedbackExamples(limit = 40) {
  try {
    const rows = await db()(`select recipe_title, kind, suggested, verdict, your_choice, reason from drink_feedback where hh = $2 order by created_at desc limit $1`, [limit, hh()]);
    if (!rows.length) return "";
    const k = (x) => (x === "beer" ? "Öl" : x === "wine" ? "Vin" : "Alkoholfritt");
    const lines = rows.map((r) => {
      if (r.verdict === "added") return `- ${r.recipe_title}: ${k(r.kind)}. Familjen lade själva till "${r.your_choice}"${r.reason ? ` (${r.reason})` : ""}.`;
      if (r.your_choice) return `- ${r.recipe_title}: ${k(r.kind)}. Föreslaget "${r.suggested}" ersattes med "${r.your_choice}"${r.reason ? ` (${r.reason})` : ""}.`;
      return `- ${r.recipe_title}: ${k(r.kind)} "${r.suggested}" fick ${r.verdict === "up" ? "tummen upp" : "tummen ner"}${r.reason ? ` (${r.reason})` : ""}.`;
    });
    return `\n\nFamiljens tidigare omdömen och egna val. Lär er deras smak av det här: vilka stilar, druvor och smakprofiler de gillar och ogillar. Det är ingen lista att upprepa. Föreslå samma produkt igen bara när den verkligen är det bästa valet till just den här rätten:\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}

// Produkter som redan föreslagits till andra recept, så att förslagen varierar.
export async function recentPicks(exceptId) {
  try {
    const rows = await db()(`select id, body->'drinks' as d from recipes where deleted_at is null and hh = $2 and body ? 'drinks' and id <> $1 order by updated_at desc limit 80`, [exceptId || "", hh()]);
    const count = (kind) => {
      const m = {};
      for (const r of rows) { const n = r.d?.[kind]?.name; if (n) m[n] = (m[n] || 0) + 1; }
      return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([n, c]) => (c > 1 ? `${n} (${c} gånger)` : n));
    };
    const beer = count("beer"), wine = count("wine");
    if (!beer.length && !wine.length) return "";
    return `\n\nRedan föreslaget till andra recept i samlingen. Variera: välj en annan produkt, och gärna ett annat bryggeri eller en annan producent, om inte rätten verkligen kräver just den här.\nÖl: ${beer.join("; ") || "inga"}\nVin: ${wine.join("; ") || "inga"}`;
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
- Ange alltid vinets typ (rött, vitt, rosé, mousserande, orange eller sött) och ölets färg (ljus, bärnsten eller mörk). Ölets style är den vedertagna ölstilen, vinets style är druva och område.
- Välj ölstilen bland familjens kärnstilar och skriv den med samma namn: ${STYLES.map((x) => x.name).join(", ")}.
- Matcha ölstilen mot just den här rättens smaker. Världen av öl är stor: tyska, tjeckiska, belgiska, brittiska, irländska, amerikanska, nordiska och svenska bryggerier, och stilar från pilsner, helles, weissbier och saison till bitter, märzen, dubbel, porter, stout, gueuze och kriek. Utgå inte från en favoritstil.
- Tänk som experterna: matcha intensiteten och hitta smakkroken, det i ölet som speglar maten (Garrett Oliver). Såsen och kryddorna avgör före köttet (Aldo Sohm). Möt chilihetta med restsötma och låg alkohol, och umami med mogna viner med mjuka tanniner (Jeannie Cho Lee). Jordiga rätter vill ha jordiga viner (Rajat Parr).
- Matens färg styr mindre än såsen, kryddningen och tillagningen. Väg in hetta, syra, sötma, fett och intensitet. Ange i basis vilka egenskaper hos rätten som avgjorde valet och i rule den viktigaste principen.
- Om familjen ber om en viss vintyp (till exempel rött i stället för vitt), välj den bästa av den typen till rätten och förklara hur den fungerar med maten.
- Kort, konkret och vardagligt, för matintresserade och inte för experter. Undvik facktermer i motiveringen. Inga utropstecken.`;
}

// Hushållets egen smak, skriven av dem själva under Inställningar. Går före de allmänna reglerna.
async function familyTaste() {
  try {
    const { drinkTaste, favDrinks } = await readSettings();
    const t = String(drinkTaste || "").trim();
    const favs = (Array.isArray(favDrinks) ? favDrinks : []).slice(0, 40);
    const line = (k) => favs.filter((f) => f.kind === k).map((f) => `${f.name}${f.note ? ` (${f.note})` : ""}`).join("; ");
    let out = t ? `\n\nFAMILJENS EGEN SMAK, gå efter den även när den går emot de vanliga råden. Säg gärna kort att det är deras smak:\n${t}` : "";
    if (favs.length) out += `\n\nFAMILJENS FAVORITER. Använd dem för att förstå deras smakprofil: vilka druvor, områden, ölstilar, kraft och sötma de gillar. Föreslå drycker i samma anda men variera, föreslå inte favoriterna själva annat än ibland när de passar särskilt bra.${line("wine") ? `\nViner: ${line("wine")}` : ""}${line("beer") ? `\nÖl: ${line("beer")}` : ""}`;
    return out;
  } catch { return ""; }
}

export async function generateDrinks(recipe, extra = "") {
  const summary = {
    title: recipe.title, kitchen: recipe.kitchen, type: recipe.type, base: recipe.base, lede: recipe.lede,
    ingredients: (recipe.groups || []).flatMap((g) => g.items.map((i) => i.name)),
  };
  let out = await askJson({
    system: drinksRules() + (await familyTaste()) + (await feedbackExamples()) + (await wineExamples()) + (await recentPicks(recipe.id)),
    content: `Föreslå drycker till den här rätten.${extra ? `\n\n${extra}` : ""}\n\n${JSON.stringify(summary)}`,
    schema: DRINKS_SCHEMA, toolName: "save_drinks", maxTokens: 2500, textOnly: true,
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
    const color = String(g(p, "color", "färg", "farg") || "").trim().toLowerCase();
    const basis = (Array.isArray(p.basis) ? p.basis : []).map((x) => String(x).trim().slice(0, 60)).filter(Boolean).slice(0, 4);
    const rule = ["intensitet", "syra", "tanniner", "sotma", "hetta", "regionalt", "harmoni", "kontrast", "fett"].includes(p.rule) ? p.rule : null;
    return {
      name: name || style, style, why, ...(color ? { color } : {}), ...(basis.length ? { basis } : {}), ...(rule ? { rule } : {}),
      alternatives: (Array.isArray(alts) ? alts : []).slice(0, 2)
        .map((a) => (typeof a === "string" ? { name: a, style: "" } : { name: String(g(a, "name", "namn") || ""), style: String(g(a, "style", "stil") || "") }))
        .filter((a) => a.name),
    };
  };
  const res = { v: 3, order: String(g(out, "order", "ordning") || "") === "beer" ? "beer" : "wine", wine: clean(raw.wine), beer: clean(raw.beer), nonAlcoholic: clean(raw.nonAlcoholic), own: { wine: [], beer: [], nonAlcoholic: [] } };
  if (!res.wine || !res.beer) throw new Error("Claude gav inga dryckesförslag som gick att läsa. Försök igen. (" + JSON.stringify(out).slice(0, 160) + ")");
  return res;
}

// Förklarar ett befintligt förslag utan att byta det.
export async function explainDrink(recipe, kind, pick) {
  const summary = { title: recipe.title, kitchen: recipe.kitchen, lede: recipe.lede, ingredients: (recipe.groups || []).flatMap((g) => g.items.map((i) => i.name)) };
  const out = await askJson({
    system: `Du förklarar varför en dryck passar till en rätt, på svenska. Svara bara med JSON: {"basis":["2–4 korta egenskaper hos rätten som avgör"],"rule":"en av intensitet, syra, tanniner, sotma, hetta, regionalt, harmoni, kontrast, fett","why":"en mening"}`,
    content: `Rätt: ${JSON.stringify(summary)}\nDryck: ${pick.name} (${pick.style || ""})`,
    schema: { type: "object", properties: { basis: { type: "array", items: { type: "string" } }, rule: { type: "string" }, why: { type: "string" } }, required: ["basis", "rule"] },
    toolName: "explain", maxTokens: 500, textOnly: true,
  });
  const rules = ["intensitet", "syra", "tanniner", "sotma", "hetta", "regionalt", "harmoni", "kontrast", "fett"];
  return {
    basis: (Array.isArray(out?.basis) ? out.basis : []).map((x) => String(x).slice(0, 60)).filter(Boolean).slice(0, 4),
    rule: rules.includes(out?.rule) ? out.rule : null,
    why: String(out?.why || "").slice(0, 300),
  };
}
