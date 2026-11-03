// Rimlighetskontroll av huvudråvaran: en rätt får bara heta Fläsk, Nötkött, Kyckling och så vidare
// om den råvaran faktiskt finns bland ingredienserna. Annars väljs det som finns, eller Vegetariskt.
// Ingen import med "@/" här, filen används också av scripts/migrate.mjs.

const KINDS = [
  ["Fisk", /^(fisk|skaldjur|lax|torsk)/, /fisk|lax|torsk|sej|kolja|röding|abborre|gös|sill|strömming|tonfisk|makrill|hälleflundra|rödspätta|räk|mussl|kräft|hummer|krabba|bläckfisk|pilgrimsmussl|ansjovis|kaviar|skrei/],
  ["Kyckling", /^(kyckling|fågel|höns)/, /kyckling|höns|kalkon|anka|ankbröst|gås/],
  ["Fläsk", /^(fläsk|gris)/, /fläsk|bacon|skinka|karré|kotlett|revben|korv|chorizo|salami|pancetta|prosciutto|guanciale|gris|kassler|serrano|lardo|nduja|isterband|prinskorv|falukorv/],
  ["Nötkött", /^(nöt|kött|biff)/, /nöt|högrev|entrecôte|entrecote|oxfilé|biff|ryggbiff|rostbiff|flankstek|oxkind|kalv|bresaola|färs/],
  ["Lamm", /^lamm/, /lamm/],
  ["Vilt", /^(vilt|älg|hjort|rådjur|vildsvin|ren)/, /älg|hjort|rådjur|vildsvin|renkött|renstek|ren |fasan|rapphöna|vilt/],
];
const low = (s) => String(s || "").toLowerCase();

export function ingredientNames(body) {
  return (body?.groups || []).flatMap((g) => (g.items || []).map((i) => low(i.name))).join(" | ");
}

// Returnerar en rättad bas, eller samma bas om den stämmer eller inte gäller kött och fisk.
export function fixBase(base, names) {
  const b = low(base).trim();
  const kind = KINDS.find(([, re]) => re.test(b));
  if (!kind) return base;
  if (kind[2].test(names)) return base;
  const other = KINDS.find(([, , re]) => re.test(names));
  return other ? other[0] : "Vegetariskt";
}
