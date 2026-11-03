// Ölskolan, byggd på Pelle Stridhs material: Ölkunskap 2.0, Liten Ölguide, Humle – Ölets vindruva,
// Allt om Öl och Mat och Att lagra öl. Två nivåer: grund och fördjupning.

// De fem sakerna man känner efter i en öl. Skala 1–5.
export const BEER_DIMS = [
  { key: "beska", name: "Beska", lo: "Mild", hi: "Besk", how: "Känns längst bak på tungan och i eftersmaken. Kommer från humlen. Pilsner och IPA är beska, weissbier och dubbel milda." },
  { key: "sotma", name: "Sötma", lo: "Torr", hi: "Söt", how: "Maltsötma känns på tungspetsen, som bröd, kola eller honung. Tripel är torr trots sin styrka, dubbelbock söt." },
  { key: "fyllighet", name: "Fyllighet", lo: "Lätt", hi: "Fyllig", how: "Hur tung ölen känns i munnen. Lager är lätt, oatmeal stout och barley wine fylliga. Alkohol och malt ger fyllighet." },
  { key: "rostning", name: "Rostning", lo: "Ingen", hi: "Kraftig", how: "Smak av rostat bröd, kaffe, choklad eller lakrits från rostad malt. Syns ofta på färgen: ju mörkare desto mer rostning." },
  { key: "frukt", name: "Frukt och syra", lo: "Ren", hi: "Fruktig", how: "Fruktighet från jästen, som banan, päron och plommon, eller från humlen, som citrus och tropisk frukt. Syrliga öl känns friska som citron." },
];

export const BEER_AROMAS = ["Bröd och kex", "Kola och karamell", "Honung", "Kaffe", "Choklad", "Rostat", "Citrus", "Tropisk frukt", "Banan", "Kryddnejlika", "Päron och äpple", "Mörk frukt", "Tall och kåda", "Blommor", "Örter och gräs", "Rök", "Syrlig", "Vinös"];

// Profil per stil, räknad ur smakkartan och värdena i stilkorten.
import { spectrumFor } from "@/data/beerSpectrum";

export function beerProfile(s) {
  const sp = spectrumFor(s.key);
  const of100 = (v) => Math.max(1, Math.min(5, Math.round(1 + v / 25)));
  const b = (v, steps) => { let i = 1; for (const x of steps) if (v > x) i++; return Math.min(5, i); };
  const ibu = s.ibu ? (s.ibu[0] + s.ibu[1]) / 2 : 25;
  const ebc = s.ebc ? (s.ebc[0] + s.ebc[1]) / 2 : 15;
  const abv = s.abv ? (s.abv[0] + s.abv[1]) / 2 : 5;
  const syrlig = s.family === "syrlig";
  return {
    beska: sp ? of100(sp.b) : b(ibu, [15, 25, 38, 55]),
    sotma: s.map ? Math.max(1, Math.min(5, Math.round(5 - s.map.y * 4))) : 3,
    fyllighet: b(abv, [4.3, 5.5, 7, 9]),
    rostning: b(ebc, [14, 28, 45, 65]),
    frukt: sp ? of100(sp.f) : syrlig ? 5 : s.map ? Math.max(1, Math.min(5, Math.round(5 - s.map.x * 4))) : 3,
  };
}

export const BEER_LESSONS = [
  { key: "prova", n: 1, level: "grund", title: "Så provar man öl", short: "Titta, lukta, smaka, känn efter. Rätt glas och rätt temperatur gör stor skillnad.",
    body: [
      { h: "Titta", t: "Häll så att det blir ett ordentligt skum, det bär doften. Färgen går från blekt halmgul till svart och mäts i EBC. Färgen säger mycket om malten: ljus öl har ljus malt, mörk öl rostad." },
      { h: "Lukta", t: "Snurra lätt och lukta. Malten ger bröd, kola och choklad. Humlen ger citrus, blommor, gräs och tall. Jästen ger banan, kryddnejlika och päron. Säg det första ni tänker på." },
      { h: "Smaka och känn efter", t: "Ta en ordentlig klunk och låt den gå runt. Känn sötman, beskan och fylligheten. Kolsyran: pirrig eller len? Svälj och känn eftersmaken, beskan sitter ofta kvar längst." },
      { h: "Temperatur och glas", t: "För kall öl tappar smak. Ljus lager och pilsner 6–8 °C, ale och belgiskt 10–12 °C, starka och mörka 12–15 °C, källarsvalt. Ett glas som smalnar av upptill samlar doften, ett vinglas fungerar utmärkt." },
    ],
    exercise: "Köp en tysk pilsner och en weissbier. Prova bredvid varandra vid middagen och logga båda. Vilken är beskast? Vilken luktar banan?",
    quiz: [
      { q: "Varför är skummet viktigt?", a: ["Det bär doften", "Det gör ölen kallare", "Det visar alkoholhalten"], c: 0 },
      { q: "Vilken temperatur passar en stark mörk öl bäst?", a: ["2–4 °C", "6–8 °C", "12–15 °C"], c: 2 },
      { q: "Banan och kryddnejlika i doften kommer oftast från …", a: ["Humlen", "Jästen", "Vattnet"], c: 1 },
    ] },
  { key: "ingredienser", n: 2, level: "grund", title: "Fyra ingredienser", short: "Malt, humle, jäst och vatten. Varje del sätter sin prägel på ölet.",
    body: [
      { h: "Malt", t: "Ger fyllighet, sötma och färg. Malt är korn som fått gro och sedan torkats. Ju mer den rostas, desto mörkare öl med toner av kola, kaffe och choklad. Vete, havre och råg används i vissa stilar." },
      { h: "Humle", t: "Ger beska och arom. Bitterhumle ger beskan, aromahumle doften. Kända områden är Hallertau i Bayern, Saaz i Böhmen och Kent i England. Amerikansk humle som Cascade ger citrus och grapefrukt." },
      { h: "Jäst", t: "Gör om socker till alkohol och kolsyra, och bildar själv mängder av smaker. Belgisk jäst är kryddig och fruktig, tysk veteölsjäst ger banan och kryddnejlika, lagerjäst är ren." },
      { h: "Vatten", t: "Över nittio procent av ölet. Salterna påverkar hela bryggningen. Pilsen har mjukt vatten och gav den mjuka pilsnern, Burton hårt vatten och gav den beska paleale." },
      { h: "Reinheitsgebot", t: "Den tyska renhetslagen från 1516 sa att öl bara fick bryggas på malt, humle, vatten och jäst. Öl utan majs, ris eller socker kallas helmaltsöl." },
    ],
    exercise: "Leta upp ett öl där etiketten nämner humlesorten, till exempel en single hop-öl, och känn efter vad humlen ger för doft.",
    quiz: [
      { q: "Vad ger ölet dess färg?", a: ["Humlen", "Malten", "Vattnet"], c: 1 },
      { q: "Saaz är …", a: ["En tjeckisk humle", "En belgisk jäst", "En engelsk malt"], c: 0 },
      { q: "Ett helmaltsöl är bryggt …", a: ["Utan råfrukt som majs och ris", "Bara på vete", "Utan humle"], c: 0 },
    ] },
  { key: "jasning", n: 3, level: "grund", title: "Tre sätt att jäsa", short: "Underjäst, överjäst och spontanjäst. Den indelningen förklarar nästan alla ölstilar.",
    body: [
      { h: "Underjäst: lager", t: "Jäser kallt, 5–12 °C, och jästen sjunker till botten. Ölet lagras sedan i veckor eller månader, därav namnet lager. Rena, krispiga smaker: pilsner, helles, märzen, bock, schwarzbier. Kom till Sverige 1843." },
      { h: "Överjäst: ale", t: "Den ursprungliga metoden. Jäser varmare och jästen flyter upp. Fruktigare och mer komplexa smaker: bitter, pale ale, IPA, stout, porter, weissbier, kölsch och de flesta belgiska öl." },
      { h: "Spontanjäst: lambic", t: "Ingen jäst tillsätts. Vörten får stå öppen så att mikroorganismer i luften startar jäsningen. Ger syrliga, vinösa öl från trakten runt Bryssel: lambic, gueuze och kriek." },
    ],
    exercise: "Prova en lager, en ale och en gueuze. Känner ni skillnaden mellan ren, fruktig och syrlig?",
    quiz: [
      { q: "Pilsner är …", a: ["Underjäst", "Överjäst", "Spontanjäst"], c: 0 },
      { q: "Vilken öl är spontanjäst?", a: ["Stout", "Gueuze", "Kölsch"], c: 1 },
      { q: "Varför heter det lager?", a: ["Ölet lagras efter jäsningen", "Det säljs i lager", "Det är ljust"], c: 0 },
    ] },
  { key: "familjer", n: 4, level: "grund", title: "Stilfamiljerna", short: "Sju grupper och 40 stilar. Kan ni dem hittar ni rätt i hyllan.",
    body: [
      { h: "Lager", t: "Underjäst och svalt jäst: ren och krispig. Från ljus lager, pilsner och helles till märzen, dunkel, schwarzbier och bock." },
      { h: "Pale ale och bitter", t: "Humle och malt i balans: engelsk bitter, amerikansk pale ale, amber ale och blonde ale." },
      { h: "IPA", t: "Humlen i fokus. Engelsk IPA är jordig, West Coast besk och kådig, New England saftig och nästan utan beska." },
      { h: "Veteöl", t: "Hefeweizen, dunkelweizen och weizenbock. Banan och kryddnejlika från jästen." },
      { h: "Belgiska och franska stilar", t: "Witbier, blonde, dubbel, tripel, quadrupel och saison. Jästen ger frukt och kryddor." },
      { h: "Starka ales, stout och porter", t: "Barley wine och strong ale, dry stout, imperial stout och porter. Malt, rostning och torkad frukt." },
      { h: "Syrlig öl och suröl", t: "Moderna snabbsuröl som fruktig gose, pastry sour och sour IPA, och de klassiska: lambic och flamländsk röd." },
    ],
    links: [["Stilarna", "/dryck?vy=stilar"], ["Ölkartan", "/dryck?vy=karta"]],
    exercise: "Öppna Stilarna och välj en grupp ni inte provat. Köp en öl ur den till helgens middag.",
    quiz: [
      { q: "Vilken öl hör till klostertraditionen?", a: ["Tripel", "Pilsner", "Helles"], c: 0 },
      { q: "Amerikansk IPA känns igen på …", a: ["Citrus och tall från humlen", "Banan från jästen", "Rök från malten"], c: 0 },
      { q: "Schwarzbier är …", a: ["En mörk lager", "En stout", "Ett veteöl"], c: 0 },
    ] },
  { key: "mat", n: 5, level: "grund", title: "Öl och mat", short: "Kolsyran fräschar upp, beskan skär genom fett. Sex tumregler som räcker långt.",
    principles: true,
    body: [
      { h: "Därför fungerar öl till mat", t: "Öl saknar ofta vinets syra och är därför lättare att kombinera. Öl fungerar till allt från ägg och sill till ostar och chokladdesserter, mat som är svår till vin." },
      { h: "Harmoniera eller kontrastera", t: "Hitta samma smaker i ölet och maten, som citrus, karamell eller choklad. Eller välj en tydlig kontrast, som en fruktig weissbier till syrlig chèvre." },
    ],
    exercise: "Välj en rätt ur receptlådan, läs ölförslaget och tryck på Vad bygger förslaget på. Stämmer det med tumreglerna? Prova och logga.",
    quiz: [
      { q: "Till en söt dessert ska ölet vara …", a: ["Sötare än desserten", "Torrare än desserten", "Ljust"], c: 0 },
      { q: "Till stark chili är det bäst med …", a: ["Hög beska", "Maltsötma", "Mycket alkohol"], c: 1 },
      { q: "Vad gör beskan med fet mat?", a: ["Skär genom fettet", "Förstärker fettet", "Ingenting"], c: 0 },
    ] },

  // Fördjupning
  { key: "humle", n: 6, level: "fordjupning", title: "Humle, ölets vindruva", short: "Som druvan i vin avgör humlesorten mycket av doften. Lär er känna igen de stora.",
    body: [
      { h: "Ädel europeisk humle", t: "Saaz från Böhmen, Hallertauer och Tettnanger från Tyskland: blommig, kryddig och mild. Ger pilsnerns karaktär." },
      { h: "Engelsk humle", t: "East Kent Golding och Fuggle: jordig, blommig, örtig. Bitter och engelsk IPA." },
      { h: "Amerikansk humle", t: "Cascade, Centennial, Amarillo, Simcoe, Citra: citrus, grapefrukt, tall och tropisk frukt. Gav upphov till amerikansk pale ale och IPA." },
      { h: "Single hop", t: "Öl bryggda på en enda humlesort, ett utmärkt sätt att lära sig humlesorterna, precis som att prova viner gjorda på en druva." },
      { h: "Torrhumling", t: "Humle tillsatt efter kokningen ger mycket doft men lite beska. Därför luktar en modern IPA så intensivt." },
    ],
    exercise: "Prova en tjeckisk pilsner med Saaz och en amerikansk IPA med Cascade bredvid varandra.",
    quiz: [
      { q: "Vilken humle ger pilsner dess klassiska karaktär?", a: ["Saaz", "Citra", "Fuggle"], c: 0 },
      { q: "Torrhumling ger …", a: ["Mycket doft, lite beska", "Mycket beska, lite doft", "Mörkare färg"], c: 0 },
      { q: "Cascade doftar typiskt …", a: ["Grapefrukt och citrus", "Banan", "Rök"], c: 0 },
    ] },
  { key: "felsmaker", n: 7, level: "fordjupning", title: "Doft, smak och felsmaker", short: "Lär er doftcirkeln och de vanligaste felen, så vet ni när en öl är dålig och inte bara annorlunda.",
    wheel: "Börja i mitten och gå utåt: först var doften kommer ifrån, malt, humle, jäst eller syra, sedan vad det faktiskt luktar. Den röda delen är felen.",
    body: [
      { h: "Grundsmakerna", t: "Sött på tungspetsen, salt och surt på sidorna, beskt längst bak. Umami ger mustighet. Det mesta av smaken är dock doft." },
      { h: "Diacetyl", t: "Smör och smörkola. Ett fel i de flesta stilar, men en svag ton är tillåten i tjeckisk pilsner och vissa engelska ale." },
      { h: "DMS", t: "Kokt majs eller kål. Kommer från malten eller för kort kokning. Fel i nästan alla stilar." },
      { h: "Oxiderat", t: "Blöt kartong, gammal sherry. Ölet har åldrats med syre. Vanligt i gammal ljus öl, men en sherryton kan vara fin i lagrad barley wine." },
      { h: "Ljusskadat", t: "Skunk eller katt. Uppstår när öl i genomskinlig eller grön flaska står i ljus. Därför är bruna flaskor bäst." },
      { h: "Acetaldehyd", t: "Gröna äpplen. Ung öl som inte jäst klart." },
    ],
    exercise: "Ställ en pilsner i grön flaska i solen en timme och jämför med en som stått mörkt. Då vet ni hur ljusskadat luktar.",
    quiz: [
      { q: "Smörkola i doften kallas …", a: ["Diacetyl", "DMS", "Acetaldehyd"], c: 0 },
      { q: "Blöt kartong tyder på att ölet är …", a: ["Oxiderat", "Ljusskadat", "För ungt"], c: 0 },
      { q: "Vilken flaska skyddar bäst mot ljusskada?", a: ["Brun", "Grön", "Klar"], c: 0 },
    ] },
  { key: "lagra", n: 8, level: "fordjupning", title: "Att lagra öl", short: "Vissa öl blir bättre med åren, de flesta ska drickas färska.",
    body: [
      { h: "Drick färskt", t: "Pilsner, IPA, pale ale och veteöl är bäst unga. Humledoften bleknar redan efter några månader." },
      { h: "Lagra gärna", t: "Starka, mörka eller syrliga öl: barley wine, imperial stout, old ale, quadrupel, gueuze och flamländsk röd. De får toner av sherry, torkad frukt och läder." },
      { h: "Så lagrar man", t: "Mörkt, svalt och jämnt, 10–15 °C. Flaskor stående så att jästen sätter sig och korken inte påverkar. Högre temperatur mognar fortare men tar risker." },
      { h: "Vertikal provning", t: "Köp flera av samma öl, till exempel en årgångsöl, och öppna en per år. Det är det roligaste sättet att lära sig vad lagring gör." },
    ],
    exercise: "Köp två flaskor av en barley wine eller imperial stout. Drick en nu, logga den, och spara den andra ett år.",
    quiz: [
      { q: "Vilken öl ska drickas färsk?", a: ["IPA", "Barley wine", "Gueuze"], c: 0 },
      { q: "Hur bör flaskor lagras?", a: ["Stående, mörkt och svalt", "Liggande i kylen", "I fönstret"], c: 0 },
      { q: "Lagrad barley wine kan få toner av …", a: ["Sherry och torkad frukt", "Citrus och gräs", "Banan"], c: 0 },
    ] },
];

export const beerLessonByKey = (k) => BEER_LESSONS.find((l) => l.key === k) || null;
