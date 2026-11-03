import { DISHES, dishesOf } from "@/lib/dishes";
import { HOLIDAYS, holidaysOf, upcomingHoliday } from "@/lib/holidays";

// Receptlådan: huvudkort i fyra fack, plus säsong. Körs i webbläsaren på receptlistan.

const low = (s) => String(s || "").toLowerCase();
const hay = (r) => low(`${r.title} ${r.base} ${r.ingredients} ${(r.tags || []).join(" ")}`);
const isType = (r, re) => re.test(low(r.type || "Huvudrätt"));
const main = (r) => isType(r, /huvud/);

const RAW = [
  { key: "fisk", name: "Fisk och skaldjur", color: "sea", test: (r) => /fisk|skaldjur|lax|torsk|sej|kolja|röding|abborre|gös|sill|tonfisk|räk|musslor|kräft|hummer|krabba|bläckfisk|pilgrimsmussl/.test(low(r.base)) || (!r.base && /lax|torsk|räkor/.test(hay(r))) },
  { key: "fagel", name: "Kyckling och fågel", color: "dijon", test: (r) => /kyckling|fågel|anka|kalkon|gås|pärlhöns/.test(low(r.base)) },
  { key: "kott", name: "Kött", color: "ember", test: (r) => /nöt|kött|fläsk|lamm|kalv|korv|bacon|skinka|färs|gris|högrev|oxfilé|entrecôte/.test(low(r.base)) && !/vilt|älg|hjort|rådjur|vildsvin|ren(kött|stek)?$/.test(low(r.base)) },
  { key: "vilt", name: "Vilt", color: "crust", test: (r) => /vilt|älg|hjort|rådjur|vildsvin|^ren|renkött|renstek|fasan|rapphöna/.test(low(r.base)) },
  { key: "veg", name: "Vegetariskt", color: "spinach", test: (r) => /veg|grönsak|bönor|linser|tofu|halloumi|svamp/.test(low(r.base)) },
];

const OCCASION = [
  { key: "snabbt", name: "Snabbt, högst 30 min", color: "spinach", test: (r) => main(r) && (r.minutes || 999) <= 30 },
  { key: "vardag", name: "Vardagsmiddag", color: "olive", test: (r) => main(r) && (r.minutes || 999) <= 50 },
  { key: "helg", name: "Helg och långkok", color: "crust", test: (r) => main(r) && (r.minutes || 0) >= 75 },
  { key: "gaster", name: "När det kommer gäster", color: "plum", test: (r) => main(r) && ((r.rating || 0) >= 4 || /bjudning|fest|gäster/.test(hay(r))) },
  { key: "latt", name: "Lätt", color: "sea", test: (r, o) => main(r) && r.kcal && r.kcal <= (o.lightKcal || 500) },
  { key: "sasong", name: "I säsong nu", color: "spinach", test: (r) => main(r) && seasonal([r]).length > 0 },
];

const PALETTE = ["ember", "sea", "dijon", "spinach", "plum", "crust", "olive"];

// Samma kök kan heta olika i olika recept: "Thai", "Thailändsk", "thailändskt".
const KITCHEN = [[/^thai/, "Thailändskt"], [/^indi/, "Indiskt"], [/^fran/, "Franskt"], [/^itali/, "Italienskt"], [/^japan/, "Japanskt"], [/^(svensk|husman|nordisk|skandinav)/, "Svenskt"], [/^mexi/, "Mexikanskt"], [/^kines/, "Kinesiskt"], [/^grek/, "Grekiskt"], [/^span/, "Spanskt"], [/^marock|^nordafrik/, "Marockanskt"], [/^korea/, "Koreanskt"], [/^vietnam/, "Vietnamesiskt"], [/^(libanes|mellanöst|levant)/, "Mellanöstern"], [/^amerikan|^usa/, "Amerikanskt"], [/^brit|^engelsk/, "Brittiskt"], [/^tysk/, "Tyskt"]];
export function kitchenName(k) {
  const t = String(k || "").trim();
  if (!t) return "";
  const l = t.toLowerCase();
  for (const [re, name] of KITCHEN) if (re.test(l)) return name;
  const c = t[0].toUpperCase() + t.slice(1);
  return /sk$/i.test(c) ? c + "t" : c;
}

// Ett fack = en lista med huvudkort. Varje huvudkort har sina recept.
export function drawers(recipes, opts = {}) {
  const build = (defs) => defs
    .map((d) => ({ ...d, items: recipes.filter((r) => d.test(r, opts)) }))
    .filter((d) => d.items.length);

  const raw = build(RAW);
  const rest = recipes.filter((r) => main(r) && !RAW.some((d) => d.test(r)));
  if (rest.length) raw.push({ key: "ovrigt", name: "Övrigt", color: "olive", items: rest });

  const kitchens = {};
  for (const r of recipes) { const k = kitchenName(r.kitchen); if (k) (kitchens[k] ||= []).push(r); }
  const kok = Object.entries(kitchens)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "sv"))
    .map(([name, items], i) => ({ key: "k-" + name, name, color: PALETTE[i % PALETTE.length], items }));

  const ratt = DISHES.map((d) => ({ key: "d-" + d.key, name: d.name, color: d.color, items: recipes.filter((r) => dishesOf(r).includes(d.key)) })).filter((d) => d.items.length);
  const typed = new Set(ratt.flatMap((d) => d.items.map((r) => r.id)));
  const other = recipes.filter((r) => !typed.has(r.id));
  if (other.length) ratt.push({ key: "d-ovrigt", name: "Övriga huvudrätter", color: "olive", items: other });

  // Högtiderna i kalenderordning från den som är närmast.
  const next = upcomingHoliday()?.key;
  const hogtid = HOLIDAYS.map((h) => ({ key: "h-" + h.key, name: h.name, color: h.color, items: recipes.filter((r) => holidaysOf(r).includes(h.key)) }))
    .filter((d) => d.items.length).sort((a, b) => (b.key === "h-" + next) - (a.key === "h-" + next));
  return [
    { key: "ratt", name: "Rätt", hint: "Vad blir det? Soppa, gryta, pasta eller något i ugnen.", cards: ratt },
    { key: "ravara", name: "Råvara", hint: "Vad har ni lust med, eller vad finns hemma?", cards: raw },
    { key: "kok", name: "Kök", hint: "Thai, indiskt, franskt och resten, ett huvudkort per kök.", cards: kok },
    { key: "tillfalle", name: "Tillfälle", hint: "Efter tid, sällskap och sug.", cards: build(OCCASION) },
    ...(hogtid.length ? [{ key: "hogtid", name: "Högtid", hint: "Jul, nyår, påsk, midsommar och alla hjärtans dag.", cards: hogtid }] : []),
  ];
}

// Säsong per månad, svenska råvaror. Matchas mot titel och ingredienser.
const SEASON = [
  ["grönkål", "vitkål", "rödkål", "rotselleri", "palsternacka", "jordärtskocka", "purjolök", "blodapelsin", "citron", "apelsin", "skrei"],
  ["grönkål", "vitkål", "rödkål", "rotselleri", "palsternacka", "jordärtskocka", "purjolök", "blodapelsin", "skrei", "torsk", "rödbeta"],
  ["skrei", "torsk", "vitkål", "purjolök", "palsternacka", "rotselleri", "blodapelsin", "rödbeta", "morot"],
  ["ramslök", "spenat", "nässlor", "rädisor", "sparris", "torsk", "gräslök"],
  ["sparris", "rabarber", "ramslök", "rädisor", "nässlor", "spenat", "gräslök"],
  ["färskpotatis", "jordgubb", "sparris", "ärtor", "sockerärtor", "dill", "sill", "gräslök", "rabarber", "spetskål"],
  ["jordgubb", "hallon", "blåbär", "ärtor", "sockerärtor", "kantarell", "zucchini", "tomat", "färskpotatis", "makrill", "spetskål"],
  ["kräft", "kantarell", "tomat", "majs", "zucchini", "blåbär", "plommon", "fänkål", "aubergine", "paprika", "spetskål"],
  ["kantarell", "karljohan", "svamp", "äpple", "päron", "plommon", "pumpa", "älg", "lingon", "rödbeta", "hummer", "vitkål", "blomkål", "broccoli"],
  ["vilt", "älg", "hjort", "svamp", "trattkantarell", "pumpa", "äpple", "jordärtskocka", "lingon", "musslor", "hummer", "vitkål", "rödkål", "grönkål", "rödbeta", "palsternacka"],
  ["vilt", "älg", "hjort", "anka", "gås", "grönkål", "vitkål", "rödkål", "brysselkål", "pumpa", "jordärtskocka", "palsternacka", "rotselleri", "rödbeta", "trattkantarell", "lingon", "musslor"],
  ["grönkål", "vitkål", "rödkål", "brysselkål", "skinka", "sill", "lax", "klementin", "apelsin", "palsternacka", "rotselleri"],
];
export const MONTHS = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];

// En rätt räknas som säsongsrätt först när råvaran bär rätten: den står i namnet, som huvudråvara eller bland de tre första ingredienserna,
// eller flera säsongsråvaror finns bland de första ingredienserna. En garnering räcker inte.
const L = "a-zåäöéü";
const hit = (text, w) => new RegExp(`(^|[^${L}])${w}|${w}(?![${L}])`, "i").test(text);
export function seasonal(recipes, month = new Date().getMonth()) {
  const words = SEASON[month];
  return recipes
    .map((r) => {
      const head = low(`${r.title} ${r.base || ""}`);
      const ings = String(r.ingredients || "").split(",").map(low);
      const lead = ings.slice(0, 3).join(","), first = ings.slice(0, 6).join(",");
      const main = words.filter((w) => hit(head, w) || hit(lead, w));
      const side = words.filter((w) => !main.includes(w) && hit(first, w));
      const score = main.length * 3 + side.length;
      return { r, hits: [...main, ...side], score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score || (b.r.rating || 0) - (a.r.rating || 0));
}

export const seasonWords = (month = new Date().getMonth()) => SEASON[month];
