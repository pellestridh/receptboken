// Ölspektrumet: beska och fruktighet, 0–100, och en rad om varje stil.
// Grunden är Pelles egen smakkarta, Den stora ölkartan, och beskrivningar (märkta pelle: true). Resten är
// tillägg så att alla stilar i appen kommer med.
// b = upplevd beska (humle, IBU), f = fruktighet (estrar från jästen och modern humle).

export const SPECTRUM = [
  {
    key: "humle", name: "Humledrivna stilar", focus: "Fokus på beska och tropisk frukt",
    items: [
      { key: "neipa", b: 15, f: 85, pelle: true, d: "Extremt fruktig (juicig), minimal mätbar eller upplevd beska." },
      { key: "session-ipa", b: 55, f: 66, pelle: true, d: "Medelhög till hög beska, men lätt kropp och frisk, modern humlefruktighet." },
      { key: "apa", b: 35, f: 45, pelle: true, d: "Balanserad, moderat beska med tydliga inslag av citrus och tall." },
      { key: "ipa", b: 75, f: 55, pelle: true, d: "West Coast IPA: mycket hög beska, stram och kådig med balanserad citrusfruktighet i bakgrunden." },
      { key: "dipa", b: 95, f: 60, pelle: true, d: "Extremt hög beska, men också mycket hög fruktighet och alkoholstyrka för att balansera upp det hela." },
      { key: "black-ipa", b: 70, f: 70, pelle: true, d: "Black IPA (Cascadian dark ale): hög beska och modern humlefruktighet som en vanlig IPA, men med en mörk färg och subtila rostade undertoner." },
      { key: "amber-ale", b: 55, f: 30, pelle: true, d: "Tydlig beska mot karamellmalt, humlen ger mer kåda än frukt." },
      { key: "amerikansk-brown", b: 42, f: 38, d: "Medelhög beska och amerikansk humle ovanpå nötig, chokladig malt." },
      { key: "amerikansk-vete", b: 28, f: 45, d: "Låg till medelhög beska. Fruktigheten kommer från humlen, inte från jästen som i tyskt veteöl." },
    ],
  },
  {
    key: "jast", name: "Malt- och jäsningstunga stilar", focus: "Fokus på estrar, kryddor och torkad frukt",
    items: [
      { key: "weissbier", b: 20, f: 65, pelle: true, d: "Mycket låg beska. Tung fruktighet i form av banan och kryddnejlika från jästen." },
      { key: "dunkelweizen", b: 15, f: 58, d: "Samma banan och kryddnejlika som ljust veteöl, men mot en bas av brödig, mörk malt." },
      { key: "weizenbock", b: 20, f: 72, d: "Låg beska. Starkare och fylligare veteöl där banan möter plommon och russin." },
      { key: "wit", b: 20, f: 45, pelle: true, d: "Låg beska. Lätt fruktighet från korianderfrön och torkat apelsinskal." },
      { key: "blonde", b: 25, f: 55, d: "Låg beska, mjuk fruktighet av päron och honung från belgisk jäst." },
      { key: "dubbel", b: 25, f: 80, pelle: true, d: "Låg beska. Rik fruktighet som drar åt torkade frukter: fikon, russin och dadlar." },
      { key: "tripel", b: 28, f: 79, d: "Låg till medelhög beska. Rik fruktighet och kryddig alkohol, ljus och torr." },
      { key: "quadrupel", b: 30, f: 90, pelle: true, d: "Den tyngsta klosterölen. Extremt rik på jästfruktighet (mörka klibbiga frukter, fikon, dadlar) och värmande alkohol, men mycket låg beska." },
      { key: "belgisk-ipa", b: 65, f: 80, pelle: true, d: "Korsning av två världar: hög humlebeska och tropisk humlefruktighet kombinerat med kryddiga estrar från belgisk ale-jäst." },
      { key: "golden-strong", b: 36, f: 68, d: "Medelhög beska, päron och kryddighet från jästen, mycket torr och kolsyrad." },
      { key: "saison", b: 30, f: 70, pelle: true, d: "Saison eller farmhouse ale: rustik och torr. Hög jäsningstextur med peppriga kryddtoner, citrusestrar och en frisk, uppfriskande beska." },
      { key: "biere-de-garde", b: 22, f: 40, d: "Låg beska, maltig och rund med lätt fruktighet och torr avslutning." },
    ],
  },
  {
    key: "ren", name: "Rena och krispiga stilar", focus: "Lager och hybridöl: minimal fruktighet, ren beska eller malt",
    items: [
      { key: "internationell-lager", b: 8, f: 8, pelle: true, d: "Mycket låg beska, nästan obefintlig fruktighet. Ren och neutral profil." },
      { key: "helles", b: 10, f: 20, pelle: true, d: "Låg beska, fokus på den rena, ljust brödiga maltsmaken utan fruktoner." },
      { key: "export", b: 25, f: 12, d: "Något mer beska och malt än en helles, fortfarande helt ren." },
      { key: "tysk-pilsner", b: 36, f: 13, pelle: true, d: "Tydlig, krispig, blommig och örtig humlebeska med en helt ren, icke-fruktig profil." },
      { key: "tjeckisk-pilsner", b: 34, f: 17, d: "Krispig, örtig humlebeska mot rundare, brödigare malt än den tyska." },
      { key: "kolsch", b: 25, f: 20, pelle: true, d: "Subtil och mycket stram beska med endast en minimal, knappt märkbar fruktighet från en sval ale-jäsning." },
      { key: "altbier", b: 42, f: 12, d: "Stram och tydlig beska mot nötig malt, knappt någon frukt trots att den är överjäst." },
      { key: "modern-lager", b: 45, f: 32, d: "Mer humle än vanlig lager, med blommiga och lätt fruktiga inslag." },
      { key: "imperial-pils", b: 70, f: 28, d: "Hög och ren humlebeska, mer alkohol och malt än en vanlig pilsner." },
      { key: "dunkel", b: 5, f: 5, pelle: true, d: "En klassisk mörk lager från München. Mycket låg beska och noll fruktighet, här är det helt fokus på den rena, brödiga och lätt chokladiga maltsmaken." },
      { key: "schwarzbier", b: 25, f: 30, pelle: true, d: "Tysklands svar på svartöl. Krispig som en lager men med en ren, torr och stram rostad beska (likt kaffe), helt utan fruktiga estrar." },
      { key: "rauchbier", b: 25, f: 2, pelle: true, d: "En extremt karaktäriserad tysk lagerstil där malten torkats över öppen bokvedseld. Ingen fruktighet, låg beska, men smakar kraftigt av charkuterier och rök." },
      { key: "steam", b: 40, f: 20, pelle: true, d: "California common (steam beer): en amerikansk historisk hybridstil. Bryggs med lagerjäst men jäses i varmare ale-temperaturer, vilket ger en ren maltprofil men med en subtil, lätt fruktighet och träig humlebeska." },
    ],
  },
  {
    key: "malt", name: "Bärnstensfärgade och maltiga lager", focus: "Malt, bröd och kola, lite frukt",
    items: [
      { key: "wiener", b: 26, f: 18, d: "Låg beska, rostat bröd och lätt karamell, ren och torr." },
      { key: "marzen", b: 22, f: 20, d: "Märzen, Oktoberfest och wienerlager: låg beska, rostat bröd och fyllig malt med lite kola." },
      { key: "helles-bock", b: 28, f: 24, d: "Medelbeska, honung och ljus malt, starkare än en helles." },
      { key: "bock", b: 22, f: 28, d: "Låg beska, fyllig och maltsöt med lite mörk frukt." },
      { key: "dubbelbock", b: 20, f: 42, d: "Bock och dubbelbock: låg beska, mycket maltsötma och kola, dubbelbocken med torkad frukt i bakgrunden." },
      { key: "eisbock", b: 25, f: 56, d: "Låg beska, koncentrerad maltsötma, plommon och russin och värmande alkohol." },
    ],
  },
  {
    key: "brittisk", name: "Brittiska ales", focus: "Jordig humle, kex och kola",
    items: [
      { key: "bitter", b: 50, f: 40, pelle: true, d: "Tydlig, jordig beska mot kexig malt och lätt fruktighet från engelsk jäst." },
      { key: "engelsk-pale-ale", b: 48, f: 38, d: "Fast beska och kexig malt, fruktig men aldrig tropisk." },
      { key: "irish-red", b: 30, f: 35, pelle: true, d: "Lättdrucken och maltfokuserad med smaker av karamell och toffee, balanserad med en mycket mild beska och minimal fruktighet." },
      { key: "mild", b: 16, f: 30, d: "Låg beska, lätt och maltig med lite choklad och frukt." },
      { key: "brown-ale", b: 25, f: 34, d: "Låg beska, nötter och kola, lätt fruktighet." },
      { key: "scottish", b: 18, f: 40, d: "Låg beska, kola och maltsötma, de starka varianterna med mörk frukt." },
      { key: "old-ale", b: 35, f: 60, d: "Medelbeska, lagrad maltsötma med russin, sherry och kola." },
      { key: "barley-wine", b: 62, f: 70, pelle: true, d: "Ett kraftpaket av malt. Komplex fruktsmak av marmelad och torkade frukter med en tung, värmande sötma som balanseras av en märkbar beska i eftersmaken." },
    ],
  },
  {
    key: "rost", name: "Mörka och rostade stilar", focus: "Komplexa fruktoner mot rostad bas",
    items: [
      { key: "dry-stout", b: 50, f: 16, pelle: true, d: "Irsk stout: torr och markerad beska från rostat korn (kaffetoner), mycket låg fruktighet." },
      { key: "porter", b: 40, f: 50, pelle: true, d: "Balanserad beska med lätt fruktighet som drar åt mörka bär och choklad." },
      { key: "imperial-stout", b: 50, f: 75, pelle: true, d: "Medel till hög beska, men kraftig komplexitet med tunga inslag av mörka torkade frukter, plommon, kaffe och lakrits." },
      { key: "oatmeal-stout", b: 35, f: 55, pelle: true, d: "En stout bryggd med havremalt. Det ger en silkeslen, fyllig kropp med mildare beska än en irländsk stout, och en rundare fruktighet av mjölkchoklad och havrekakor." },
      { key: "sweet-stout", b: 25, f: 44, d: "Låg beska, söt av mjölksocker, choklad och mjölkkaffe." },
      { key: "baltisk-porter", b: 30, f: 54, d: "Låg till medelhög beska, lagerjäst men fyllig med plommon, lakrits och choklad." },
      { key: "imperial-porter", b: 44, f: 62, d: "Medelbeska, starkare porter med mörk frukt och choklad." },
    ],
  },
  {
    key: "syrlig", name: "Syrliga och vilda stilar", focus: "Syra i stället för beska",
    items: [
      { key: "berliner-weisse", b: 3, f: 70, pelle: true, d: "Ingen beska alls. Domineras av mjölksyrefriskhet och ofta tillsatt frukt eller bär." },
      { key: "gose", b: 5, f: 66, d: "Ingen beska alls. Mjölksyra, salt och koriander, ofta med frukt eller bär." },
      { key: "lambic", b: 15, f: 95, pelle: true, d: "Traditionell spontanjäst suröl. Extremt hög, komplex fruktighet och syra med nästan ingen upplevd beska. Gueuze blandas av ung och gammal lambic." },
      { key: "kriek", b: 5, f: 98, pelle: true, d: "Traditionell spontanjäst suröl, lagrad med surkörsbär. Extremt hög, komplex fruktighet och syra med noll upplevd beska." },
      { key: "flanders-red", b: 10, f: 84, d: "Låg beska, syrlig och vinös med körsbär och ek." },
      { key: "oud-bruin", b: 16, f: 74, d: "Låg beska, sötsyrlig med russin, plommon och mörk malt." },
    ],
  },
];

const BY = Object.fromEntries(SPECTRUM.flatMap((g) => g.items.map((i) => [i.key, { ...i, group: g }])));
export const spectrumFor = (key) => BY[key] || null;
