const r1 = (x) => Math.round(x * 10) / 10;

// Pelles pizzadegar, samma uträkning som på ettgotland.se.
// Mjölet är 60 % av degbollens vikt, vattnet 65 % av mjölet och saltet knappt 3 % av mjölet.
// Jästen skiljer: dagjäst 1,1 % torrjäst, napolitansk cirka 0,215 %.

export const DOUGHS = {
  dag: {
    name: "Dagjäst pizza", short: "Dagjäst", yeast: 0.011, yeastName: "Torrjäst",
    rise: "Cirka 8 timmar i kylen (cirka 7 °C), sedan cirka 2 timmar som bollar i rumstemperatur.",
    intro: "Pelles vanliga deg. Görs på morgonen och bakas på kvällen.",
    machine: [
      "Ha vattnet och jästen i köksassistenten och kör tills jästen löst sig.",
      "Tillsätt hälften av mjölet och jobba ihop det tills mjölet binder vattnet.",
      "Tillsätt saltet och resten av mjölet och kör på medelhastighet i cirka 10 minuter.",
    ],
    hand: [
      "Rör ut jästen i vattnet i en stor skål.",
      "Tillsätt hälften av mjölet och rör ihop. Tillsätt saltet och resten av mjölet och arbeta ihop med handen tills inget torrt mjöl finns kvar.",
      "Låt degen vila 20 minuter under handduk, så att mjölet hinner suga upp vattnet.",
      "Vik degen: 3–4 omgångar med 15–20 minuters mellanrum. Se Vik-tekniken nedanför.",
    ],
    after: [
      "Olja in en skål eller burk med lock och lägg i degen. Låt jäsa cirka 8 timmar i kylen som håller cirka 7 grader.",
      "Ta ut degen, dela den i lika många bitar som pizzor och bolla dem. Lägg på bänken eller en oljad plåt, täck med plastfolie eller en fuktig handduk och låt vila cirka 2 timmar, så att degen hinner få rumstemperatur.",
      "Baka ut pizzorna med rikligt med durumvetemjöl. Toppa och grädda, se tiderna för er ugn nedanför.",
    ],
  },
  napoli: {
    name: "Napolitansk pizza", short: "Napolitansk", yeast: 0.00215, yeastName: "Torrjäst",
    rise: "Minst 48 timmar i kylen (4–7 °C), helst 72 timmar. Sedan 2–4 timmar i rumstemperatur som bollar.",
    intro: "Lång kalljäsning ger en luftig, smakrik kant. En klassisk napolitansk pizza väger 230–260 g.",
    flourNote: "Får du inte tag på Tipo 00 går det bra med vanligt vetemjöl, men dra då av 10 % av vattnet eftersom det inte binder lika mycket vatten.",
    machine: [
      "Häll upp det kalla vattnet i köksmaskinen. Tillsätt saltet och lös upp det.",
      "Ha i cirka 10 % av mjölet och rör till en slät smet. Den skapar en barriär mellan saltet och jästen, som annars inte gillar varandra.",
      "Ha i jästen och låt maskinen gå tills den är helt upplöst.",
      "Tillsätt resten av mjölet och knåda i 10–20 minuter. Forma till en stor degboll.",
    ],
    hand: [
      "Häll upp det kalla vattnet i en stor skål, lös upp saltet och rör ner cirka 10 % av mjölet till en slät smet.",
      "Rör ner jästen tills den är upplöst, och arbeta sedan in resten av mjölet med handen tills inget torrt mjöl finns kvar.",
      "Låt degen vila 20 minuter under handduk.",
      "Vik degen: 4 omgångar med 15–20 minuters mellanrum, tills den är slät och elastisk. Se Vik-tekniken nedanför.",
    ],
    after: [
      "Olja en behållare med lufttätt lock, eller täck med plastfilm, och lägg i degen. Låt jäsa i kylen (4–7 grader) i minst 48 timmar, helst 72.",
      "Ta ut degen, dela den i lika många bitar som pizzor och bolla dem. Låt ligga i rumstemperatur 2–4 timmar innan du bakar.",
      "Baka ut med durumvetemjöl och toppa med precis vad som helst. Se tiderna för er ugn nedanför.",
    ],
  },
};

// Focaccia av den dagjästa pizzadegen. Degen räknas efter formens yta, cirka 0,6 g per cm².
export const FOCACCIA = {
  name: "Focaccia", short: "Focaccia", yeast: 0.011, yeastName: "Torrjäst", oil: 0.03, perCm2: 0.6,
  rise: "Cirka 8 timmar i kylen som en enda deg, sedan 1½–2 timmar i formen i rumstemperatur.",
  intro: "Pelles dagjästa pizzadeg som focaccia. Görs på morgonen, jäser i formen på eftermiddagen och gräddas till middagen.",
  hydrations: [[0.65, "Som pizzadegen, 65 %", "Lite fastare och brödlik, som focaccia från Genua."], [0.75, "Luftigare, 75 %", "Mjukare med större bubblor. Degen blir kladdig, men vik-tekniken tar hand om det."]],
  pans: [{ key: "langpanna", name: "Långpanna", desc: "cirka 30 × 40 cm", cm2: 1200 }, { key: "form", name: "Form 20 × 30 cm", desc: "", cm2: 600 }, { key: "rund", name: "Rund form 24 cm", desc: "", cm2: 450 }],
  machine: [
    "Ha vattnet och jästen i köksassistenten och kör tills jästen löst sig.",
    "Tillsätt hälften av mjölet och jobba ihop det tills mjölet binder vattnet.",
    "Tillsätt saltet, olivoljan och resten av mjölet och kör på medelhastighet i cirka 10 minuter.",
  ],
  hand: [
    "Rör ut jästen i vattnet i en stor skål.",
    "Tillsätt hälften av mjölet och rör ihop. Tillsätt saltet, olivoljan och resten av mjölet och arbeta ihop med handen tills inget torrt mjöl finns kvar.",
    "Låt degen vila 20 minuter under handduk, så att mjölet hinner suga upp vattnet.",
    "Vik degen: 3–4 omgångar med 15–20 minuters mellanrum. Se Vik-tekniken nedanför.",
  ],
  after: [
    "Olja in en skål eller burk med lock och lägg i degen. Låt jäsa cirka 8 timmar i kylen. Bolla inte, den ska vara en enda deg.",
    "Ta ut degen en timme innan den ska i formen.",
    "Häll 3–4 matskedar olivolja per långpanna i formen och lägg i degen. Vänd den så att den blir oljad på båda sidor och dra försiktigt ut den mot kanterna. Drar den ihop sig, låt den vila 15 minuter och dra ut den igen.",
    "Låt jäsa i formen 1½–2 timmar under handduk, tills degen är pösig och darrar när du skakar formen lite.",
    "Smörj fingrarna med olja och tryck gropar rakt ner till botten över hela degen.",
    "Vispa ihop saltlaken och häll över, så samlas den i groparna. Strö över flingsalt och rosmarin, eller det du vill ha på.",
    "Grädda och lägg den på galler direkt ur formen, annars blir botten mjuk.",
  ],
  brine: "Saltlake per långpanna: 2 matskedar vatten, 2 matskedar olivolja och ½ tesked salt.",
  bake: ["Värm ugnen till 230–250 grader.", "Grädda 20–25 minuter mitt i eller strax under mitten av ugnen, tills ytan är gyllenbrun.", "Ställ gärna formen direkt på pizzastålet, så blir botten krispig."],
  toppings: ["Rosmarin och flingsalt, det klassiska.", "Körsbärstomater och oliver.", "Tunt skivad rödlök.", "Tunna potatisskivor med rosmarin, som i Apulien."],
};

export function focacciaFor({ pan = "langpanna", pans = 1, hyd = 0.65 }) {
  const P = FOCACCIA.pans.find((x) => x.key === pan) || FOCACCIA.pans[0];
  const deg = P.cm2 * pans * FOCACCIA.perCm2;
  const mjol = deg / (1 + hyd + 0.02963 + FOCACCIA.yeast + FOCACCIA.oil);
  return { deg: Math.round(deg), mjol: r1(mjol), vatten: r1(mjol * hyd), jast: r1(mjol * FOCACCIA.yeast), salt: r1(mjol * 0.02963), olja: r1(mjol * FOCACCIA.oil) };
}

export const TECHNIQUES = [
  { t: "Vik-tekniken", d: "Så knådar man utan maskin. Fukta handen, ta tag i kanten på degen, dra den uppåt så långt den går utan att brista och vik den över mitten. Vrid skålen ett kvarts varv och gör samma sak, fyra gånger runt. Det är en omgång. Låt vila 15–20 minuter mellan omgångarna. Efter tre eller fyra omgångar är degen slät, spänstig och släpper från skålen." },
  { t: "Att bolla degen", d: "Att forma degbitarna till spända bollar. Väg bitarna så att de blir lika stora. Vik kanterna in mot mitten och vänd bollen med skarven nedåt. Kupa handen över den och rulla den mot bänken i små cirklar, så att ytan sträcks och spänns. En väl bollad deg har en slät och spänd yta, håller formen och ger en luftig kant." },
];

// Gram för antal pizzor. Med vanligt vetemjöl till napolitansk dras 10 % av vattnet.
export function doughFor({ count = 1, weight = 280, kind = "dag", flour = "tipo00" }) {
  const D = DOUGHS[kind] || DOUGHS.dag;
  const mjol = count * weight * 0.6;
  let vatten = mjol * 0.65;
  if (kind === "napoli" && flour === "vete") vatten *= 0.9;
  return { mjol: r1(mjol), vatten: r1(vatten), jast: r1(mjol * D.yeast), salt: r1(mjol * 0.02963) };
}

// Ugnarna, med Pelles gräddningstider.
export const OVENS = {
  ugn: { name: "Ugn med stål", tips: ["Värm ugnen med pizzastålet till 300 grader, så att stålet hinner bli riktigt varmt.", "Grädda cirka 4 minuter."] },
  pizzaugn: { name: "Pizzaugn", tips: ["Värm stenen till 400–450 grader.", "Grädda 1–1,5 minuter: kortare tid på sommaren, lite längre när det är kallt ute. Vrid pizzan efter halva tiden så att den gräddas jämnt."] },
};

// Degbollens vikt och pizzans storlek, efter AVPN.
export const SIZES = [[200, "22–24 cm"], [250, "cirka 30 cm, standard"], [280, "28–35 cm"]];
export function sizeFor(w) { return w < 225 ? "22–24 cm" : w < 265 ? "cirka 30 cm" : "28–35 cm"; }

// Vill du lära dig mer.
export const READ_MORE = [
  { t: "Degskolan på pizzalovers.se", h: "https://pizzalovers.se/category/degskolan/", d: "Över tjugo guider: kalljäsning i 24, 48 och 72 timmar, poolish och biga, surdegspizza, bulkjäsning och hur mycket salt som behövs." },
  { t: "Napolitansk pizzadeg enligt AVPN, italienskpizza.se", h: "https://italienskpizza.se/napolitansk-pizzadeg/", d: "De traditionella reglerna från Neapel: lägre vattenhalt, väldigt lite jäst och vedugn på 450 grader." },
];

// Pizzarecept: degen i receptet byts mot kalkylatorn, resten är pålägg per pizza.
export const isDoughGroup = (g) => /deg\b|degen|pizzadeg|^deg/i.test(String(g?.name || ""));
export function toppingItems(recipe, pizzas) {
  const per = (recipe.servings || 1);
  const f = pizzas / per;
  return (recipe.groups || []).filter((g) => !isDoughGroup(g)).flatMap((g) => g.items || [])
    .filter((it) => it.shop !== false)
    .map((it) => ({ name: it.name, unit: it.unit || "", amt: it.amt || "", pantry: !!it.pantry, from: recipe.title,
      q: it.q == null ? null : it.q * f, q2: it.q2 == null ? null : it.q2 * f }));
}
