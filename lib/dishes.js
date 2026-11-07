// Typ av rätt. Claude sätter en eller två per recept; gissningen används tills dess.
// Sorterat efter hur rätten lagas och vad man letar efter: stekt i panna, ugnsstekt kött och fisk och gratänger är olika fack.
export const DISHES = [
  { key: "soppa", name: "Soppor", color: "dijon" },
  { key: "gryta", name: "Grytor och curry", color: "crust" },
  { key: "pasta", name: "Pasta och risotto", color: "plum" },
  { key: "panna", name: "Från stekpannan och woken", color: "sea" },
  { key: "ugnsstekt", name: "Ugnsstekt", color: "crust" },
  { key: "ugn", name: "Gratänger, pajer och puddingar", color: "ember" },
  { key: "grill", name: "Från grillen", color: "ember" },
  { key: "street", name: "Tacos, burgare och streetfood", color: "dijon" },
  { key: "sallad", name: "Sallader", color: "spinach" },
  { key: "pizza", name: "Pizza", color: "ember" },
  { key: "forratt", name: "Förrätter", color: "sea" },
  { key: "plock", name: "Plockmat och buffé", color: "olive" },
  { key: "brod", name: "Bröd och bakat", color: "dijon" },
  { key: "dessert", name: "Desserter", color: "plum" },
  { key: "tillbehor", name: "Såser och tillbehör", color: "olive" },
];
// Hur Claude väljer typ av rätt.
export const DISH_GUIDE = "Huvudsaken först. En curry, dal eller tagine är gryta. Lasagne och risotto är pasta. Det som steks i panna eller wok, som saltimbocca, schnitzel, biff, köttbullar, stekt fisk, wokade nudlar och okonomiyaki, är panna. Kött, fågel eller fisk som steks hel eller i bitar i ugnen, som fläskkarré, helstekt kyckling, rostbiff och lax i ugn, är ugnsstekt. Gratänger, pajer, puddingar och moussaka är ugn. Tacos, bao buns, hamburgare, wraps och quesadillas är street. Nudelsoppor som ramen, pho och laksa är soppa. Kalla nudelsallader är sallad. Naan är bröd, Toast Skagen är förrätt.";
export const DISH_KEYS = DISHES.map((d) => d.key);
export const DISH_NAME = Object.fromEntries(DISHES.map((d) => [d.key, d.name]));

const GUESS = [
  ["soppa", /soppa|soup|buljong|bisque|gazpacho|ramen|pho\b|tom kha|tom yum|minestrone|borsjtj|chowder|vichyssoise|velouté|consommé/],
  ["gryta", /gryta|stew|curry|tagine|bourguignon|ragu\b|ragù|daube|chili con|dal\b|dhal|korma|vindaloo|masala|stroganoff|kalops|cassoulet|goulash|gulasch|fricassé|paneer|makhani|butter chicken/],
  ["pasta", /pasta|spaghetti|linguine|tagliatelle|penne|rigatoni|lasagne|lasagna|risotto|gnocchi|carbonara|ravioli|orecchiette|pappardelle|fettuccine/],
  ["street", /taco|burgare|burger|bao\b|bao buns|wrap|quesadilla|burrito|gyros|falafel|hot ?dog|banh mi|pulled|souvlaki|shawarma/],
  ["panna", /schnitzel|saltimbocca|biff\b|pannbiff|köttbullar|wallenbergare|(?<![a-zåäö])stekt|wok|pad thai|pad kra|yakisoba|okonomiyaki|piccata|cordon bleu|grenoble|stir.?fry|lövbiff|pytt|raggmunk|(?<![a-zåäö])omelett|frittata|minutstek|i pannan/],
  ["ugnsstekt", /ugnsstekt|ugnsbakad|i ugn|helstekt|rostbiff|karré|wellington|stek\b|kycklinglår|hel kyckling|porchetta|lammstek/],
  ["ugn", /gratäng|gratin|pudding|paj\b|pajer|moussaka|parmigiana|ugnsrätt|ugnsomelett|quiche|lasagne|kålpudding|laxpudding/],
  ["sallad", /sallad|salad|tabbouleh|bowl|slaw|coleslaw|larb|som tam/],
  ["pizza", /pizza|calzone|focaccia di|flammkuchen|pinsa/],
  ["grill", /grillad|grill|bbq|barbecue|spett|satay|yakitori|tandoori|kebab/],
  ["forratt", /toast skagen|carpaccio|tartar|ceviche|förrätt|pâté|terrin|rillette/],
  ["plock", /plock|tapas|meze|crostini|bruschetta|snittar|canapé|dumpling|gyoza|vårrull|spett|pinnar|dipp|röra|minipaj|pajer|bites|buffé|smårätt|chark|ostbricka|mingel|wraps?\b|ägghalvor|fyllda ägg|smörgåstårta/],
  ["brod", /bröd|bread|naan|chapati|roti|(?<!kött)bulle|(?<!kött)bullar|limpa|baguette|focaccia|scones|surdeg|tortilla|pita|kaka|tårta|muffin|cookie|kakor|pizzadeg/],
  ["dessert", /dessert|efterrätt|crème brûlée|creme brulee|panna cotta|tiramisu|mousse|glass|sorbet|parfait|pannacotta|cheesecake|smulpaj|clafoutis|pavlova|fondant|soufflé/],
  ["tillbehor", /sås\b|sås |dressing|chutney|raita|pickles|inlagd|majonnäs|aioli|pesto|rödkål|potatismos|mos\b|tillbehör|salsa|röra/],
];

export function dishesOf(r) {
  const own = (Array.isArray(r.dishes) ? r.dishes : []).filter((d) => DISH_KEYS.includes(d));
  const t = `${r.title} ${r.type || ""}`.toLowerCase();
  // Plockmat kom till senare: äldre recept som ser ut som plockmat får den också.
  if (own.length) return !own.includes("plock") && GUESS.find(([k]) => k === "plock")[1].test(t) ? [...own, "plock"] : own;
  const out = [];
  // Har någon valt bort alla typer själv gissas inget av namnet, så att till exempel ett gammalt "grill" i rubriken inte kommer tillbaka.
  if (!Array.isArray(r.dishes)) for (const [k, re] of GUESS) if (re.test(t)) out.push(k);
  if (!out.length) {
    const type = String(r.type || "").toLowerCase();
    if (/dessert|efterrätt/.test(type)) out.push("dessert");
    else if (/bröd|bak/.test(type)) out.push("brod");
    else if (/förrätt|smårätt/.test(type)) out.push("forratt");
    else if (/tillbehör|sås/.test(type)) out.push("tillbehor");
  }
  return out.slice(0, 2);
}

// Pizza bakas på pizzakvällen, inte som snabb vardagsmat.
export const isPizza = (r) => dishesOf(r).includes("pizza");
