// Doftcirklar för öl och vin. Inre ringen är var doften kommer ifrån, yttre ringen är doften.
// styles: ölstilar (beer.js) eller druvor (wine.js) där doften är typisk.

export const BEER_WHEEL = [
  { name: "Malt", color: "#D9A54A", from: "Malten: kornet som mältats och torkats. Ljus malt ger bröd och honung, mer torkad ger kola.", items: [
    { n: "Bröd och kex", d: "Ljus malt. Det rena grundtonen i lager och engelsk ale.", styles: ["helles", "tysk-pilsner", "bitter", "kolsch"] },
    { n: "Honung", d: "Ljus malt i fylliga, ljusa öl.", styles: ["helles-bock", "blonde", "tripel"] },
    { n: "Kola och karamell", d: "Karamellmalt som rostats lätt medan den är fuktig.", styles: ["amber-ale", "irish-red", "marzen", "scottish"] },
    { n: "Nötter", d: "Mörkare malt, typiskt för brown ale.", styles: ["brown-ale", "dunkel", "altbier"] },
    { n: "Rostat bröd", d: "Münchener- och Wienermalt.", styles: ["wiener", "marzen", "bock"] },
  ] },
  { name: "Rostat", color: "#6B4226", from: "Hårt rostad malt eller rostat korn, som kaffebönor.", items: [
    { n: "Kaffe", d: "Rostat korn, typiskt för torr stout.", styles: ["dry-stout", "imperial-stout", "black-ipa"] },
    { n: "Choklad", d: "Chokladmalt.", styles: ["porter", "sweet-stout", "oatmeal-stout"] },
    { n: "Lakrits och tjära", d: "Mycket rostad malt i starka öl.", styles: ["imperial-stout", "baltisk-porter"] },
    { n: "Rök", d: "Malt torkad över öppen eld.", styles: ["rauchbier"] },
  ] },
  { name: "Humle", color: "#6E9A3C", from: "Humlen: kottarna ger beska när de kokas och doft när de tillsätts sent eller torrhumlas.", items: [
    { n: "Citrus, grapefrukt", d: "Amerikansk humle som Cascade och Centennial.", styles: ["apa", "ipa", "session-ipa"] },
    { n: "Tropisk frukt", d: "Modern humle som Citra, Mosaic och Galaxy.", styles: ["neipa", "dipa", "session-ipa"] },
    { n: "Tall och kåda", d: "West Coast-humle som Simcoe och Chinook.", styles: ["ipa", "dipa", "black-ipa"] },
    { n: "Gräs och örter", d: "Tysk och tjeckisk ädelhumle, eller färsk humle.", styles: ["tysk-pilsner", "tjeckisk-pilsner", "imperial-pils"] },
    { n: "Blommor", d: "Saaz, Hallertau och engelsk humle.", styles: ["tjeckisk-pilsner", "kolsch", "engelsk-pale-ale"] },
    { n: "Jord och te", d: "Engelsk humle som Fuggles och East Kent Goldings.", styles: ["bitter", "engelsk-pale-ale", "mild"] },
  ] },
  { name: "Jäst", color: "#E8CF6A", from: "Jästen: estrar och fenoler som bildas under jäsningen. Varmare jäsning ger mer.", items: [
    { n: "Banan", d: "Ester från veteölsjäst.", styles: ["weissbier", "dunkelweizen", "weizenbock"] },
    { n: "Kryddnejlika", d: "Fenol från veteölsjäst.", styles: ["weissbier", "dunkelweizen"] },
    { n: "Päron och äpple", d: "Belgisk och engelsk jäst.", styles: ["golden-strong", "blonde", "tripel", "belgisk-ipa"] },
    { n: "Peppar, krydda", d: "Belgisk jäst, särskilt saisonjäst.", styles: ["saison", "tripel", "belgisk-ipa"] },
    { n: "Torkad frukt", d: "Russin, fikon, plommon och dadlar från starka mörka öl.", styles: ["dubbel", "quadrupel", "barley-wine", "old-ale"] },
    { n: "Alkoholvärme", d: "Starka öl. Ska kännas som värme, inte som sprit.", styles: ["barley-wine", "eisbock", "quadrupel"] },
  ] },
  { name: "Syra och vilt", color: "#C25B6E", from: "Mjölksyrabakterier, vildjäst och fat.", items: [
    { n: "Mjölksyra", d: "Ren, yoghurtlik syra.", styles: ["berliner-weisse", "gose"] },
    { n: "Körsbär och bär", d: "Frukt som lagts i ölet.", styles: ["kriek", "flanders-red"] },
    { n: "Stall och läder", d: "Brettanomyces, vildjäst.", styles: ["lambic", "oud-bruin"] },
    { n: "Vinös och ek", d: "Lagring på träfat.", styles: ["flanders-red", "lambic", "old-ale"] },
  ] },
  { name: "Fel", color: "#B23A3A", fault: true, from: "Felsmaker: något har gått snett i bryggeriet, i transporten eller i kylen.", items: [
    { n: "Smörkola", d: "Diacetyl. Fel i de flesta stilar, men en svag ton är tillåten i tjeckisk pilsner och vissa engelska ale.", styles: [] },
    { n: "Kokt majs", d: "DMS. Kommer från malten eller för kort kokning.", styles: [] },
    { n: "Blöt kartong", d: "Oxiderat. Ölet har åldrats med syre. En sherryton kan dock vara fin i lagrad barley wine.", styles: [] },
    { n: "Skunk", d: "Ljusskadat. Öl i grön eller klar flaska som stått i ljus.", styles: [] },
    { n: "Gröna äpplen", d: "Acetaldehyd. Ung öl som inte jäst klart.", styles: [] },
    { n: "Lösningsmedel", d: "Fuselalkoholer från för varm jäsning. Känns hett och sprittigt.", styles: [] },
  ] },
];

export const WINE_WHEEL = [
  { name: "Citrus och äpple", color: "#E4D36A", from: "Druvan själv. Typiskt för friska vita viner från svalt klimat.", items: [
    { n: "Citron och lime", d: "Hög syra, svalt klimat.", styles: ["riesling", "sauvignon-blanc", "albarino"] },
    { n: "Grönt äpple", d: "Ung, frisk vit.", styles: ["chardonnay", "gruner", "chenin"] },
    { n: "Päron", d: "Mjukare vita.", styles: ["pinot-gris", "chenin"] },
  ] },
  { name: "Tropisk frukt och stenfrukt", color: "#E8A84A", from: "Druvan i varmare klimat eller mognare skörd.", items: [
    { n: "Persika, aprikos", d: "Aromatiska vita.", styles: ["viognier", "riesling"] },
    { n: "Ananas, mango", d: "Varm Chardonnay och Sauvignon från Nya världen.", styles: ["chardonnay", "sauvignon-blanc"] },
    { n: "Litchi", d: "Den klassiska Gewürztraminer-doften.", styles: ["gewurz"] },
  ] },
  { name: "Röda bär", color: "#C84A5A", from: "Druvan. Lätta röda viner.", items: [
    { n: "Jordgubb, hallon", d: "Lätta, fruktiga röda.", styles: ["gamay", "grenache", "pinot-noir"] },
    { n: "Körsbär", d: "Italienska och lätta röda.", styles: ["sangiovese", "pinot-noir", "barbera", "nebbiolo"] },
    { n: "Tranbär, vinbär", d: "Hög syra.", styles: ["pinot-noir", "gamay"] },
  ] },
  { name: "Mörka bär", color: "#6E1F35", from: "Druvan. Kraftiga röda från varmt klimat.", items: [
    { n: "Svarta vinbär", d: "Cabernets kännetecken.", styles: ["cabernet", "merlot"] },
    { n: "Björnbär, blåbär", d: "Kraftiga, mogna röda.", styles: ["syrah", "malbec", "zinfandel"] },
    { n: "Plommon", d: "Mjuka röda.", styles: ["merlot", "malbec", "tempranillo"] },
    { n: "Russin och fikon", d: "Torkade druvor eller söta viner.", styles: ["sott", "zinfandel"] },
  ] },
  { name: "Blommor och örter", color: "#8B7BB5", from: "Druvan. Aromatiska sorter och svalt klimat.", items: [
    { n: "Ros och viol", d: "Aromatiska vita och vissa röda.", styles: ["gewurz", "nebbiolo", "syrah"] },
    { n: "Gräs och paprika", d: "Pyrazin, typiskt för Sauvignon och ung Cabernet.", styles: ["sauvignon-blanc", "cabernet"] },
    { n: "Mynta, eukalyptus", d: "Cabernet från varmt klimat.", styles: ["cabernet"] },
  ] },
  { name: "Krydda", color: "#9A5B2E", from: "Druvan eller eken.", items: [
    { n: "Svartpeppar", d: "Syrahs kännetecken.", styles: ["syrah", "grenache", "gruner"] },
    { n: "Vanilj och kokos", d: "Fat av ny ek, särskilt amerikansk.", styles: ["tempranillo", "chardonnay", "zinfandel"] },
    { n: "Kanel, nejlika", d: "Ek och mognad.", styles: ["tempranillo", "merlot"] },
  ] },
  { name: "Ek och mognad", color: "#7A6A55", from: "Lagring på fat och flaska.", items: [
    { n: "Smör och nötter", d: "Malolaktisk jäsning och ek i vita.", styles: ["chardonnay"] },
    { n: "Bröd och brioche", d: "Lagring på jästfällningen, som i Champagne.", styles: ["champagne"] },
    { n: "Läder och tobak", d: "Mogna röda.", styles: ["nebbiolo", "tempranillo", "sangiovese"] },
    { n: "Petroleum", d: "Mogen Riesling.", styles: ["riesling"] },
  ] },
  { name: "Jord och mineral", color: "#5D6B5A", from: "Druvan, platsen och mognaden.", items: [
    { n: "Svamp och skog", d: "Mogen Pinot noir och Nebbiolo.", styles: ["pinot-noir", "nebbiolo"] },
    { n: "Sten och flinta", d: "Svala områden som Chablis och Mosel.", styles: ["chardonnay", "riesling", "sauvignon-blanc"] },
  ] },
  { name: "Fel", color: "#B23A3A", fault: true, from: "Felsmaker: korken, syre eller värme.", items: [
    { n: "Våt kartong", d: "Korkdefekt (TCA). Vinet luktar källare och frukten är borta. Byt flaskan.", styles: [] },
    { n: "Sherry och äpple", d: "Oxiderat vin, för mycket syre. Fel i de flesta viner.", styles: [] },
    { n: "Kokt sylt", d: "Värmeskadat, vinet har stått varmt.", styles: [] },
    { n: "Nagellack", d: "Flyktig syra. Lite kan ge liv, mycket är fel.", styles: [] },
  ] },
];
