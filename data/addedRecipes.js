// Recept som Claude har lagt in åt hushållet "hem" på begäran. Läggs in en gång var av scripts/migrate.mjs,
// och läggs inte in igen om receptet har tagits bort. Inga "@/"-importer här.

export const ADDED_RECIPES = [
  {
    id: "stekt-entrecote-med-vitlok-smor-och-timjan",
    title: "Stekt entrecôte med vitlök, smör och timjan",
    short: "Krispig stekyta, rosa rakt igenom och öst med vitlökssmör.",
    lede: "Klassisk stekt entrecôte i järnpanna, öst med smör, vitlök och timjan. Steks när hasselbackspotatisen har en kvart kvar, så att köttet hinner vila medan potatisen blir klar.",
    kitchen: "Svenskt", type: "Huvudrätt", base: "Nöt", minutes: 60, servings: 4, servingsUnit: "portioner",
    accent: "crust", difficulty: "medel", tags: ["Bra för gäster"], dishes: ["panna"], holidays: [], pairsWith: [],
    source: { name: "Claude" },
    groups: [
      { name: "Köttet", items: [
        { q: 800, unit: "g", name: "entrecôte", note: "gärna 3 cm tjocka bitar" },
        { q: 2, unit: "tsk", name: "flingsalt", pantry: true },
        { q: 1, unit: "tsk", name: "svartpeppar", note: "nymald", pantry: true },
        { q: 1, unit: "msk", name: "rapsolja", pantry: true },
        { q: 50, unit: "g", name: "smör" },
        { q: 3, unit: "", name: "vitlöksklyftor", note: "krossade med skal" },
        { q: 4, unit: "", name: "kvistar färsk timjan", note: "eller rosmarin" },
      ] },
      { name: "Persiljesmör", items: [
        { q: 75, unit: "g", name: "smör", note: "rumsvarmt" },
        { q: 2, unit: "msk", name: "persilja", note: "hackad" },
        { q: 1, unit: "", name: "vitlöksklyfta", note: "finriven" },
        { q: 0.5, unit: "tsk", name: "citronskal", note: "rivet" },
      ] },
    ],
    steps: [
      { title: "Ta fram köttet", items: [
        { t: "Ta ut köttet ur kylen när potatisen går in i ugnen. Klappa det torrt med hushållspapper och salta med hälften av flingsaltet på alla sidor. Saltet hinner dra in och köttet blir jämnare stekt.", timer: 2400, label: "Köttet vilar" },
      ] },
      { title: "Gör persiljesmöret", items: [
        { t: "Rör ihop smöret med persilja, vitlök, citronskal och en nypa flingsalt. Ställ i kylen." },
      ] },
      { title: "Stek", sub: "När potatisen har cirka 15 minuter kvar", items: [
        { t: "Hetta upp en järnpanna rejält, tills den nästan ryker. Klappa köttet torrt en gång till och pensla med oljan." },
        { t: "Lägg i köttet och låt det ligga orört i 2 minuter, tills det har en djupt brun yta. Vänd och stek 2 minuter till. Stek också kanten med fettranden mot pannan en stund.", timer: 240, label: "Stek hårt" },
        { t: "Sänk till medelvärme. Lägg i smör, vitlök och timjan. Luta pannan och ös det skummande smöret över köttet hela tiden, och vänd köttet varje halvminut. Ta upp det vid 52 grader i mitten för rosa (medium rare) eller 56 grader för medium. En 3 cm tjock bit tar ungefär 3–5 minuter till.", timer: 240, label: "Ös med smör" },
      ] },
      { title: "Vila och servera", items: [
        { t: "Lägg köttet på en skärbräda, ös över lite av smöret och låt vila i 5 minuter. Temperaturen stiger 2–3 grader under tiden. Gör klart potatisen.", timer: 300, label: "Köttet vilar" },
        { t: "Skär köttet mot fibrerna i centimetertjocka skivor. Strö över resten av flingsaltet och pepparn. Servera med hasselbackspotatis och en klick persiljesmör på det varma köttet." },
      ] },
    ],
    restaurantTips: [
      "Salta köttet i god tid och klappa det torrt precis innan det läggs i pannan. En torr yta ger en ordentlig skorpa.",
      "Ös med smör i stället för att bara vända, så får stekytan smak av vitlök och timjan och köttet blir jämnt rosa.",
      "Låt köttet vila innan det skärs, så stannar köttsaften kvar.",
    ],
    tips: [
      "Tjockleken avgör. 3–4 cm tjocka bitar blir bäst, och en tjock bit räcker gott till två.",
      "Tunnare bitar på 2 cm behöver bara cirka 1½ minut per sida och ingen tid för smöröset.",
      "Utan termometer: tryck med fingret. Fjädrar köttet som muskeln vid tummen när pekfingret och tummen möts är det rosa.",
      "Pepparn kommer på efter stekningen, eftersom den bränns i den heta pannan.",
    ],
  },
];
