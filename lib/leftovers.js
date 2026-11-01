// Råvaror som köps i större förpackning än ett recept behöver. Används för att föreslå
// fler rätter till samma meny, så att vitkålen eller crème fraichen inte blir liggande.
const P = (key, name, re, uses, note) => ({ key, name, re, uses, note });

export const PACKS = [
  P("vitkal", "Vitkål", /vitkål|\bkålhuvud/, 3, "Ett kålhuvud räcker till tre, fyra rätter och håller länge i kylen."),
  P("rodkal", "Rödkål", /rödkål/, 3, "Ett huvud räcker länge, och rödkål går att frysa."),
  P("spetskal", "Spetskål", /spetskål/, 2, "Räcker till två rätter."),
  P("savojkal", "Savojkål", /savojkål/, 2, "Räcker till två rätter."),
  P("gronkal", "Grönkål", /grönkål/, 2, "En påse grönkål räcker till två rätter."),
  P("blomkal", "Blomkål", /blomkål/, 2, "Ett huvud räcker ofta till två rätter."),
  P("selleri", "Blekselleri", /blekselleri|stjälkselleri|selleristjälk/, 3, "Ett stånd har många stjälkar."),
  P("rotselleri", "Rotselleri", /rotselleri/, 2, "En rotselleri räcker till flera rätter."),
  P("purjo", "Purjolök", /purjolök/, 2, "Ofta säljs flera i knippe."),
  P("fankal", "Fänkål", /fänkål(?!sfrö)/, 2, ""),
  P("pumpa", "Pumpa", /pumpa|butternut/, 2, "En pumpa räcker till soppa och en rätt till."),
  P("spenat", "Färsk spenat", /färsk spenat|bladspenat|babyspenat/, 2, "En påse blir snabbt dålig, använd den inom några dagar."),
  P("koriander", "Koriander", /koriander(?!frö)/, 3, "En kruka eller knippe räcker till flera rätter."),
  P("persilja", "Persilja", /persilja/, 3, "En kruka räcker till flera rätter."),
  P("dill", "Dill", /\bdill/, 3, "En kruka eller knippe räcker till flera rätter."),
  P("basilika", "Basilika", /basilika/, 3, ""),
  P("mynta", "Mynta", /mynta/, 2, ""),
  P("ingefara", "Färsk ingefära", /ingefära(?!spulver)/, 3, "En bit ingefära räcker länge, och går att frysa."),
  P("citrongras", "Citrongräs", /citrongräs/, 2, ""),
  P("gradde", "Grädde", /grädde(?!fil)|vispgrädde|matlagningsgrädde/, 2, "Ett paket räcker ofta till två rätter."),
  P("cremefraiche", "Crème fraiche", /crème fraiche|creme fraiche|crème fraîche/, 2, "En burk räcker ofta till två rätter."),
  P("graddfil", "Gräddfil", /gräddfil/, 2, ""),
  P("yoghurt", "Yoghurt", /yoghurt/, 2, ""),
  P("kokosmjolk", "Kokosmjölk", /kokosmjölk|kokosgrädde/, 2, "Resten av burken håller några dagar i kylen eller kan frysas."),
  P("feta", "Fetaost", /feta/, 2, ""),
  P("halloumi", "Halloumi", /halloumi/, 2, ""),
  P("mascarpone", "Mascarpone", /mascarpone/, 2, ""),
  P("ricotta", "Ricotta", /ricotta/, 2, ""),
  P("bacon", "Bacon", /bacon|pancetta/, 2, "Ett paket räcker ofta till två rätter."),
  P("chorizo", "Chorizo", /chorizo/, 2, ""),
  P("tomatpure", "Tomatpuré", /tomatpuré/, 3, ""),
  P("champinjon", "Champinjoner", /champinjon/, 2, "En ask räcker ofta till två rätter."),
  P("salladslok", "Salladslök", /salladslök/, 2, "En knippe räcker till flera rätter."),
  P("rodbeta", "Rödbetor", /rödbet/, 2, ""),
];

const low = (s) => String(s || "").toLowerCase();
const hay = (r) => low(`${r.title} ${r.ingredients}`);

// menuRecipes och all är receptlistor (från /api/recipes). Returnerar råvaror med förslag.
export function leftovers(menuRecipes, all, { max = 3 } = {}) {
  const inMenu = new Set(menuRecipes.map((r) => r.id));
  const out = [];
  for (const p of PACKS) {
    const using = menuRecipes.filter((r) => p.re.test(hay(r)));
    if (!using.length || using.length >= p.uses) continue;
    const cands = all
      .filter((r) => !inMenu.has(r.id) && p.re.test(hay(r)) && !r.allergens?.hits?.length)
      .map((r) => ({ r, s: (r.rating || 0) + (r.lastCooked ? Math.min(3, (Date.now() - new Date(r.lastCooked)) / 864e5 / 20) : 1.5) + (/(huvud)/i.test(r.type || "Huvudrätt") ? 1 : 0) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, max)
      .map((x) => x.r);
    out.push({ ...p, using, cands });
  }
  // Det som finns förslag på först, sedan de vanligaste resterna.
  return out.sort((a, b) => (b.cands.length > 0) - (a.cands.length > 0));
}
