// Så beskriver man öl och vin: de vedertagna rubrikerna och orden.
// Öl följer BJCP:s provningsprotokoll (doft, utseende, smak, munkänsla, helhet), samma rubriker som Pelles öltypskort.
// Vin följer WSET:s systematiska provning (utseende, doft, smak, slutsats).
// Systembolagets smakklockor nämns eftersom det är dem ni möter i butiken.

const BEER_VOCAB = [
  { h: "Utseende", intro: "Titta mot ljuset, gärna mot en vit bakgrund.", terms: [
    ["Färg", "Halm, guld, bärnsten, koppar, brun, svart. Färgen kommer från malten och mäts i EBC. Den säger något om rostning, inte om styrka eller beska."],
    ["Klarhet", "Kristallklar, disig eller grumlig. Grumligt är rätt i veteöl och New England IPA, där jästen och vetet ska synas."],
    ["Skum", "Tätt, krämigt, stort eller tunt, och hur länge det håller. Ringar av skum på glaset kallas spetsar och visar att glaset är rent."],
  ] },
  { h: "Doft", intro: "Snurra glaset, lukta kort några gånger. Börja med var doften kommer ifrån, sedan vad den liknar.", terms: [
    ["Malt", "Bröd, kex, honung, kola, nötter, rostat bröd, kaffe, choklad."],
    ["Humle", "Citrus, tall och kåda, tropisk frukt, blommor, gräs och örter, jord och te."],
    ["Jäst", "Estrar ger frukt som banan, päron och torkad frukt. Fenoler ger kryddnejlika och peppar. En lager ska vara ren, utan jästdoft."],
    ["Intensitet", "Svag, medel eller kraftig."],
  ] },
  { h: "Smak", intro: "Ta en ordentlig klunk och låt den gå runt i munnen innan ni sväljer.", terms: [
    ["Sötma", "Maltsötma eller restsötma, från torr till söt."],
    ["Beska", "Humlebeska känns längst bak på tungan. Rostbeska från mörk malt liknar kaffe."],
    ["Syra", "Från ingen alls till frisk mjölksyra eller vinlik syra i syrliga öl."],
    ["Balans", "Maltdriven, humledriven eller balanserad. Det är det första man säger om en öl."],
    ["Eftersmak", "Torr, söt eller besk, kort eller lång. Den som dröjer kvar är ofta det man minns."],
  ] },
  { h: "Munkänsla", intro: "Hur ölet känns, inte hur det smakar.", terms: [
    ["Kropp", "Lätt, medel eller fyllig. Fyllighet kommer från malt, alkohol och ibland havre eller vete."],
    ["Kolsyra", "Låg, medel eller hög. Stickig eller krämig."],
    ["Alkoholvärme", "Värme i munnen och halsen i starka öl. Ska kännas som värme, inte som sprit."],
    ["Strävhet och lenhet", "Rostad malt kan ge en lätt sträv känsla. Havre gör stout len och sidenmjuk."],
  ] },
  { h: "Helhet", intro: "Sammanfatta med några ord och ett betyg.", terms: [
    ["Stiltypisk", "Smakar den som stilen ska? Det är skillnaden mellan annorlunda och fel."],
    ["Smakklockorna", "Systembolaget beskriver öl med tre klockor: beska, fyllighet och sötma. De räcker långt när ni ska hitta fler öl som liknar en ni gillat."],
  ] },
];

const WINE_VOCAB = [
  { h: "Utseende", intro: "Luta glaset mot en vit bakgrund.", terms: [
    ["Klarhet", "Klar eller disig. Ett disigt vin kan vara ofiltrerat, eller ha ett fel."],
    ["Intensitet", "Blek, medel eller djup färg."],
    ["Färg", "Vitt: citrongult, guld, bärnsten. Rosé: rosa, laxrosa, orange. Rött: lila, rubinrött, granatrött, tegelrött. Vita blir mörkare och röda ljusare med åren."],
    ["Tårar", "Ränderna som rinner ner på glaset. Tjocka och långsamma tårar betyder mer alkohol eller sötma, inte högre kvalitet."],
  ] },
  { h: "Doft", intro: "Lukta först utan att snurra, sedan efter att ha snurrat glaset.", terms: [
    ["Intensitet", "Svag, medel eller kraftig."],
    ["Primära dofter", "Från druvan: frukt, blommor och örter. Citrus och grönt äpple, röda och mörka bär, ros, gräs, peppar."],
    ["Sekundära dofter", "Från vinmakningen: smör, bröd och brioche från jästen, vanilj, kokos och rostat från ek."],
    ["Tertiära dofter", "Från mognaden: läder, tobak, svamp, honung, nötter, petroleum i Riesling."],
    ["Utveckling", "Ungdomligt, under utveckling, fullt utvecklat eller trött."],
  ] },
  { h: "Smak", intro: "Ta en liten klunk, dra in lite luft och låt vinet täcka hela munnen.", terms: [
    ["Sötma", "Torrt, halvtorrt, halvsött eller sött."],
    ["Syra", "Låg till hög. Syran får det att vattnas i munnen och är det viktigaste till mat. Systembolaget kallar den fruktsyra."],
    ["Tannin", "Strävheten i röda viner som torkar tandköttet. Mjuk, sammetslen, sträv eller kärv. Systembolaget kallar den strävhet."],
    ["Alkohol", "Låg, medel eller hög. Känns som värme."],
    ["Fyllighet", "Lätt, medel eller fyllig. Ungefär som skummjölk, mellanmjölk och grädde."],
    ["Eftersmak", "Hur länge smaken stannar: kort, medellång eller lång."],
  ] },
  { h: "Slutsats", intro: "Fyra saker skiljer ett bra vin från ett enkelt.", terms: [
    ["Balans", "Frukt, syra, sötma, tannin och alkohol håller varandra i schack."],
    ["Längd", "Lång eftersmak är ett kvalitetstecken."],
    ["Intensitet och komplexitet", "Tydliga smaker, och flera lager som ändras i glaset."],
    ["Smakklockorna", "Systembolaget beskriver vin med fyllighet, sötma, fruktsyra och för röda även strävhet. Använd dem för att hitta fler viner som liknar ett ni gillat."],
  ] },
];

export const DESCRIBE_LESSONS = {
  beer: { key: "beskriva", level: "grund", title: "Så beskriver man en öl", short: "Doft, utseende, smak och munkänsla. De ord som används på öltypskort, i tävlingar och på Systembolaget.",
    body: [], vocab: BEER_VOCAB,
    exercise: "Beskriv kvällens öl med en rad under varje rubrik. Jämför med öltypskortet för stilen.",
    quiz: [
      { q: "Vad säger färgen på en öl mest om?", a: ["Hur rostad malten är", "Hur stark den är", "Hur besk den är"], c: 0 },
      { q: "Banan och päron i doften kommer från …", a: ["Jästens estrar", "Humlen", "Rostad malt"], c: 0 },
      { q: "Kolsyra och kropp hör till …", a: ["Munkänslan", "Doften", "Utseendet"], c: 0 },
    ] },
  wine: { key: "beskriva", level: "grund", title: "Så beskriver man ett vin", short: "Utseende, doft, smak och slutsats. Samma ordning och ord som sommelierer och Systembolaget använder.",
    body: [], vocab: WINE_VOCAB,
    exercise: "Beskriv kvällens vin med en rad under varje rubrik, och sätt ord på syra och fyllighet.",
    quiz: [
      { q: "Smör och vanilj i ett vitt vin kommer oftast från …", a: ["Vinmakningen och eken", "Druvan", "Jorden"], c: 0 },
      { q: "Strävheten i rött vin kallas …", a: ["Tannin", "Syra", "Fyllighet"], c: 0 },
      { q: "Tjocka tårar på glaset betyder …", a: ["Mer alkohol eller sötma", "Högre kvalitet", "Äldre vin"], c: 0 },
    ] },
};
