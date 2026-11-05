// Pelles pizzameny. Läggs in en gång i hushållet "hem" av scripts/migrate.mjs. Inga "@/"-importer här.
// Alla mängder är per pizza. Degen kommer från Pizzadeg och räknas inte här.

const SAUCE = { name: "tomatsås", q: 3.5, unit: "msk", note: "se receptet Tomatsås till pizza", shop: false };
const RED = [SAUCE, { name: "mozzarella", q: 50, unit: "g", note: "riven eller i bitar" }, { name: "parmesan", q: 1, unit: "msk", note: "riven" }];
const WHITE = [{ name: "ricotta", q: 40, unit: "g" }, { name: "mozzarella", q: 50, unit: "g", note: "riven eller i bitar" }, { name: "parmesan", q: 1, unit: "msk", note: "riven" }];
const OIL = { name: "olivolja", q: 1, unit: "tsk", pantry: true };

const steps = (red, after) => [
  { title: "Förbered", items: ["Gör degen i Pizzadeg och låt degbollarna vila enligt receptet.", red ? "Gör tomatsåsen, se receptet Tomatsås till pizza." : "Rör ricottan slät med en nypa salt.", "Värm ugnen med stålet till 300 grader, eller pizzaugnen till 400–450 grader."] },
  { title: "Toppa", items: ["Tryck och dra ut degbollen till en rund botten med rikligt med durumvetemjöl. Låt kanten vara kvar.", red ? "Bred ut 3–4 msk tomatsås med baksidan av en sked, inte ända ut till kanten." : "Klicka ut ricottan över botten.", "Lägg på mozzarella och det som ska in i ugnen, och riv över parmesan."] },
  { title: "Grädda", items: [{ label: "Ugn med stål", t: "Grädda cirka 4 minuter.", timer: 240 }, { label: "Pizzaugn", t: "Eller 1–1,5 minut i pizzaugnen, och vrid pizzan efter halva tiden.", timer: 75 }] },
  ...(after ? [{ title: "Efter ugnen", items: [after, "Ringla över lite olivolja och servera direkt."] }] : []),
];

const P = (no, title, short, base, red, top, afterList, afterText) => ({
  pizzaNo: no, title, short, lede: short, kitchen: "Italienskt", type: "Huvudrätt", base, minutes: 20, servings: 1, servingsUnit: "pizzor",
  accent: red ? "ember" : "dijon", difficulty: "medel", tags: ["Pizza"], dishes: ["pizza"], holidays: [], pairsWith: [], source: { name: "Pelles pizzameny" },
  groups: [
    { name: red ? "Botten" : "Botten, bianca", items: red ? RED : WHITE },
    ...(top.length ? [{ name: "Topping", items: top }] : []),
    ...(afterList.length ? [{ name: "Efter ugnen", items: [...afterList, OIL] }] : []),
  ],
  steps: steps(red, afterText),
});

export const PIZZA_MENU = [
  P(1, "Gamberi", "Räkor, vitlöksdressing och ruccola.", "Fisk", true, [],
    [{ name: "räkor", q: 75, unit: "g", note: "skalade" }, { name: "vitlöksdressing", q: 1, unit: "msk" }, { name: "ruccola", q: 1, unit: "näve" }],
    "Lägg på räkorna, ringla över vitlöksdressingen och toppa med ruccola."),
  P(2, "Crudo", "Prosciutto crudo och färsk basilika.", "Fläsk", true, [],
    [{ name: "prosciutto crudo", q: 40, unit: "g" }, { name: "basilika", q: 5, unit: "blad" }],
    "Lägg skivorna av crudo löst över pizzan och strö över basilikan."),
  P(3, "Affumicata", "Vedrökt karré, picklad rödlök och ruccola.", "Fläsk", true,
    [{ name: "vedrökt karré", q: 50, unit: "g", note: "tunt skivad" }],
    [{ name: "picklad rödlök", q: 2, unit: "msk" }, { name: "ruccola", q: 1, unit: "näve" }],
    "Toppa med picklad rödlök och ruccola."),
  P(4, "Mother", "Strimlad salami Ventricina och ruccola. Döpt efter pizzerian Mother i Köpenhamn där vi åt den.", "Fläsk", true,
    [{ name: "salami Ventricina", q: 40, unit: "g", note: "strimlad" }],
    [{ name: "ruccola", q: 1, unit: "näve" }],
    "Toppa med ruccola."),
  P(5, "Caesar", "Parmaskinka, strimlad romansallad och caesardressing. Efter en pizza vi åt i London.", "Fläsk", true, [],
    [{ name: "parmaskinka", q: 40, unit: "g" }, { name: "romansallad", q: 1, unit: "dl", note: "strimlad" }, { name: "caesardressing", q: 1.5, unit: "msk" }],
    "Lägg på parmaskinkan, toppa med romansallad och ringla över caesardressingen."),
  P(6, "Prosciutto e rucola", "Prosciutto och ruccola.", "Fläsk", true, [],
    [{ name: "prosciutto", q: 40, unit: "g" }, { name: "ruccola", q: 1, unit: "näve" }],
    "Lägg prosciutton löst över pizzan och toppa med ruccola."),
  P(7, "Bianca patate", "Vit pizza med ricotta, mozzarella och parmesan, tunna skivor potatis och rosmarin.", "Vegetariskt", false,
    [{ name: "potatis", q: 1, unit: "liten", note: "mandoliniskivad, papperstunn" }, { name: "rosmarin", q: 1, unit: "kvist", note: "plockade blad" }, { name: "flingsalt", q: 1, unit: "nypa", pantry: true }],
    [], null),
  P(8, "Bianca spinaci", "Vit pizza med ricotta, mozzarella och parmesan, spenat, vitlök och chiliolja.", "Vegetariskt", false,
    [{ name: "färsk spenat", q: 40, unit: "g" }, { name: "vitlök", q: 1, unit: "klyfta", note: "tunt skivad" }],
    [{ name: "chiliolja", q: 1, unit: "tsk" }],
    "Ringla över chiliolja."),
  P(9, "Valtellina", "Bresaola, hyvlad parmesan, rostade pinjenötter, citron och ruccola. Bresaola är lufttorkat nötkött från Valtellina i Lombardiet.", "Nötkött", true, [],
    [{ name: "bresaola", q: 40, unit: "g" }, { name: "parmesan", q: 10, unit: "g", note: "hyvlad" }, { name: "pinjenötter", q: 1, unit: "msk", note: "rostade" }, { name: "citron", q: 0.25, unit: "st", note: "saften" }, { name: "ruccola", q: 1, unit: "näve" }],
    "Rosta pinjenötterna i torr panna medan pizzan gräddas. Lägg på bresaolan, toppa med ruccola, hyvla över parmesan, strö över pinjenötterna och pressa över citron."),
];

export const TOMATO_SAUCE = {
  title: "Tomatsås till pizza", short: "Enkel råmixad tomatsås. Räcker till cirka 4 pizzor.", lede: "Enkel råmixad tomatsås till pizza. 3–4 msk per pizza.",
  kitchen: "Italienskt", type: "Tillbehör och bröd", base: "Vegetariskt", minutes: 5, servings: 4, servingsUnit: "pizzor",
  accent: "ember", difficulty: "enkel", tags: ["Pizza"], dishes: ["tillbehor"], holidays: [], pairsWith: [], source: { name: "Pelles pizzameny" },
  groups: [{ name: "Såsen", items: [
    { name: "körsbärstomater eller hela San Marzano-tomater", q: 1, unit: "burk", note: "400 g" },
    { name: "basilika", q: 4, q2: 5, unit: "blad" },
    { name: "flingsalt", q: 1, unit: "nypa", pantry: true },
    { name: "olivolja", q: 1, unit: "skvätt", pantry: true },
  ] }],
  steps: [{ title: "Mixa", items: ["Häll tomaterna i en bunke och lägg i basilika, flingsalt och olivolja.", "Mixa grovt med stavmixer. Den ska ha lite struktur kvar.", "Använd cirka 3–4 msk på varje pizza."] }],
};
