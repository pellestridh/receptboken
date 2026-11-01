// Vinskolan: grunderna, druvorna och vin till mat, för nybörjare som vill bli duktigare.

// De fem sakerna som avgör hur ett vin smakar. Skala 1–5.
export const DIMS = [
  { key: "syra", name: "Syra", lo: "Mjuk", hi: "Frisk", how: "Känns som saliv i mungiporna och på sidorna av tungan, som när man biter i ett grönt äpple. Ju mer det vattnas i munnen, desto högre syra." },
  { key: "sotma", name: "Sötma", lo: "Torr", hi: "Söt", how: "Känns på tungspetsen direkt. Förväxla inte med fruktighet: ett vin kan dofta moget och sött men ändå vara helt torrt." },
  { key: "tannin", name: "Tanniner", lo: "Mjuka", hi: "Strama", how: "Bara i röda viner. Torr, sträv känsla på tandköttet och insidan av läpparna, som starkt svart te. Kommer från skal och kärnor." },
  { key: "fyllighet", name: "Fyllighet", lo: "Lätt", hi: "Fyllig", how: "Hur tungt vinet känns i munnen. Lätt som lättmjölk, medel som mellanmjölk, fyllig som grädde. Alkohol ger fyllighet." },
  { key: "frukt", name: "Frukt", lo: "Diskret", hi: "Intensiv", how: "Hur mycket doft och smak av frukt och bär. Svalt klimat ger ofta mer diskret och syrlig frukt, varmt klimat mognare och mer intensiv." },
];

export const AROMAS = {
  vitt: ["Citron och lime", "Grönt äpple", "Päron", "Persika och aprikos", "Tropisk frukt", "Krusbär", "Blommor", "Honung", "Smör", "Vanilj och ek", "Nötter", "Mineral och flinta", "Örter och gräs", "Petroleum"],
  rott: ["Röda bär", "Körsbär", "Svarta vinbär", "Björnbär och mörka bär", "Plommon", "Russin och torkad frukt", "Viol och rosor", "Peppar", "Lakrits", "Vanilj och ek", "Choklad och kaffe", "Tobak och läder", "Jord och svamp", "Örter"],
};

// Druvorna. Profil 1–5 i ordningen syra, sötma, tannin, fyllighet, frukt.
const P = (syra, sotma, tannin, fyllighet, frukt) => ({ syra, sotma, tannin, fyllighet, frukt });

export const GRAPES = [
  // Vita
  { key: "riesling", name: "Riesling", color: "vitt", p: P(5, 2, 0, 2, 4),
    smell: "Citron, lime, grönt äpple, persika och blommor. Äldre får en ton av petroleum.",
    where: "Tyskland (Mosel, Rheingau), Alsace, Österrike, Australien (Clare Valley)",
    about: "Kanske världens mest matvänliga vita druva. Hög syra gör den frisk, och den finns från knastertorr till söt. Torr betyder trocken på tyska.",
    food: "Asiatiskt och lätt kryddigt, fisk, fläsk, sill, sushi. Halvtorr Riesling är räddningen till het thai och indiskt.",
    next: ["gruner", "albarino", "chenin"], label: ["Mosel", "Alsace Riesling", "Clare Valley"] },
  { key: "sauvignon-blanc", name: "Sauvignon blanc", color: "vitt", p: P(5, 1, 0, 2, 4),
    smell: "Krusbär, citrus, gräs, nässlor, fläder. Från Nya Zeeland mer passionsfrukt.",
    where: "Loire (Sancerre, Pouilly-Fumé), Nya Zeeland (Marlborough), Chile, Sydafrika",
    about: "Krispig, aromatisk och gräsig. Lätt att känna igen, därför en bra druva att börja med.",
    food: "Getost, sallader med vinägrett, sparris, skaldjur, örtiga rätter och thai med lime.",
    next: ["gruner", "albarino", "riesling"], label: ["Sancerre", "Pouilly-Fumé", "Marlborough"] },
  { key: "chardonnay", name: "Chardonnay", color: "vitt", p: P(3, 1, 0, 4, 3),
    smell: "Utan ek: grönt äpple, citrus och flinta (Chablis). Med ek: smör, vanilj, nötter, gul frukt.",
    where: "Bourgogne (Chablis, Meursault), Kalifornien, Australien, Champagne",
    about: "Kameleonten. Samma druva ger både spänstig Chablis och fyllig, smörig kalifornisk. Lär er skillnaden mellan ekad och oekad.",
    food: "Oekad: skaldjur, ostron, fisk. Ekad: hummer, kyckling i gräddsås, smörstekt fisk, svamp.",
    next: ["chenin", "viognier", "pinot-gris"], label: ["Chablis", "Bourgogne blanc", "Meursault"] },
  { key: "chenin", name: "Chenin blanc", color: "vitt", p: P(5, 2, 0, 3, 3),
    smell: "Gula äpplen, kvitten, honung, lanolin och blommor.",
    where: "Loire (Vouvray, Savennières), Sydafrika",
    about: "Hög syra och mycket smak. Finns torr, halvtorr, söt och mousserande.",
    food: "Fläsk, kyckling, sötsura rätter, asiatiskt, getost.",
    next: ["riesling", "chardonnay"], label: ["Vouvray", "Savennières", "Stellenbosch"] },
  { key: "gruner", name: "Grüner Veltliner", color: "vitt", p: P(4, 1, 0, 2, 3),
    smell: "Citrus, grönt äpple, vitpeppar, gröna bönor.",
    where: "Österrike (Wachau, Kamptal, Kremstal)",
    about: "Österrikes signaturdruva. Frisk med en karaktäristisk pepprighet.",
    food: "Wienerschnitzel, sparris, sallader, svårparade grönsaker som kronärtskocka.",
    next: ["sauvignon-blanc", "riesling"], label: ["Wachau", "Kamptal"] },
  { key: "albarino", name: "Albariño", color: "vitt", p: P(4, 1, 0, 2, 4),
    smell: "Persika, citrus, aprikos, salt havsbris.",
    where: "Spanien (Rías Baixas), Portugal (Alvarinho, Vinho Verde)",
    about: "Kustvinet. Aromatisk men frisk med en salt ton som gör den gjord för fisk.",
    food: "Skaldjur, musslor, grillad fisk, ceviche, tapas.",
    next: ["sauvignon-blanc", "gruner"], label: ["Rías Baixas", "Vinho Verde"] },
  { key: "pinot-gris", name: "Pinot gris och grigio", color: "vitt", p: P(3, 2, 0, 3, 3),
    smell: "Päron, äpple, melon. Från Alsace kryddigt och honungsaktigt.",
    where: "Italien (Pinot grigio, lätt), Alsace (Pinot gris, fyllig), Oregon",
    about: "Samma druva, två stilar: lätt och neutral som grigio, fyllig och kryddig som gris.",
    food: "Grigio: lätta förrätter, sallader. Gris: fläsk, kyckling, kryddig mat, anka.",
    next: ["gewurz", "chenin"], label: ["Alsace Pinot gris", "Alto Adige"] },
  { key: "gewurz", name: "Gewürztraminer", color: "vitt", p: P(2, 2, 0, 4, 5),
    smell: "Litchi, ros, ingefära, turkisk peppar.",
    where: "Alsace, Tyskland, Alto Adige",
    about: "Den mest parfymerade druvan, lätt att känna igen på litchi och ros. Låg syra, fyllig.",
    food: "Asiatiskt, indiskt, starka ostar som Münster, foie gras.",
    next: ["pinot-gris", "viognier"], label: ["Alsace Gewurztraminer"] },
  { key: "viognier", name: "Viognier", color: "vitt", p: P(2, 1, 0, 4, 5),
    smell: "Aprikos, persika, blommor, honung.",
    where: "Rhône (Condrieu), Frankrike (Pays d'Oc), Australien",
    about: "Fyllig och blommig med låg syra. Ett vitt vin för den som gillar mycket frukt.",
    food: "Kryddig kyckling, curry med kokos, hummer, krämiga rätter.",
    next: ["chardonnay", "gewurz"], label: ["Condrieu"] },

  // Röda
  { key: "pinot-noir", name: "Pinot noir", color: "rott", p: P(4, 1, 2, 2, 4),
    smell: "Röda bär, körsbär, jordgubbe, svamp och skogsbotten.",
    where: "Bourgogne, Tyskland (Spätburgunder), Nya Zeeland, Oregon, Kalifornien",
    about: "Lätt, elegant och silkig med låga tanniner. Svår att odla, därför ofta dyr, men ett lätt rött vin som passar till nästan allt.",
    food: "Anka, kyckling, lax, svamp, fläskfilé. Ett av få röda viner som fungerar till fisk.",
    next: ["gamay", "nebbiolo", "grenache"], label: ["Bourgogne rouge", "Spätburgunder", "Central Otago"] },
  { key: "gamay", name: "Gamay", color: "rott", p: P(4, 1, 1, 1, 4),
    smell: "Hallon, körsbär, banan och viol.",
    where: "Beaujolais (Morgon, Fleurie, Moulin-à-Vent)",
    about: "Saftig, lätt och lågt i tanniner. Gott lätt kylt. Välj en cru-by som Morgon eller Fleurie snarare än Nouveau.",
    food: "Charkuterier, kyckling, husmanskost, picknick, lätta grytor.",
    next: ["pinot-noir", "barbera"], label: ["Morgon", "Fleurie", "Beaujolais-Villages"] },
  { key: "nebbiolo", name: "Nebbiolo", color: "rott", p: P(5, 1, 5, 4, 3),
    smell: "Rosor, tjära, körsbär, lakrits och torkade örter.",
    where: "Piemonte (Barolo, Barbaresco, Langhe)",
    about: "Ljus i färgen men kraftfull: hög syra och mycket strama tanniner. Kräver mat, och gärna några års lagring.",
    food: "Tryffel, svamprisotto, långkok, vilt, lagrad ost.",
    next: ["sangiovese", "pinot-noir"], label: ["Barolo", "Barbaresco", "Langhe Nebbiolo"] },
  { key: "sangiovese", name: "Sangiovese", color: "rott", p: P(5, 1, 3, 3, 3),
    smell: "Körsbär, tomat, örter, läder.",
    where: "Toscana (Chianti, Brunello di Montalcino, Vino Nobile)",
    about: "Italiens matvin. Hög syra och mellanstora tanniner gör den perfekt till tomat.",
    food: "Pasta med tomatsås, pizza, grillat, lasagne, bistecca.",
    next: ["nebbiolo", "tempranillo", "barbera"], label: ["Chianti Classico", "Brunello di Montalcino"] },
  { key: "barbera", name: "Barbera", color: "rott", p: P(5, 1, 2, 3, 4),
    smell: "Mörka körsbär, plommon, örter.",
    where: "Piemonte (Barbera d'Asti, Barbera d'Alba)",
    about: "Hög syra men mjuka tanniner. Saftig och lätt att tycka om.",
    food: "Pizza, pasta, charkuterier, svamp, vardagsmat.",
    next: ["sangiovese", "gamay"], label: ["Barbera d'Asti", "Barbera d'Alba"] },
  { key: "tempranillo", name: "Tempranillo", color: "rott", p: P(3, 1, 3, 3, 3),
    smell: "Körsbär, plommon, tobak, läder. Med ek vanilj och kokos.",
    where: "Spanien (Rioja, Ribera del Duero)",
    about: "Spaniens stora druva. Etiketten berättar ekåldern: Crianza, Reserva och Gran Reserva lagras allt längre.",
    food: "Lamm, grillat, chorizo, manchego, tapas.",
    next: ["sangiovese", "grenache"], label: ["Rioja", "Ribera del Duero"] },
  { key: "grenache", name: "Grenache och garnacha", color: "rott", p: P(2, 1, 2, 4, 5),
    smell: "Jordgubbe, hallon, vitpeppar, örter från Provence.",
    where: "Södra Rhône (Châteauneuf-du-Pape, Côtes du Rhône), Spanien, Sardinien",
    about: "Mjuk, kryddig och generös med hög alkohol. Ofta i blandningar med syrah.",
    food: "Grillat, lamm, provensalska grytor, korv.",
    next: ["syrah", "tempranillo"], label: ["Côtes du Rhône", "Châteauneuf-du-Pape", "Priorat"] },
  { key: "syrah", name: "Syrah och shiraz", color: "rott", p: P(3, 1, 4, 4, 4),
    smell: "Björnbär, svartpeppar, rök, oliv. Australisk shiraz mer mogen och söt frukt.",
    where: "Norra Rhône (Hermitage, Crozes-Hermitage), Australien (Barossa)",
    about: "Kraftfull och kryddig. Fransk syrah är pepprig och stram, australisk shiraz fruktig och fyllig.",
    food: "Grillat kött, BBQ, vilt, lamm med örter.",
    next: ["grenache", "malbec", "cabernet"], label: ["Crozes-Hermitage", "Barossa Shiraz"] },
  { key: "cabernet", name: "Cabernet sauvignon", color: "rott", p: P(3, 1, 5, 5, 4),
    smell: "Svarta vinbär, cederträ, mynta, grön paprika.",
    where: "Bordeaux (vänstra stranden), Kalifornien (Napa), Chile, Australien",
    about: "Kungen av röda druvor: stram, fyllig och lagringsbar. Tanniner som kräver protein och fett.",
    food: "Entrecôte, lamm, grillat rött kött, lagrad hårdost.",
    next: ["merlot", "syrah", "malbec"], label: ["Bordeaux (Médoc, Pauillac)", "Napa Valley"] },
  { key: "merlot", name: "Merlot", color: "rott", p: P(3, 1, 3, 4, 4),
    smell: "Plommon, körsbär, choklad.",
    where: "Bordeaux (högra stranden, Saint-Émilion, Pomerol), Italien, Chile",
    about: "Mjukare och rundare än cabernet. En lättillgänglig röd.",
    food: "Kalv, fläskstek, pasta med köttfärssås, svamp.",
    next: ["cabernet", "malbec"], label: ["Saint-Émilion", "Pomerol"] },
  { key: "malbec", name: "Malbec", color: "rott", p: P(3, 1, 4, 4, 5),
    smell: "Björnbär, plommon, viol, kakao.",
    where: "Argentina (Mendoza), Frankrike (Cahors)",
    about: "Mörk, fruktig och mjukt fyllig. Argentinas grillvin.",
    food: "Grillad biff, asado, hamburgare, empanadas.",
    next: ["syrah", "cabernet", "zinfandel"], label: ["Mendoza", "Cahors"] },
  { key: "zinfandel", name: "Zinfandel och primitivo", color: "rott", p: P(2, 2, 3, 5, 5),
    smell: "Björnbärssylt, russin, peppar, kanel.",
    where: "Kalifornien (Zinfandel), Puglia (Primitivo)",
    about: "Mycket mogen frukt och hög alkohol, ibland med en antydan till sötma.",
    food: "BBQ, revben, pizza, kryddig mat med sötma.",
    next: ["malbec", "grenache"], label: ["Primitivo di Manduria", "Lodi Zinfandel"] },

  // Andra
  { key: "champagne", name: "Champagne och mousserande", color: "mousserande", p: P(5, 1, 0, 2, 3),
    smell: "Citrus, grönt äpple, brioche och rostat bröd.",
    where: "Champagne, Crémant (Frankrike), Cava (Spanien), Franciacorta, Prosecco",
    about: "Champagne, crémant och cava jäser i flaskan och får brödiga toner. Prosecco jäser i tank och är fruktigare och enklare. Brut betyder torr.",
    food: "Aperitif, ostron, friterat, chips, sushi, ägg. Bubblor och salt är magiskt.",
    next: ["chardonnay", "riesling"], label: ["Champagne Brut", "Crémant de Bourgogne", "Cava"] },
  { key: "rose", name: "Rosé", color: "rosé", p: P(4, 1, 1, 2, 3),
    smell: "Jordgubbar, hallon, melon, citrus.",
    where: "Provence, Tavel, Spanien (rosado)",
    about: "Görs av röda druvor med kort skalkontakt. Provencerosé är ljus, torr och frisk.",
    food: "Sommarmat, sallader, grillad fisk, medelhavsmat, bouillabaisse.",
    next: ["pinot-noir", "gamay"], label: ["Côtes de Provence", "Tavel"] },
  { key: "sott", name: "Söta och starka viner", color: "sött", p: P(4, 5, 1, 5, 5),
    smell: "Honung, aprikos, saffran (Sauternes). Russin, plommon och choklad (portvin).",
    where: "Sauternes, Tokaji, Mosel (Auslese), Porto, Jerez",
    about: "Ett dessertvin ska vara sötare än desserten. Ädelröta gör Sauternes och Tokaji honungssöta men friska.",
    food: "Sauternes till blåmögelost och foie gras. Portvin till choklad och Stilton. Tokaji till fruktdesserter.",
    next: ["riesling", "chenin"], label: ["Sauternes", "Tokaji Aszú", "Late Bottled Vintage Port"] },
];

export const grapeByKey = (k) => GRAPES.find((g) => g.key === k) || null;

// Hitta druvan i ett namn eller en stil, även via kända områden.
const AREA = [
  [/sancerre|pouilly-fum|marlborough|sauvignon/, "sauvignon-blanc"], [/chablis|meursault|puligny|chardonnay|bourgogne blanc|blanc de blancs/, "chardonnay"],
  [/riesling|mosel|rheingau|clare valley/, "riesling"], [/chenin|vouvray|savenni/, "chenin"], [/grüner|gruner|veltliner|wachau|kamptal/, "gruner"],
  [/albari|alvarinho|rías baixas|rias baixas|vinho verde/, "albarino"], [/pinot gri/, "pinot-gris"], [/gewürz|gewurz/, "gewurz"], [/viognier|condrieu/, "viognier"],
  [/pinot noir|spätburgunder|bourgogne rouge|bourgogne(?! blanc)|gevrey|volnay|pommard|central otago/, "pinot-noir"],
  [/gamay|beaujolais|morgon|fleurie|moulin/, "gamay"], [/nebbiolo|barolo|barbaresco|langhe/, "nebbiolo"],
  [/sangiovese|chianti|brunello|montalcino|vino nobile|montepulciano d/, "sangiovese"], [/barbera/, "barbera"],
  [/tempranillo|rioja|ribera/, "tempranillo"], [/grenache|garnacha|châteauneuf|chateauneuf|côtes du rhône|cotes du rhone|priorat|gigondas/, "grenache"],
  [/syrah|shiraz|hermitage|crozes|cornas|côte-rôtie/, "syrah"], [/cabernet|médoc|medoc|pauillac|margaux|napa/, "cabernet"],
  [/merlot|saint-émilion|st-émilion|pomerol/, "merlot"], [/malbec|cahors|mendoza/, "malbec"], [/zinfandel|primitivo/, "zinfandel"],
  [/champagne|crémant|cremant|cava|prosecco|franciacorta|mousserande|brut|sekt/, "champagne"],
  [/rosé|rose\b|rosado|provence|tavel/, "rose"], [/sauternes|tokaj|portvin|port\b|porto|sherry|jerez|madeira|auslese|dessertvin/, "sott"],
];
export function grapeFor(text) {
  const t = String(text || "").toLowerCase();
  for (const [re, k] of AREA) if (re.test(t)) return grapeByKey(k);
  return null;
}

// Lektionerna. Byggs på varandra; varje lektion har en övning vid middagsbordet och tre kontrollfrågor.
export const LESSONS = [
  { key: "prova", n: 1, title: "Så provar man vin", short: "Titta, lukta, smaka, fundera. Fyra steg som gör att ni minns vad ni druckit.",
    body: [
      { h: "Titta", t: "Håll glaset mot något vitt. Vita viner går från blekt gröngult (ungt, svalt klimat) till guld (ek, ålder, värme). Röda från lila (ungt) till tegelbrunt (moget). Färgen ger ledtrådar, inget mer." },
      { h: "Lukta", t: "Snurra glaset så att vinet tar luft, och lukta i två korta drag. Det mesta av det vi kallar smak är egentligen doft. Säg det första ni kommer att tänka på: citrus, bär, smör, jord. Det finns inga fel svar." },
      { h: "Smaka", t: "Ta en lagom klunk och låt den gå runt i hela munnen. Känn efter de fem grundsakerna: syra, sötma, tanniner, fyllighet och frukt. Svälj och räkna hur länge smaken sitter kvar, eftersmaken." },
      { h: "Fundera", t: "Gillade ni det? Vad var det ni gillade? Och hur fungerade det med maten? Skriv ner det i provningsloggen. Själva antecknandet är det som tränar smakminnet." },
    ],
    exercise: "Nästa gång ni öppnar en flaska till middagen: gå igenom de fyra stegen tillsammans och logga vinet, med betyg både för vinet och för hur det passade till maten.",
    quiz: [
      { q: "Varför snurrar man vinet i glaset?", a: ["Så att det får luft och doften frigörs", "För att kyla det", "För att se om det är korkat"], c: 0 },
      { q: "Vilket sinne står för det mesta av det vi kallar smak?", a: ["Smaklökarna", "Luktsinnet", "Synen"], c: 1 },
      { q: "Vad är det som tränar smakminnet bäst?", a: ["Att dricka dyrt vin", "Att anteckna vad man känner", "Att dricka snabbt"], c: 1 },
    ] },
  { key: "fem", n: 2, title: "Fem saker som avgör ett vin", short: "Syra, sötma, tanniner, fyllighet och frukt. Kan ni dem kan ni beskriva vilket vin som helst.",
    dims: true,
    body: [
      { h: "Därför spelar det roll", t: "När ni vet att ni gillar till exempel hög syra och lätt fyllighet kan ni hitta nya viner ni kommer att tycka om, och förklara för personalen på Systembolaget vad ni vill ha." },
      { h: "Jämför hellre än bedömer", t: "Det är mycket lättare att känna skillnaden mellan två viner än att bedöma ett ensamt. Öppna gärna två flaskor samtidigt och jämför." },
    ],
    exercise: "Köp en Riesling från Mosel och en Chardonnay från Kalifornien eller Australien. Prova dem bredvid varandra. Vilket har mest syra? Vilket är fylligast? Logga båda.",
    quiz: [
      { q: "Var känns tanniner mest?", a: ["På tungspetsen", "På tandköttet och läpparnas insida", "I näsan"], c: 1 },
      { q: "Ett vin doftar moget och sött men känns inte sött i munnen. Vad är det?", a: ["Fruktigt men torrt", "Ett sött vin", "Ett felaktigt vin"], c: 0 },
      { q: "Vad ger mest fyllighet?", a: ["Syra", "Alkohol", "Kolsyra"], c: 1 },
    ] },
  { key: "vita", n: 3, title: "Sex vita druvor att kunna", short: "Riesling, Sauvignon blanc, Chardonnay, Chenin blanc, Grüner Veltliner och Albariño.",
    grapes: ["riesling", "sauvignon-blanc", "chardonnay", "chenin", "gruner", "albarino"],
    body: [
      { h: "Börja här", t: "De här sex täcker det mesta av vitt vin. Sauvignon blanc och Riesling är lättast att känna igen: krusbär och gräs respektive citrus och hög syra." },
      { h: "Ek eller inte", t: "Chardonnay lär er vad ek gör: Chablis är utan, och de flesta kaliforniska är med. Vanilj, smör och rostat betyder ek." },
    ],
    exercise: "Välj en vit druva ni inte provat och laga en rätt den passar till enligt druvkortet. Logga och se hur er bedömning stämmer med druvans profil.",
    quiz: [
      { q: "Sancerre görs på …", a: ["Chardonnay", "Sauvignon blanc", "Riesling"], c: 1 },
      { q: "Chablis är …", a: ["Oekad Chardonnay", "Söt Riesling", "Rosé"], c: 0 },
      { q: "Vilken vit druva räddar het thai och indiskt, gärna halvtorr?", a: ["Chardonnay", "Riesling", "Albariño"], c: 1 },
    ] },
  { key: "roda", n: 4, title: "Sex röda druvor att kunna", short: "Pinot noir, Gamay, Sangiovese, Tempranillo, Syrah och Cabernet sauvignon.",
    grapes: ["pinot-noir", "gamay", "sangiovese", "tempranillo", "syrah", "cabernet"],
    body: [
      { h: "Från lätt till kraftigt", t: "Ordningen ovan går ungefär från lätt till fylligt. Gamay och Pinot noir är lätta med låga tanniner, Syrah och Cabernet kraftiga och strama." },
      { h: "Gamla och nya världen", t: "Samma druva smakar olika i svalt och varmt klimat. Fransk syrah är pepprig och stram, australisk shiraz mogen och söt i frukten." },
    ],
    exercise: "Laga en tomatbaserad pasta och prova en Chianti (Sangiovese) mot en Rioja (Tempranillo). Vilken fungerade bäst med tomaten, och varför?",
    quiz: [
      { q: "Vilken röd druva är lättast och har lägst tanniner?", a: ["Cabernet sauvignon", "Gamay", "Syrah"], c: 1 },
      { q: "Chianti görs på …", a: ["Sangiovese", "Nebbiolo", "Merlot"], c: 0 },
      { q: "Vilket rött vin fungerar oftast till lax?", a: ["Pinot noir", "Cabernet sauvignon", "Malbec"], c: 0 },
    ] },
  { key: "mat", n: 5, title: "Vin och mat", short: "Sex regler som gör att det nästan alltid blir bra.",
    rules: [
      { t: "Matcha intensiteten", d: "Lätt mat, lätt vin. Kraftig mat, kraftigt vin. Det är den viktigaste regeln." },
      { t: "Syra möter syra och fett", d: "Vinet ska ha minst lika mycket syra som maten. Syra skär också genom fett och grädde." },
      { t: "Tanniner behöver protein och fett", d: "Strama röda viner mjuknar av rött kött och ost, men blir metalliska till fisk och beska till grönsaker." },
      { t: "Sött till sött, och sötare", d: "Vinet ska vara sötare än desserten, annars blir det surt och tunt." },
      { t: "Hetta och alkohol krockar", d: "Chili gör alkohol och tanniner brännande. Välj lägre alkohol och en aning sötma, som halvtorr Riesling." },
      { t: "Det som växer ihop passar ihop", d: "Chianti till toskansk mat, Rioja till lamm, Sancerre till getost från Loire. Regionalt fungerar nästan alltid." },
    ],
    body: [
      { h: "Två vägar", t: "Precis som med öl kan ni harmoniera (samma smaker i vin och mat) eller kontrastera (syra mot fett, sötma mot salt). Sauternes och blåmögelost är en klassisk kontrast." },
    ],
    exercise: "Välj ett recept ur lådan, läs dryckesförslaget och fundera på vilken regel det bygger på. Prova och betygsätt hur väl det passade.",
    quiz: [
      { q: "Ni lagar het thailändsk curry. Vad är säkrast?", a: ["Kraftig Cabernet", "Halvtorr Riesling", "Amarone"], c: 1 },
      { q: "Varför blir strama röda viner bättre till entrecôte?", a: ["Protein och fett mjukar upp tanninerna", "Köttet är sött", "Vinet blir kallare"], c: 0 },
      { q: "Till desserten ska vinet vara …", a: ["Torrare än desserten", "Sötare än desserten", "Rött"], c: 1 },
    ] },
  { key: "etiketter", n: 6, title: "Läsa etiketten", short: "I Europa står platsen, inte druvan. Så här vet ni vad som finns i flaskan.",
    table: [
      ["Chablis", "Chardonnay, oekad"], ["Bourgogne rouge", "Pinot noir"], ["Sancerre", "Sauvignon blanc"], ["Vouvray", "Chenin blanc"],
      ["Beaujolais", "Gamay"], ["Côtes du Rhône", "Grenache och Syrah"], ["Bordeaux, vänstra stranden", "Mest Cabernet sauvignon"], ["Bordeaux, högra stranden", "Mest Merlot"],
      ["Chianti", "Sangiovese"], ["Barolo och Barbaresco", "Nebbiolo"], ["Rioja", "Tempranillo"], ["Champagne", "Chardonnay, Pinot noir, Pinot meunier"],
    ],
    body: [
      { h: "Gamla och nya världen", t: "Europa sätter platsen på etiketten, Nya världen (USA, Australien, Chile, Nya Zeeland, Sydafrika) skriver druvan. Därför är europeiska etiketter svårare i början." },
      { h: "Ord som är bra att kunna", t: "Brut och sec: torrt mousserande. Trocken: torr (tyska). Crianza, Reserva, Gran Reserva: allt längre ekfat (Spanien). Classico: kärnområdet (Italien). Cru: utvald vingård (Frankrike)." },
    ],
    exercise: "Nästa gång ni handlar: välj ett europeiskt vin och lista ut druvan med hjälp av tabellen innan ni läser baksidan.",
    quiz: [
      { q: "Vilken druva är en Rioja?", a: ["Tempranillo", "Grenache", "Merlot"], c: 0 },
      { q: "Bourgogne rouge görs på …", a: ["Gamay", "Pinot noir", "Syrah"], c: 1 },
      { q: "Trocken på en tysk etikett betyder …", a: ["Torr", "Söt", "Lagrad"], c: 0 },
    ] },
];

export const lessonByKey = (k) => LESSONS.find((l) => l.key === k) || null;

// Smakprofil av det ni gillat: medelvärde av bedömningarna för viner med betyg 4–5.
export function tasteProfile(notes) {
  const liked = notes.filter((n) => (n.rating || 0) >= 4 && n.dims);
  if (!liked.length) return null;
  const avg = {};
  for (const d of DIMS) {
    const v = liked.map((n) => n.dims?.[d.key]).filter((x) => x > 0);
    if (v.length) avg[d.key] = Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
  }
  const grapes = {};
  for (const n of notes) {
    const g = n.grape ? grapeByKey(n.grape) : grapeFor(`${n.wine} ${n.style}`);
    if (!g) continue;
    const x = (grapes[g.key] ||= { g, n: 0, sum: 0 });
    x.n++; x.sum += n.rating || 0;
  }
  const ranked = Object.values(grapes).map((x) => ({ ...x, avg: x.sum / x.n })).sort((a, b) => b.avg - a.avg || b.n - a.n);
  // Druvor som liknar profilen men inte provats
  const tried = new Set(ranked.map((x) => x.g.key));
  const dist = (g) => DIMS.reduce((s, d) => s + (avg[d.key] ? Math.abs((g.p[d.key] || 0) - avg[d.key]) : 0), 0);
  const suggest = GRAPES.filter((g) => !tried.has(g.key)).sort((a, b) => dist(a) - dist(b)).slice(0, 3);
  return { avg, liked: liked.length, ranked, suggest };
}
