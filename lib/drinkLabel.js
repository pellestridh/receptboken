// Etikett för vin (färg/typ) och öl (färg och stil). Använder Claudes fält, annars en gissning från stil och namn.
const WINE = [
  ["mousserande", /mousserande|champagne|cava|crémant|cremant|prosecco|franciacorta|sekt|spumante|sparkling|pét-nat|pet nat|brut/],
  ["rosé", /rosé|rose\b|rosado|rosato/],
  ["orange", /orange ?vin|orangevin|skalkontakt|amber wine/],
  ["sött", /portvin|port\b|sherry|madeira|sauternes|tokaji|dessertvin|sött vin|sött|vin santo|ice ?wine|isvin|moscato d|marsala|pedro xim/],
  ["rött", /rött|röd|red\b|rouge|tinto|rosso|pinot noir|spätburgunder|nebbiolo|barolo|barbaresco|sangiovese|chianti|brunello|montepulciano|primitivo|nero d|tempranillo|rioja|ribera|syrah|shiraz|grenache|garnacha|cabernet|merlot|malbec|zinfandel|gamay|beaujolais|bordeaux|bourgogne rouge|côtes du rhône|cotes du rhone|valpolicella|amarone|ripasso|dolcetto|barbera|carmenère|pinotage|mourvèdre|aglianico|nerello|douro|dão|blaufränkisch|zweigelt|châteauneuf|chateauneuf|mencía|mencia/],
  ["vitt", /vitt|vit\b|white|blanc|bianco|blanco|weiss|riesling|chardonnay|sauvignon|chenin|grüner|gruner|albariño|albarino|pinot gris|pinot grigio|gewürz|gewurz|chablis|sancerre|soave|vermentino|muscadet|viognier|verdejo|godello|assyrtiko|fiano|greco|garganega|furmint|sémillon|semillon|marsanne|roussanne|pouilly|meursault|torrontés|txakoli|grillo|arneis/],
];
const BEER = [
  ["mörk", /stout|porter|dunkel|schwarz|svart|mörk|quadrupel|quad\b|dubbel|doppelbock|bock|brown|brun|barley ?wine|rauch|imperial stout|baltic|abbey dark|tmavé|tmave|black/],
  ["bärnsten", /amber|bärnsten|röd|red ale|bitter|esb|märzen|marzen|oktoberfest|wiener|vienna|altbier|alt\b|irish red|scotch ale|wee heavy|saison ambrée|english pale|mild|biere de garde|bière de garde|flanders|oud bruin|kriek|rodenbach/],
  ["ljus", /pils|pilsner|lager|helles|hell\b|ljus|kölsch|kolsch|wit|weiss|weizen|hefe|blond|saison|tripel|gose|berliner|pale ale|ipa|session|golden|gueuze|geuze|lambic|cream ale|wheat/],
];

const pickOf = (list, text) => { for (const [k, re] of list) if (re.test(text)) return k; return null; };

export function wineColor(d) {
  const c = String(d?.color || "").toLowerCase();
  if (["rött", "vitt", "rosé", "mousserande", "orange", "sött"].includes(c)) return c;
  return pickOf(WINE, `${d?.style || ""} ${d?.name || ""}`.toLowerCase());
}
export function beerColor(d) {
  const c = String(d?.color || "").toLowerCase();
  if (["ljus", "bärnsten", "mörk"].includes(c)) return c;
  return pickOf(BEER, `${d?.style || ""} ${d?.name || ""}`.toLowerCase());
}

export const WINE_LABEL = { "rött": "Rött vin", "vitt": "Vitt vin", "rosé": "Rosévin", "mousserande": "Mousserande", "orange": "Orangevin", "sött": "Sött vin" };
export const BEER_LABEL = { "ljus": "Ljus öl", "bärnsten": "Bärnstensfärgad öl", "mörk": "Mörk öl" };

export function label(kind, d) {
  if (kind === "wine") { const c = wineColor(d); return { tone: c ? "w-" + c : "w-none", text: c ? WINE_LABEL[c] : "Vin" }; }
  if (kind === "beer") { const c = beerColor(d); return { tone: c ? "b-" + c : "b-none", text: c ? BEER_LABEL[c] : "Öl" }; }
  return { tone: "na", text: "Alkoholfritt" };
}
