// Typ av rätt. Claude sätter en eller två per recept; gissningen används tills dess.
export const DISHES = [
  { key: "soppa", name: "Soppor", color: "dijon" },
  { key: "gryta", name: "Grytor", color: "crust" },
  { key: "pasta", name: "Pasta och risotto", color: "plum" },
  { key: "ugn", name: "Ugnsrätter och gratäng", color: "ember" },
  { key: "sallad", name: "Sallader", color: "spinach" },
  { key: "pizza", name: "Pizza", color: "ember" },
  { key: "grill", name: "Från grillen", color: "crust" },
  { key: "forratt", name: "Förrätter", color: "sea" },
  { key: "plock", name: "Plockmat och buffé", color: "olive" },
  { key: "brod", name: "Bröd och bakat", color: "dijon" },
  { key: "dessert", name: "Desserter", color: "plum" },
  { key: "tillbehor", name: "Såser och tillbehör", color: "olive" },
];
export const DISH_KEYS = DISHES.map((d) => d.key);
export const DISH_NAME = Object.fromEntries(DISHES.map((d) => [d.key, d.name]));

const GUESS = [
  ["soppa", /soppa|soup|buljong|bisque|gazpacho|ramen|pho\b|tom kha|tom yum|minestrone|borsjtj|chowder|vichyssoise|velouté|consommé/],
  ["gryta", /gryta|stew|curry|tagine|bourguignon|ragu\b|ragù|daube|chili con|dal\b|dhal|korma|vindaloo|masala|stroganoff|kalops|cassoulet|goulash|gulasch|fricassé|paneer|makhani/],
  ["pasta", /pasta|spaghetti|linguine|tagliatelle|penne|rigatoni|lasagne|lasagna|risotto|gnocchi|carbonara|ravioli|orecchiette|pappardelle|fettuccine|nudl|noodle|pad thai/],
  ["ugn", /gratäng|gratin|ugnsbakad|ugnsstekt|i ugn|pudding|paj\b|moussaka|parmigiana|ugnsrätt|grenoble|wellington|lövbiff i ugn|helstekt/],
  ["sallad", /sallad|salad|tabbouleh|bowl|slaw|coleslaw|larb|som tam/],
  ["pizza", /pizza|calzone|focaccia di|flammkuchen|pinsa/],
  ["grill", /grillad|grill|bbq|barbecue|spett|kebab|satay|yakitori|tandoori/],
  ["forratt", /toast skagen|carpaccio|tartar|ceviche|förrätt|pâté|terrin|rillette/],
  ["plock", /plock|tapas|meze|crostini|bruschetta|snittar|canapé|dumpling|gyoza|vårrull|spett|pinnar|dipp|röra|minipaj|pajer|bites|buffé|smårätt|chark|ostbricka|mingel|wraps?\b|ägghalvor|fyllda ägg|smörgåstårta/],
  ["brod", /bröd|bread|naan|chapati|roti|bulle|bullar|limpa|baguette|focaccia|scones|surdeg|tortilla|pita|kaka|tårta|muffin|cookie|kakor|pizzadeg/],
  ["dessert", /dessert|efterrätt|crème brûlée|creme brulee|panna cotta|tiramisu|mousse|glass|sorbet|parfait|pannacotta|cheesecake|smulpaj|clafoutis|pavlova|fondant|soufflé/],
  ["tillbehor", /sås\b|sås |dressing|chutney|raita|pickles|inlagd|majonnäs|aioli|pesto|rödkål|potatismos|mos\b|tillbehör|salsa|röra/],
];

export function dishesOf(r) {
  const own = (Array.isArray(r.dishes) ? r.dishes : []).filter((d) => DISH_KEYS.includes(d));
  const t = `${r.title} ${r.type || ""}`.toLowerCase();
  // Plockmat kom till senare: äldre recept som ser ut som plockmat får den också.
  if (own.length) return !own.includes("plock") && GUESS.find(([k]) => k === "plock")[1].test(t) ? [...own, "plock"] : own;
  const out = [];
  for (const [k, re] of GUESS) if (re.test(t)) out.push(k);
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
