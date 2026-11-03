// Rutnätet mat mot dryck, i stil med Wine Follys: kolumner är dryckestyper, rader är mat.
// 0 = inte, 1 = passar, 2 = passar riktigt bra. Raderna har konkreta tips som visas när man trycker.

export const WINE_TYPES = [
  { key: "lattv", name: "Lätt vitt", color: "#E3DC8C", items: ["sauvignon-blanc", "albarino", "gruner", "pinot-gris"] },
  { key: "fylligv", name: "Fylligt vitt", color: "#D9B44A", items: ["chardonnay", "viognier", "chenin"] },
  { key: "aromv", name: "Aromatiskt vitt", color: "#E9A23B", items: ["riesling", "gewurz"] },
  { key: "bubbel", name: "Mousserande", color: "#8EC3C4", items: ["champagne"] },
  { key: "rose", name: "Rosé", color: "#EE9C9A", items: ["rose"] },
  { key: "lattr", name: "Lätt rött", color: "#D24A5C", items: ["pinot-noir", "gamay"] },
  { key: "medelr", name: "Medelfylligt rött", color: "#9B2335", items: ["sangiovese", "barbera", "tempranillo", "merlot", "grenache"] },
  { key: "kraftr", name: "Kraftigt rött", color: "#5A1222", items: ["cabernet", "syrah", "malbec", "nebbiolo", "zinfandel"] },
  { key: "sott", name: "Sött och starkt", color: "#9A531E", items: ["sott"] },
];

export const BEER_TYPES = [
  { key: "ljusl", name: "Ljus lager", color: "#F1CC4E", items: ["internationell-lager", "tysk-pilsner", "tjeckisk-pilsner", "helles", "export", "kellerbier"] },
  { key: "morkl", name: "Mörk lager", color: "#9A4E1C", items: ["wiener", "marzen", "dunkel", "schwarzbier", "bock", "dubbelbock"] },
  { key: "pale", name: "Pale ale och bitter", color: "#D98A2B", items: ["bitter", "apa", "amber-ale", "blonde-ale"] },
  { key: "ipa", name: "IPA", color: "#C9731F", items: ["engelsk-ipa", "ipa", "neipa", "dipa", "session-ipa"] },
  { key: "vete", name: "Veteöl", color: "#EBC56A", items: ["weissbier", "dunkelweizen", "weizenbock", "wit"] },
  { key: "belg", name: "Belgiskt", color: "#B5652A", items: ["blonde", "dubbel", "tripel", "quadrupel", "saison"] },
  { key: "stark", name: "Stout, porter och starka", color: "#2E1A12", items: ["porter", "dry-stout", "imperial-stout", "barley-wine", "strong-ale"] },
  { key: "syrl", name: "Syrligt", color: "#E07A8A", items: ["berliner-weisse", "sour-ipa", "pastry-sour", "lambic", "flanders-red"] },
];

// wine: [lättV, fylligV, aromV, bubbel, rosé, lättR, medelR, kraftR, sött]
// beer: [ljusL, mörkL, pale, ipa, vete, belg, stark, syrl]
export const MATRIX = [
  { group: "Maten", rows: [
    { key: "notkott", icon: "🥩", name: "Nötkött och grillat", wine: [0, 0, 0, 0, 0, 1, 1, 2, 0], beer: [0, 1, 1, 1, 0, 1, 2, 0], dish: "Nötkött och grillat" },
    { key: "vilt", icon: "🦌", name: "Vilt och lamm", wine: [0, 0, 0, 0, 0, 1, 2, 2, 0], beer: [0, 2, 0, 0, 0, 2, 2, 0], dish: "Vilt och lamm" },
    { key: "gryta", icon: "🍲", name: "Grytor och långkok", wine: [0, 0, 0, 0, 0, 1, 2, 1, 0], beer: [0, 2, 0, 0, 0, 2, 2, 0], dish: "Grytor och långkok" },
    { key: "flask", icon: "🐖", name: "Fläsk och korv", wine: [0, 1, 2, 1, 1, 2, 1, 0, 0], beer: [2, 2, 1, 0, 1, 1, 0, 0], dish: "Fläsk och korv" },
    { key: "kyckling", icon: "🍗", name: "Kyckling och fågel", wine: [1, 2, 1, 1, 1, 2, 1, 0, 0], beer: [1, 1, 2, 0, 1, 2, 0, 1], dish: "Kyckling och fågel" },
    { key: "fisk", icon: "🐟", name: "Fisk och skaldjur", wine: [2, 2, 1, 2, 1, 1, 0, 0, 0], beer: [2, 0, 1, 0, 2, 2, 1, 1], dish: "Fisk och skaldjur" },
    { key: "husman", icon: "🥔", name: "Husman och gräddigt", wine: [1, 2, 1, 1, 0, 1, 0, 0, 0], beer: [2, 2, 1, 0, 0, 0, 0, 0], dish: "Husman och gräddigt" },
    { key: "pasta", icon: "🍕", name: "Pasta och pizza", wine: [1, 1, 0, 1, 1, 1, 2, 0, 0], beer: [1, 2, 2, 1, 0, 0, 0, 0], dish: "Pasta och pizza" },
    { key: "kryddigt", icon: "🌶️", name: "Kryddstarkt och asiatiskt", wine: [1, 0, 2, 1, 1, 0, 0, 0, 0], beer: [2, 0, 1, 1, 2, 0, 0, 1], dish: "Kryddstarkt och asiatiskt" },
    { key: "svamp", icon: "🍄", name: "Vegetariskt och svamp", wine: [0, 1, 0, 0, 0, 2, 1, 1, 0], beer: [0, 2, 1, 0, 0, 1, 1, 0], dish: "Vegetariskt och svamp" },
    { key: "sallad", icon: "🥗", name: "Sallad och lätta rätter", wine: [2, 0, 1, 1, 2, 0, 0, 0, 0], beer: [1, 0, 1, 0, 2, 1, 0, 2], dish: "Sallad och lätta rätter" },
  ] },
  { group: "Osten", rows: [
    { key: "farsk", icon: "🐐", name: "Färsk och mild ost", wine: [2, 0, 1, 1, 1, 0, 0, 0, 0], beer: [0, 0, 0, 0, 2, 2, 0, 2], cheese: "farsk" },
    { key: "vitmogel", icon: "🧀", name: "Brie och vitmögel", wine: [0, 1, 0, 2, 0, 1, 0, 0, 0], beer: [0, 0, 0, 0, 0, 2, 0, 2], cheese: "vitmogel" },
    { key: "lagrad", icon: "🧀", name: "Lagrad hårdost", wine: [0, 1, 1, 1, 0, 0, 1, 2, 1], beer: [0, 1, 1, 2, 0, 2, 2, 0], cheese: "lagrad" },
    { key: "bla", icon: "🫕", name: "Blåmögel och kittost", wine: [0, 0, 1, 0, 0, 0, 0, 0, 2], beer: [0, 0, 0, 1, 0, 1, 2, 1], cheese: "bla" },
  ] },
  { group: "Desserten", rows: [
    { key: "frukt", icon: "🍓", name: "Frukt och bär", wine: [0, 0, 1, 2, 0, 0, 0, 0, 1], beer: [0, 0, 0, 0, 1, 1, 0, 2], dessert: "frukt" },
    { key: "vanilj", icon: "🍮", name: "Vanilj och karamell", wine: [0, 0, 1, 0, 0, 0, 0, 0, 2], beer: [0, 0, 0, 1, 0, 1, 2, 0], dessert: "vanilj" },
    { key: "choklad", icon: "🍫", name: "Choklad", wine: [0, 0, 0, 0, 0, 0, 0, 1, 2], beer: [0, 0, 0, 0, 0, 1, 2, 1], dessert: "choklad" },
  ] },
];
