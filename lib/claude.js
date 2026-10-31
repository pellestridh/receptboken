// Anrop till Claude API. Svaret tvingas genom ett verktyg så att det alltid blir giltig JSON.
const API = "https://api.anthropic.com/v1/messages";
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

export const ACCENTS = ["spinach", "crust", "dijon", "sea", "ember", "plum", "olive"];

const item = {
  type: "object",
  properties: {
    q: { type: ["number", "null"], description: "Mängd som tal, null om 'efter smak'" },
    q2: { type: "number", description: "Övre gräns vid intervall" },
    unit: { type: "string", description: "g, kg, ml, dl, l, msk, tsk, krm, st, frp, burk, kruka, nypa, klick, skiva, näve eller tom för styck" },
    name: { type: "string" },
    note: { type: "string", description: "Tillagning eller förtydligande, t.ex. 'finhackad'" },
    amt: { type: "string", description: "Text när q är null, t.ex. 'efter smak'" },
    pantry: { type: "boolean", description: "Skafferivara: salt, peppar, olja, mjöl, socker, torkade kryddor, vinäger m.m." },
    shop: { type: "boolean", description: "false för sådant som inte köps separat, t.ex. vatten" },
  },
  required: ["q", "unit", "name"],
};

export const RECIPE_SCHEMA = {
  type: "object",
  properties: {
    error: { type: "string", description: "Fyll bara i om underlaget inte är ett läsbart recept" },
    title: { type: "string" },
    lede: { type: "string", description: "En till två meningar om rätten" },
    short: { type: "string", description: "En kort mening för receptkortet" },
    kitchen: { type: "string" },
    type: { type: "string" },
    base: { type: "string" },
    minutes: { type: "integer", description: "Total tid i minuter" },
    servings: { type: "integer" },
    servingsUnit: { type: "string", description: "portioner, bröd, bitar ..." },
    accent: { type: "string", enum: ACCENTS },
    tags: { type: "array", items: { type: "string" }, maxItems: 3 },
    source: { type: "object", properties: { name: { type: "string" }, url: { type: "string" } } },
    groups: {
      type: "array",
      items: { type: "object", properties: { name: { type: "string" }, items: { type: "array", items: item } }, required: ["name", "items"] },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          sub: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                t: { type: "string" },
                timer: { type: "integer", description: "Väntetid i sekunder" },
                label: { type: "string", description: "Kort timernamn" },
              },
              required: ["t"],
            },
          },
        },
        required: ["title", "items"],
      },
    },
    restaurantTips: { type: "array", items: { type: "string" }, description: "Knep som gör rätten mer som på restaurang, 2–4 st" },
    tips: { type: "array", items: { type: "string" }, description: "Bra att veta, 3–6 st" },
    changes: { type: "array", items: { type: "string" }, description: "Varje ändring mot originalet och varför" },
  },
  required: ["title", "groups", "steps"],
};

export function rules(categories) {
  const c = categories || {};
  return `Du är kock och redaktör för en svensk familjs digitala receptbok. Du arbetar alltid på svenska.

Så här ska varje recept bli:
- Behåll rättens karaktär och originalets mängder i grunden.
- Autentiskt som standard. Indiska, thailändska och andra köks rätter görs så autentiska som möjligt: rätt kryddor, rätt teknik, rätt ordning. Avviker källan från originalet, rätta det och skriv det i "changes". Ge en svensk ersättning för svårhittade varor som not, aldrig som standard.
- Förbättra som en erfaren kock: rätt ordning i köket (det som tar längst tid först), tydliga temperaturer och kärntemperaturer, tekniska knep som gör resultatet säkrare. Rätta uppenbara fel och luckor, till exempel ingredienser som listas men aldrig används. Baka in förbättringarna i stegen och lista varje ändring kort i "changes".
- "restaurantTips": de knep som skiljer hemmalagat från restaurang för just den här rätten.
- Skriv kort och tydligt i aktiv form, som en kokbok. Inga utropstecken.
- Lägg en timer (sekunder) på varje delmoment med en tydlig väntetid.
- Markera skafferivaror med pantry: true. Sätt shop: false på sådant som inte köps separat.
- Tillagningsform som "hackad" läggs i note, inte i name.
- Använd helst befintliga värden. kitchen: ${(c.kitchen || []).join(", ") || "Svenskt, Franskt, Indiskt, Japanskt"}. type: ${(c.type || []).join(", ") || "Huvudrätt, Tillbehör och bröd, Förrätt, Dessert"}. base: ${(c.base || []).join(", ") || "Kyckling, Fisk, Nötkött, Vegetariskt"}. Hitta på ett nytt bara om inget passar.
- accent efter rättens färg: spinach=grönt, crust=bröd/brunt, dijon=gult, sea=fisk/blått, ember=rött/grillat, plum=lila/bär, olive=olivgrönt.
- Är underlaget inte ett läsbart recept: fyll bara i "error" med en kort förklaring, och title "–", groups [] och steps [].`;
}

// Ber Claude om ett JSON-svar enligt ett schema. Använder i första hand ett verktyg.
// Avvisar modellen verktyg eller verktygsval, görs ett nytt försök där JSON begärs som text.
export async function askJson({ system, content, schema, toolName = "save", maxTokens = 8000 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY saknas i Vercel.");
  const call = async (withTools) => {
    const payload = {
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content }],
    };
    if (withTools) {
      payload.system = system + `\n\nSvara alltid genom att anropa verktyget ${toolName}. Skriv ingen annan text.`;
      payload.tools = [{ name: toolName, description: "Spara resultatet. Ska alltid anropas.", input_schema: schema }];
    } else {
      payload.system = system + `\n\nSvara ENDAST med ett JSON-objekt, utan annan text, enligt detta JSON-schema:\n${JSON.stringify(schema)}`;
    }
    const res = await fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    return { res, data };
  };
  let { res, data } = await call(true);
  if (!res.ok && /tool/i.test(data?.error?.message || "")) ({ res, data } = await call(false));
  if (!res.ok) throw new Error("Claude svarade med ett fel: " + (data?.error?.message || `HTTP ${res.status}`));
  if (data.stop_reason === "max_tokens") throw new Error("Svaret blev för långt. Försök med mindre åt gången.");
  const block = data?.content?.find((b) => b.type === "tool_use");
  if (block) return block.input;
  const text = (data?.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const json = text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] || text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  try { if (json) return JSON.parse(json); } catch {}
  throw new Error("Claude gav inget svar som gick att läsa. Försök igen.");
}

export async function callRecipeTool({ content, system }) {
  return askJson({ system, content, schema: RECIPE_SCHEMA, toolName: "save_recipe", maxTokens: 8000 });
}

const num = (v, d) => { v = Number(v); return Number.isFinite(v) && v > 0 ? v : d; };

export function cleanRecipe(d) {
  if (!d || typeof d !== "object") throw new Error("Svaret gick inte att läsa.");
  if (d.error) throw new Error(String(d.error));
  if (!d.title || !Array.isArray(d.groups) || !Array.isArray(d.steps) || !d.steps.length)
    throw new Error("Receptet blev ofullständigt. Försök igen, gärna med en tydligare bild.");
  const r = {
    title: String(d.title).trim(),
    lede: String(d.lede || ""),
    short: String(d.short || ""),
    kitchen: String(d.kitchen || ""),
    type: String(d.type || ""),
    base: String(d.base || ""),
    minutes: Math.round(num(d.minutes, 30)),
    servings: Math.round(num(d.servings, 4)),
    servingsUnit: String(d.servingsUnit || "portioner"),
    accent: ACCENTS.includes(d.accent) ? d.accent : "ember",
    tags: (Array.isArray(d.tags) ? d.tags : []).slice(0, 3).map(String),
    source: d.source && typeof d.source === "object" ? { name: d.source.name || undefined, url: d.source.url || undefined } : {},
    groups: d.groups.map((g) => ({
      name: String(g.name || ""),
      items: (Array.isArray(g.items) ? g.items : []).map((it) => {
        const o = { q: it.q == null || it.q === "" || !Number.isFinite(Number(it.q)) ? null : Number(it.q), unit: String(it.unit || ""), name: String(it.name || "") };
        if (it.q2 != null && Number.isFinite(Number(it.q2))) o.q2 = Number(it.q2);
        if (it.note) o.note = String(it.note);
        if (it.amt) o.amt = String(it.amt);
        if (it.pantry) o.pantry = true;
        if (it.shop === false) o.shop = false;
        return o;
      }).filter((o) => o.name),
    })),
    steps: d.steps.map((s) => {
      const o = {
        title: String(s.title || ""),
        items: (Array.isArray(s.items) ? s.items : []).map((it) => {
          if (typeof it === "string") return it;
          const t = String(it.t || "");
          const tm = Math.round(Number(it.timer));
          return Number.isFinite(tm) && tm > 0 ? { t, timer: tm, ...(it.label ? { label: String(it.label) } : {}) } : t;
        }).filter(Boolean),
      };
      if (s.sub) o.sub = String(s.sub);
      return o;
    }),
    restaurantTips: (Array.isArray(d.restaurantTips) ? d.restaurantTips : []).map(String),
    tips: (Array.isArray(d.tips) ? d.tips : []).map(String),
    changes: (Array.isArray(d.changes) ? d.changes : []).map(String),
    pairsWith: Array.isArray(d.pairsWith) ? d.pairsWith : [],
  };
  if (d.image) r.image = String(d.image);
  if (!r.source.name && !r.source.url) delete r.source;
  return r;
}
