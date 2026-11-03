// Kompletterar druvkorten så att vin och öl får samma upplägg: ost, dessert, karta och släktträd,
// samt fördjupningslektioner.
import { GRAPES } from "@/data/wine";

// Fruktig (1) till jordig och kryddig (5), för den andra kartan.
const EARTH = { riesling: 2, "sauvignon-blanc": 2, chardonnay: 3, chenin: 3, gruner: 3, albarino: 2, "pinot-gris": 2, gewurz: 1, viognier: 1,
  "pinot-noir": 4, gamay: 2, nebbiolo: 5, sangiovese: 4, barbera: 3, tempranillo: 4, grenache: 3, syrah: 4, cabernet: 4, merlot: 3, malbec: 2, zinfandel: 1,
  champagne: 3, rose: 1, sott: 2 };

const EXTRA = {
  riesling: { cheese: "Färskost, Münster, getost", dessert: "Halvsöt eller söt Riesling till äppelkaka och fruktdesserter" },
  "sauvignon-blanc": { cheese: "Chèvre och annan färsk getost, Sancerre och getost är en klassiker", dessert: "" },
  chardonnay: { cheese: "Oekad: Comté, Brie. Ekad: lagrad Gouda, Gruyère", dessert: "" },
  chenin: { cheese: "Getost, Comté", dessert: "Söt Vouvray eller Coteaux du Layon till tarte tatin" },
  gruner: { cheese: "Mild hårdost, Emmentaler", dessert: "" },
  albarino: { cheese: "Färsk getost, ung manchego", dessert: "" },
  "pinot-gris": { cheese: "Mild kittost, Port Salut", dessert: "Alsace Pinot gris med sötma till fruktdesserter" },
  gewurz: { cheese: "Münster, kraftig kittost", dessert: "Söt Gewürztraminer till litchi, mango och kryddiga kakor" },
  viognier: { cheese: "Krämig vitmögelost, Brie", dessert: "" },
  "pinot-noir": { cheese: "Brie, Camembert, Comté", dessert: "" },
  gamay: { cheese: "Mild hårdost, Saint-Nectaire", dessert: "" },
  nebbiolo: { cheese: "Parmesan, lagrad pecorino, Castelmagno", dessert: "" },
  sangiovese: { cheese: "Pecorino, Parmesan", dessert: "Vin santo till cantuccini" },
  barbera: { cheese: "Mellanlagrad hårdost, lagrad cheddar", dessert: "" },
  tempranillo: { cheese: "Manchego, Idiazábal", dessert: "" },
  grenache: { cheese: "Lagrad hårdost, tomme", dessert: "" },
  syrah: { cheese: "Lagrad cheddar, rökt ost", dessert: "" },
  cabernet: { cheese: "Lagrad cheddar, Gruyère, Västerbotten", dessert: "Mörk choklad i små mängder" },
  merlot: { cheese: "Mellanlagrad Gouda, Brie", dessert: "" },
  malbec: { cheese: "Lagrad Gouda, manchego", dessert: "" },
  zinfandel: { cheese: "Lagrad cheddar, blåmögel", dessert: "Chokladkaka och brownies" },
  champagne: { cheese: "Brie, Chaource, parmesan", dessert: "Demi-sec till fruktdesserter, aldrig brut till sött" },
  rose: { cheese: "Färsk getost, feta", dessert: "Jordgubbar" },
  sott: { cheese: "Sauternes till Roquefort, portvin till Stilton", dessert: "Crème brûlée, tarte tatin, choklad (portvin)" },
};

export const grapeExtra = (k) => ({ earth: EARTH[k] || 3, ...(EXTRA[k] || {}) });

// Två kartor: lätt–fyllig mot frisk–rund, och fruktig–jordig mot lätt–fyllig.
// Små förskjutningar så att druvor med samma värden inte hamnar på varandra.
const JIT = Object.fromEntries(GRAPES.map((g, i) => [g.key, [((i * 37) % 9 - 4) / 70, ((i * 53) % 7 - 3) / 70]]));
export function wineMapPos(g, mode) {
  const [jx, jy] = JIT[g.key] || [0, 0];
  const n = (v) => (v - 1) / 4;
  if (mode === "jord") return { x: Math.min(.98, Math.max(.02, n(EARTH[g.key] || 3) + jx)), y: Math.min(.98, Math.max(.02, 1 - n(g.p.fyllighet) + jy)) };
  return { x: Math.min(.98, Math.max(.02, n(g.p.fyllighet) + jx)), y: Math.min(.98, Math.max(.02, 1 - n(g.p.syra) + jy)) };
}
export const WINE_MAPS = {
  stil: { name: "Lätt–fyllig och frisk–rund", top: "Frisk", bottom: "Rund", left: "Lätt", right: "Fyllig", hint: "Vänster lätt, höger fylligt. Uppåt hög syra och friskt, nedåt mjukt och runt. Det som avgör mest till mat." },
  jord: { name: "Fruktig–jordig och lätt–fyllig", top: "Fyllig", bottom: "Lätt", left: "Fruktig", right: "Jordig", hint: "Vänster fruktigt och generöst, ofta Nya världen. Höger jordigt, kryddigt och örtigt, ofta Gamla världen. Uppåt fylligt." },
};

// Vinets släktträd: färg, stil, druvor och områden att leta efter.
const N = (n, k, ex = [], c = []) => ({ n, k, ex, c });
export const WINE_TREE = [
  { n: "Vitt", tone: "vitt", c: [
    N("Friska och gröna", null, [], [N("Sauvignon blanc", "sauvignon-blanc", ["Sancerre", "Marlborough"]), N("Grüner Veltliner", "gruner", ["Wachau"]), N("Albariño", "albarino", ["Rías Baixas"])]),
    N("Aromatiska", null, [], [N("Riesling", "riesling", ["Mosel", "Alsace"]), N("Gewürztraminer", "gewurz", ["Alsace"]), N("Viognier", "viognier", ["Condrieu"])]),
    N("Fylliga och runda", null, [], [N("Chardonnay", "chardonnay", ["Chablis, oekad", "Meursault, ekad"]), N("Chenin blanc", "chenin", ["Vouvray"]), N("Pinot gris", "pinot-gris", ["Alsace"])]),
  ] },
  { n: "Rött", tone: "rott", c: [
    N("Lätta och saftiga", null, [], [N("Pinot noir", "pinot-noir", ["Bourgogne", "Spätburgunder"]), N("Gamay", "gamay", ["Morgon", "Fleurie"])]),
    N("Medelfylliga och friska", null, [], [N("Sangiovese", "sangiovese", ["Chianti", "Brunello"]), N("Barbera", "barbera", ["Barbera d'Asti"]), N("Tempranillo", "tempranillo", ["Rioja", "Ribera del Duero"]), N("Merlot", "merlot", ["Saint-Émilion"])]),
    N("Kryddiga och generösa", null, [], [N("Grenache", "grenache", ["Côtes du Rhône", "Châteauneuf-du-Pape"]), N("Syrah och shiraz", "syrah", ["Crozes-Hermitage", "Barossa"]), N("Zinfandel och primitivo", "zinfandel", ["Puglia", "Kalifornien"])]),
    N("Kraftiga och strama", null, [], [N("Cabernet sauvignon", "cabernet", ["Bordeaux", "Napa"]), N("Nebbiolo", "nebbiolo", ["Barolo", "Barbaresco"]), N("Malbec", "malbec", ["Mendoza", "Cahors"])]),
  ] },
  { n: "Rosé, bubbel och sött", tone: "ovrigt", c: [
    N("Rosé", "rose", ["Provence", "Tavel"]),
    N("Mousserande", "champagne", [], [N("Champagne", "champagne", ["Brut, flaskjäst"]), N("Crémant och cava", "champagne", ["Flaskjäst, prisvärt"]), N("Prosecco", "champagne", ["Tankjäst, fruktig"])]),
    N("Söta och starka", "sott", [], [N("Sauternes och Tokaji", "sott", ["Ädelröta"]), N("Portvin", "sott", ["Starkvin från Douro"]), N("Sherry", "sott", ["Från torr fino till söt Pedro Ximénez"])]),
  ] },
];

// Grundregler för vin och mat (samma som lektion 5, för fliken Till maten).
export const WINE_PRINCIPLES = {
  intro: "Vin har mer syra och ofta mer tanniner än öl, och därför spelar balansen mellan vin och mat stor roll. Matcha tyngden, låt syran möta syran och se upp med hetta.",
  strengths: ["Syran lyfter maten och fräschar upp gommen", "Tanniner mjuknar av protein och fett"],
  tips: [
    { t: "Matcha intensiteten", d: "Lätt mat, lätt vin. Kraftig mat, kraftigt vin. Den viktigaste regeln." },
    { t: "Syra möter syra och fett", d: "Vinet ska ha minst lika mycket syra som maten. Syra skär också genom grädde och smör." },
    { t: "Tanniner vill ha protein", d: "Strama röda viner mjuknar av kött och ost men blir metalliska till fisk." },
    { t: "Sötare vin än dessert", d: "Annars känns vinet surt och tunt." },
    { t: "Hetta och alkohol krockar", d: "Chili gör alkohol och tanniner brännande. Välj lite sötma och låg alkohol." },
    { t: "Det som växer ihop passar ihop", d: "Chianti till toskansk mat, Sancerre till getost från Loire." },
  ],
  ways: [
    { t: "Harmoniera", d: "Samma smaker i vin och mat: smörig Chardonnay till hummer i smörsås, jordig Pinot noir till svamp." },
    { t: "Kontrastera", d: "Motsatser som balanserar: syrlig Sauvignon blanc mot fet getost, söt Sauternes mot salt Roquefort." },
  ],
};

// Gemensam sida för ost och dessert: öl och vin bredvid varandra.
// own: något ni själva har kommit fram till. Visas som "Er favorit".
export const CHEESE_BOTH = [
  { cheese: "Fransk bondost med päronmarmelad", wine: "Chenin blanc från Loire", wineKey: "chenin", beers: ["saison"], own: true, why: "Ert bästa par: saisonens kryddiga torrhet och kolsyra mot den milda, smöriga osten, och päronet lyfter ölets frukt." },
  { cheese: "Gruyère eller Manchego med fikonmarmelad", wine: "Tempranillo eller amontillado", wineKey: "tempranillo", beers: ["saison"], own: true, why: "Nötig, lagrad ost och söt fikon. Saisonen håller det friskt, fikonet binder ihop." },
  { cheese: "Gruyère och Comté", wine: "Chardonnay, gärna Jura", wineKey: "chardonnay", beers: ["imperial-stout", "dubbelbock"], own: true, why: "Nötighet och kristaller mot rostad kraft i en imperial stout, eller kola i en dubbelbock." },
  { cheese: "Lagrad prästost", wine: "Lagrad Riesling", wineKey: "riesling", beers: ["golden-strong"], own: true, why: "Belgisk stark ljus ale som Duvel: torr, pepprig och mycket kolsyra mot sälta och fett." },
  { cheese: "Lagrad cheddar", wine: "Cabernet sauvignon", wineKey: "cabernet", beers: ["ipa"], why: "Skarp, nötig ost behöver kraft: tanniner eller humlebeska." },
  { cheese: "Färsk getost", wine: "Sauvignon blanc", wineKey: "sauvignon-blanc", beers: ["lambic"], why: "Syra och örtighet mot syrlig, färsk ost." },
  { cheese: "Brie och Camembert", wine: "Champagne eller Pinot noir", wineKey: "champagne", beers: ["flanders-red"], why: "Bubblor eller syra skär genom det krämiga." },
  { cheese: "Parmesan och pecorino", wine: "Sangiovese eller Nebbiolo", wineKey: "nebbiolo", beers: ["barley-wine"], why: "Umami och sälta mot syra eller sötma." },
  { cheese: "Blåmögel, Roquefort och Stilton", wine: "Sauternes eller portvin", wineKey: "sott", beers: ["barley-wine"], why: "Sött mot salt, en av de klassiska kontrasterna." },
  { cheese: "Kittost som Münster", wine: "Gewürztraminer", wineKey: "gewurz", beers: ["lambic"], why: "Kraftig doft mot aromatiskt vin eller syrlig gueuze." },
  { cheese: "Västerbotten", wine: "Lagrad Riesling eller Champagne", wineKey: "riesling", beers: ["baltisk-porter"], why: "Sälta och kristaller mot syra eller rostad sötma." },
];

export const DESSERT_BOTH = [
  { dessert: "Chokladfondant", wine: "Portvin eller Banyuls", wineKey: "sott", beers: ["imperial-stout", "kriek"] },
  { dessert: "Crème brûlée", wine: "Sauternes eller Tokaji", wineKey: "sott", beers: ["dipa", "barley-wine"] },
  { dessert: "Äppelkaka och tarte tatin", wine: "Söt Chenin blanc eller Riesling", wineKey: "chenin", beers: ["dubbelbock", "weizenbock"] },
  { dessert: "Jordgubbar och vaniljglass", wine: "Moscato d'Asti", wineKey: "champagne", beers: ["barley-wine", "imperial-stout"] },
  { dessert: "Citroncheesecake", wine: "Söt Riesling", wineKey: "riesling", beers: ["dipa", "barley-wine"] },
  { dessert: "Panna cotta", wine: "Moscato eller Tokaji", wineKey: "sott", beers: ["kriek"] },
];

// Fördjupning för vin.
export const WINE_ADV_LESSONS = [
  { key: "ek", n: 7, level: "fordjupning", title: "Ek och lagring", short: "Vad ekfat gör med vinet, och vilka viner som blir bättre med åren.",
    body: [
      { h: "Ek ger smak och struktur", t: "Nya ekfat ger vanilj, kokos, rostat och kryddor, och en rundare munkänsla. Gamla fat ger mest syre och mjukare tanniner. Amerikansk ek är mer vanilj och kokos, fransk mer diskret och kryddig." },
      { h: "Ekat eller inte", t: "Jämför en Chablis med en kalifornisk Chardonnay: samma druva, men den ena utan ek och den andra med. Den bästa skolan i vad ek gör." },
      { h: "Spanska etiketter", t: "Joven: ung, ingen eller lite ek. Crianza: minst två år varav ett i ek. Reserva: minst tre år. Gran Reserva: minst fem år." },
      { h: "Vilka lagras", t: "Viner med mycket syra, tanniner eller sötma: Barolo, Bordeaux, Riesling, Sauternes, Champagne. De flesta viner under 150 kronor är gjorda för att drickas inom ett par år." },
    ],
    exercise: "Köp en Chablis och en ekad kalifornisk Chardonnay. Prova bredvid varandra och logga. Vilken passar bäst till kyckling i gräddsås?",
    quiz: [
      { q: "Vanilj och kokos i doften kommer ofta från …", a: ["Amerikansk ek", "Druvan Riesling", "Kall jäsning"], c: 0 },
      { q: "Crianza betyder att vinet lagrats …", a: ["Minst två år, varav ett i ek", "Utan ek", "I tio år"], c: 0 },
      { q: "Vilket vin är byggt för lång lagring?", a: ["Barolo", "Beaujolais Nouveau", "Prosecco"], c: 0 },
    ] },
  { key: "varldar", n: 8, level: "fordjupning", title: "Gamla och Nya världen, klimat", short: "Samma druva smakar olika i svalt och varmt klimat. Det förklarar mycket.",
    body: [
      { h: "Svalt klimat", t: "Mer syra, lägre alkohol, friskare och mer diskret frukt: Mosel, Chablis, Loire, Bourgogne, Nya Zeelands sydö." },
      { h: "Varmt klimat", t: "Mognare och sötare frukt, mer alkohol, mindre syra: Barossa, Kalifornien, Mendoza, södra Italien." },
      { h: "Gamla världen", t: "Europa. Ofta mer jordigt, örtigt och syrligt, och etiketten anger platsen. Tradition och appellationsregler." },
      { h: "Nya världen", t: "USA, Australien, Chile, Argentina, Sydafrika, Nya Zeeland. Ofta fruktigare och fylligare, och etiketten anger druvan." },
    ],
    exercise: "Prova en fransk Syrah från Crozes-Hermitage och en australisk Shiraz. Samma druva, olika världar. Logga båda.",
    quiz: [
      { q: "Svalt klimat ger oftast …", a: ["Mer syra och lägre alkohol", "Mer alkohol och mognare frukt", "Mer tanniner"], c: 0 },
      { q: "Vilket område räknas som Nya världen?", a: ["Barossa", "Bourgogne", "Rioja"], c: 0 },
      { q: "På europeiska etiketter står oftast …", a: ["Platsen", "Druvan", "Alkoholen först"], c: 0 },
    ] },
  { key: "bubbel", n: 9, level: "fordjupning", title: "Bubbel och söta viner", short: "Hur bubblorna kommer in, och varför ett bra sött vin aldrig känns klibbigt.",
    body: [
      { h: "Traditionell metod", t: "Champagne, crémant och cava jäser en andra gång i flaskan och ligger på jästen. Det ger fina bubblor och toner av brioche och rostat bröd." },
      { h: "Tankmetoden", t: "Prosecco jäser andra gången i stor tank. Fruktigare, enklare och billigare, gjort för att drickas ungt." },
      { h: "Sötma på etiketten", t: "Brut nature och extra brut: knastertorrt. Brut: torrt. Extra dry: halvtorrt, trots namnet. Demi-sec: sött, till dessert." },
      { h: "Ädelröta", t: "Mögelsvampen Botrytis torkar in druvorna och koncentrerar socker och syra. Ger Sauternes och Tokaji, söta men friska viner med honung och aprikos." },
      { h: "Starkvin", t: "Portvin och sherry förstärks med druvsprit. Portvin är sött och fylligt, sherry finns från torr fino till söt Pedro Ximénez." },
    ],
    exercise: "Prova en crémant och en prosecco till förrätten. Känner ni skillnaden mellan brödigt och fruktigt?",
    quiz: [
      { q: "Vilket bubbel jäser andra gången i flaskan?", a: ["Crémant", "Prosecco", "Moscato"], c: 0 },
      { q: "Extra dry på en champagne betyder …", a: ["Halvtorrt", "Knastertorrt", "Sött"], c: 0 },
      { q: "Ädelröta ger …", a: ["Söta och friska viner", "Rosévin", "Mer tanniner"], c: 0 },
    ] },
];
