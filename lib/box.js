// Receptlådan: huvudkort i tre fack, plus säsong. Körs i webbläsaren på receptlistan.

const low = (s) => String(s || "").toLowerCase();
const hay = (r) => low(`${r.title} ${r.base} ${r.ingredients} ${(r.tags || []).join(" ")}`);
const isType = (r, re) => re.test(low(r.type || "Huvudrätt"));
const main = (r) => isType(r, /huvud/);

const RAW = [
  { key: "fisk", name: "Fisk och skaldjur", color: "sea", test: (r) => /fisk|skaldjur|lax|torsk|sej|kolja|röding|abborre|gös|sill|tonfisk|räk|musslor|kräft|hummer|krabba|bläckfisk|pilgrimsmussl/.test(low(r.base)) || (!r.base && /lax|torsk|räkor/.test(hay(r))) },
  { key: "fagel", name: "Kyckling och fågel", color: "dijon", test: (r) => /kyckling|fågel|anka|kalkon|gås|pärlhöns/.test(low(r.base)) },
  { key: "kott", name: "Kött", color: "ember", test: (r) => /nöt|kött|fläsk|lamm|vilt|älg|hjort|ren|kalv|korv|bacon|skinka|färs|gris/.test(low(r.base)) },
  { key: "veg", name: "Vegetariskt", color: "spinach", test: (r) => /veg|grönsak|bönor|linser|tofu|halloumi|svamp/.test(low(r.base)) },
  { key: "pasta", name: "Pasta, ris och nudlar", color: "crust", test: (r) => /pasta|(^|\s)ris(\s|$|otto)|nudl|spaghetti|lasagne/.test(low(r.base)) },
];

const OCCASION = [
  { key: "snabbt", name: "Snabbt, högst 30 min", color: "spinach", test: (r) => main(r) && (r.minutes || 999) <= 30 },
  { key: "vardag", name: "Vardagsmiddag", color: "olive", test: (r) => main(r) && (r.minutes || 999) <= 50 },
  { key: "helg", name: "Helg och långkok", color: "crust", test: (r) => main(r) && (r.minutes || 0) >= 75 },
  { key: "gaster", name: "När det kommer gäster", color: "plum", test: (r) => main(r) && ((r.rating || 0) >= 4 || /bjudning|fest|gäster/.test(hay(r))) },
  { key: "latt", name: "Lätt", color: "sea", test: (r, o) => main(r) && r.kcal && r.kcal <= (o.lightKcal || 500) },
  { key: "forratt", name: "Förrätter och smått", color: "dijon", test: (r) => isType(r, /förrätt|smårätt|tilltugg|soppa/) },
  { key: "tillbehor", name: "Tillbehör och bröd", color: "olive", test: (r) => isType(r, /tillbehör|bröd|sås/) },
  { key: "dessert", name: "Desserter", color: "plum", test: (r) => isType(r, /dessert|efterrätt|bakverk|kaka/) },
];

const PALETTE = ["ember", "sea", "dijon", "spinach", "plum", "crust", "olive"];

// Ett fack = en lista med huvudkort. Varje huvudkort har sina recept.
export function drawers(recipes, opts = {}) {
  const build = (defs) => defs
    .map((d) => ({ ...d, items: recipes.filter((r) => d.test(r, opts)) }))
    .filter((d) => d.items.length);

  const raw = build(RAW);
  const rest = recipes.filter((r) => main(r) && !RAW.some((d) => d.test(r)));
  if (rest.length) raw.push({ key: "ovrigt", name: "Övrigt", color: "olive", items: rest });

  const kitchens = {};
  for (const r of recipes) if (r.kitchen) (kitchens[r.kitchen] ||= []).push(r);
  const kok = Object.entries(kitchens)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "sv"))
    .map(([name, items], i) => ({ key: "k-" + name, name, color: PALETTE[i % PALETTE.length], items }));

  return [
    { key: "ravara", name: "Råvara", hint: "Vad har ni lust med, eller vad finns hemma?", cards: raw },
    { key: "kok", name: "Kök", hint: "Res runt i köken.", cards: kok },
    { key: "tillfalle", name: "Tillfälle", hint: "Efter tid, sällskap och sug.", cards: build(OCCASION) },
  ];
}

// Säsong per månad, svenska råvaror. Matchas mot titel och ingredienser.
const SEASON = [
  ["grönkål", "rotselleri", "palsternacka", "jordärtskocka", "purjolök", "blodapelsin", "citron", "apelsin", "skrei", "vitkål"],
  ["grönkål", "rotselleri", "palsternacka", "jordärtskocka", "purjolök", "blodapelsin", "skrei", "torsk", "rödbeta"],
  ["skrei", "torsk", "purjolök", "palsternacka", "rotselleri", "blodapelsin", "rödbeta", "morot"],
  ["ramslök", "spenat", "nässlor", "rädisor", "sparris", "torsk", "gräslök"],
  ["sparris", "rabarber", "ramslök", "rädisor", "nässlor", "spenat", "gräslök"],
  ["färskpotatis", "jordgubb", "sparris", "ärtor", "sockerärtor", "dill", "sill", "gräslök", "rabarber"],
  ["jordgubb", "hallon", "blåbär", "ärtor", "sockerärtor", "kantarell", "zucchini", "tomat", "färskpotatis", "makrill"],
  ["kräft", "kantarell", "tomat", "majs", "zucchini", "blåbär", "plommon", "fänkål", "aubergine", "paprika"],
  ["kantarell", "karljohan", "svamp", "äpple", "päron", "plommon", "pumpa", "älg", "lingon", "rödbeta", "hummer"],
  ["vilt", "älg", "hjort", "svamp", "trattkantarell", "pumpa", "äpple", "jordärtskocka", "lingon", "musslor", "hummer", "kål"],
  ["vilt", "älg", "hjort", "anka", "gås", "grönkål", "rödkål", "brysselkål", "pumpa", "jordärtskocka", "palsternacka", "rotselleri", "trattkantarell", "lingon", "musslor"],
  ["grönkål", "rödkål", "brysselkål", "skinka", "sill", "lax", "klementin", "apelsin", "palsternacka", "rotselleri"],
];
export const MONTHS = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];

export function seasonal(recipes, month = new Date().getMonth()) {
  const words = SEASON[month];
  return recipes
    .map((r) => {
      const h = hay(r);
      const hits = words.filter((w) => h.includes(w));
      return { r, hits };
    })
    .filter((x) => x.hits.length)
    .sort((a, b) => b.hits.length - a.hits.length || (b.r.rating || 0) - (a.r.rating || 0));
}

export const seasonWords = (month = new Date().getMonth()) => SEASON[month];
