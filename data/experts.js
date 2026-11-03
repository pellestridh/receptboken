// Så tänker experterna om dryck och mat. Kort sammanfattat, med källor.

export const EXPERTS = {
  beer: [
    { name: "Garrett Oliver", role: "Bryggmästare på Brooklyn Brewery, författare till The Brewmaster's Table och redaktör för The Oxford Companion to Beer. Räknas som världens ledande inom öl och mat.",
      points: [
        ["Matcha intensiteten", "Ölets kraft ska möta matens. Ingen av dem får köra över den andra: kraftig, mörk ale till grillat och kryddigt, lätt veteöl till lätt mat."],
        ["Hitta smakkroken", "Den del av ölets smak som griper tag i maten. Karamell i amber ale mot grillat kött och karamelliserad lök, rostad malt i porter och stout mot stekyta, humle i IPA, frukt och krydda i veteöl."],
        ["Harmoni och kontrast samtidigt", "De bästa paren gör två eller tre saker på en gång: något speglas, något kontrasterar och något förstärks. Då blir ett plus ett tre. Öl är enligt Oliver bättre än vin på harmoni, eftersom ölet kan ha samma rostade och karamelliga smaker som maten."],
        ["Öl och ost", "Saison eller belgisk wit till syrlig getost, och öl med vildjäst till kittost. Ost och öl delar ursprung i gården och spannmålen."],
      ],
      sources: [["All About Beer: Food pairings, theory and practice", "https://allaboutbeer.com/food-pairings-theory-and-practice/"], ["Cigar Aficionado: More adventures with beer and food", "https://www.cigaraficionado.com/article/more-adventures-with-beer-and-food-2762"], ["A Perfect Pint: intervju om öl och mat", "https://aperfectpint.net/tag/garrett-oliver/index.html"]] },
  ],
  wine: [
    { name: "Aldo Sohm", role: "Chefsommelier på trestjärniga Le Bernardin i New York, utsedd till världens bästa sommelier och författare till Wine Simple.",
      points: [
        ["Utgå från gästen", "Vad de tycker om går före vad som är rätt på papperet."],
        ["Såsen och kryddorna före köttet", "Till paprikakryddad gulasch: en 10–20 år gammal Riesling från Alsace eller Österrike, inte det vanliga lätta röda."],
        ["Biff utan Cabernet", "Syrah från norra Rhône, som Côte-Rôtie och Cornas, eller en Chianti Classico Riserva."],
        ["Ost med vitt och sherry", "Lagrade vita viner passar ofta ostbrickan bättre än rött. Till blåmögelost: amontillado eller oloroso, vars umami slår portvin och Sauternes."],
        ["Mörk öl till choklad", "En maltig mörk öl till chokladdesserten, hellre än något ännu sötare."],
      ],
      sources: [["Fine Dining Lovers: Aldo Sohm's 6 expert food and wine pairing tips", "https://www.finedininglovers.com/explore/articles/sommelier-aldo-sohms-6-expert-food-and-wine-pairing-tips"], ["Wine Simple", "https://aldosohm.com/pages/wine-simple"]] },
    { name: "Jeannie Cho Lee", role: "Första asiatiska Master of Wine, expert på europeiska viner till asiatisk mat.",
      points: [
        ["Möt hetta med sötma, inte alkohol", "Alkohol förstärker chilin. Halvtorr Riesling eller Gewürztraminer dämpar hettan utan att dölja smakerna."],
        ["Umami vill ha mogna viner", "Soja, svamp och dashi får unga, sträva viner att smaka beskt. Välj äldre viner där tanninerna mjuknat."],
      ],
      sources: [] },
    { name: "Rajat Parr", role: "Sommelier och vinmakare, en av USA:s mest inflytelserika.",
      points: [
        ["Jord mot jord", "Svamp och rotfrukter med ett jordigt vin, till exempel Pinot noir från Bourgogne. Matens jordighet lockar fram frukten i vinet."],
        ["Lägre alkohol till mat", "Hög alkohol dämpar matens nyanser. Ett lättare, friskare vin fungerar som en del av kryddningen."],
      ],
      sources: [] },
  ],
};

// Fyra frågor att ställa vid varje middag, samma för öl och vin.
export const METHOD = {
  intro: "Fyra frågor i den här ordningen räcker nästan alltid. De bygger på det Garrett Oliver och sommeliererna är överens om.",
  steps: [
    { t: "Vad är starkast i rätten?", d: "Inte köttet utan såsen, kryddningen och tillagningen. Grillat, stekt eller kokt? Hetta, syra, sötma, fett eller umami?" },
    { t: "Lika starkt", d: "Drycken ska orka med maten och tvärtom. Lätt mat, lätt dryck. Kraftig mat, kraftig dryck." },
    { t: "Något som speglar", d: "Hitta kroken: rostat mot stekyta, citrus mot citron, jord mot svamp, kola mot karamelliserat." },
    { t: "Något som balanserar", d: { beer: "Kolsyra och beska skär genom fett. Sötma lugnar chili. Syrlig öl möter syrlig mat.", wine: "Syra skär genom fett. Tanniner vill ha protein och fett. Restsötma lugnar chili, alkohol förstärker den." } },
  ],
  after: "Efter middagen: logga drycken och tryck på Varför passade det? Då ser ni vilka av de fyra frågorna som avgjorde.",
};
