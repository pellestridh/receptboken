// Pelle Stridhs släktträd "Allt om Ölstilar 2" (Allt om Öl, 2012).
// n = namn, k = stilkort i appen, ex = öl från trädet, c = undergrupper.
const N = (n, k, ex = [], c = []) => ({ n, k, ex, c });

export const TREE = [
  { n: "Spontanjäst", tone: "spontan", c: [
    N("Lambik", "lambic", [], [
      N("Fruktlambik", "kriek", ["Boon Kriek", "Lindemans Kriek"]),
      N("Geuze", "lambic", ["Lindemans Geuze", "Drie Fonteinen Oude Geuze"]),
      N("Faro", "lambic", ["Lindemans Faro", "Cantillon Faro"]),
    ]),
  ] },
  { n: "Överjäst", tone: "over", c: [
    N("Belgisk och fransk ale", null, [], [
      N("Oud bruin", "oud-bruin", ["Liefmans Goudenband"]),
      N("Belgisk röd ale", "flanders-red", ["Rodenbach Grand Cru"]),
      N("Saison", "saison", ["Saison Dupont"]),
      N("Wit", "wit", ["Hoegaarden Wit"]),
      N("Bière de garde", "biere-de-garde"),
      N("Belgisk blond", "blonde", ["Maredsous 6", "St Feuillien Blond"], [
        N("Belgisk strong blond", "golden-strong", ["Duvel"], [
          N("Tripel", "tripel", ["Westmalle Tripel", "Tripel Karmeliet"]),
        ]),
      ]),
      N("Belgisk pale ale", null, ["De Koninck", "Palm"], [
        N("Belgisk strong pale ale", "golden-strong", ["La Chouffe", "Brooklyn Local 1"]),
      ]),
      N("Belgisk dark ale", null, ["Leffe Brune"], [
        N("Belgisk strong dark ale", "quadrupel", ["Gulden Draak", "Corsendonk Pater"], [
          N("Dubbel", "dubbel", ["Westmalle Dubbel", "Chimay"]),
          N("Quadrupel", "quadrupel", ["Westvleteren 12", "Rochefort 10"]),
        ]),
      ]),
    ]),
    N("Stout och porter", null, [], [
      N("Irish stout", "dry-stout", ["Guinness", "Murphy’s Stout"], [N("Foreign stout", "dry-stout")]),
      N("Amerikansk stout", null, ["Dieu du Ciel Aphrodisiaque"]),
      N("Sweet stout", "sweet-stout", ["Young’s Double Chocolate Stout"]),
      N("Oatmeal stout", "oatmeal-stout", ["Samuel Smith Oatmeal Stout"]),
      N("Smaksatt stout", null, ["Shipyard Smashed Blueberry"]),
      N("Imperial stout", "imperial-stout", ["Great Divide Yeti", "Kaggen Stormaktsporter", "Fristadens Stolta Imperial Stout"]),
      N("Amerikansk porter", "porter", ["Founders Porter"]),
      N("Engelsk porter", "porter", ["Fuller’s London Porter", "Carnegie Porter", "S:t Eriks Porter"]),
      N("Imperial porter", "imperial-porter", ["Flying Dog Gonzo Imperial Porter"]),
    ]),
    N("Brown ale", "brown-ale", ["Newcastle Brown Ale"], [N("Amerikansk brown ale", "amerikansk-brown", ["Mikkeller Jackie Brown"])]),
    N("Irish ale", null, [], [N("Irish red ale", "amber-ale", ["Murphy’s Irish Red"])]),
    N("Mild", "mild", [], [
      N("Pale mild", "mild"),
      N("Dark mild", "mild", [], [N("Old ale", "old-ale", ["North Coast Old Stock Ale"])]),
    ]),
    N("Pale ale", null, [], [
      N("Engelsk pale ale", "engelsk-pale-ale", [], [
        N("Bitter", "bitter", [], [
          N("Ordinary bitter", "bitter", ["Adnams Bitter", "Boddingtons Pub Ale"]),
          N("Special, best eller premium bitter", "bitter", ["Fuller’s London Pride"]),
          N("Extra special bitter", "bitter", ["Fuller’s ESB", "Shepherd Neame Bishop’s Finger"]),
        ]),
      ]),
      N("Amerikansk pale ale", "apa", ["Sierra Nevada Pale Ale", "Oppigårds Amarillo"], [
        N("Amber ale", "amber-ale"),
        N("Blond ale", null, ["Oppigårds Golden Ale"]),
      ]),
      N("India pale ale", "ipa", [], [
        N("Engelsk IPA", "ipa", ["Brooklyn East India Pale Ale"]),
        N("Amerikansk IPA", "ipa", ["Sierra Nevada Torpedo"], [
          N("Amerikansk dubbel IPA", "dipa", ["Anders Dubbel IPA"]),
          N("Black IPA", null),
        ]),
      ]),
      N("Strong pale ale", null, [], [
        N("Barley wine", "barley-wine", [], [
          N("Amerikansk barley wine", "barley-wine", ["Sierra Nevada Bigfoot"]),
          N("Engelsk barley wine", "barley-wine", ["Bötet Barley Wine"]),
        ]),
        N("Amerikansk strong ale", "old-ale", ["Arrogant Bastard Ale"]),
        N("Engelsk strong ale", "old-ale", ["Fuller’s Vintage Ale", "Fuller’s Golden Pride"]),
        N("Scotch ale", "scottish", ["Belhaven Wee Heavy"]),
      ]),
    ]),
    N("Cream ale", null, ["Mikkeller Cream Ale"]),
    N("California common", "steam", ["Anchor Steam Beer"]),
    N("Tysk ale", null, [], [
      N("Roggenbier", null),
      N("Weissbier", "weissbier", [], [
        N("Amerikansk weizen", "amerikansk-vete"),
        N("Gose", "gose"),
        N("Hefe weissbier", "weissbier", ["Weihenstephaner Hefeweissbier"]),
        N("Dunkel weissbier", "dunkelweizen", ["Erdinger Weissbier Dunkel"]),
        N("Kristall weissbier", "weissbier", ["Erdinger Weissbier Kristallklar"]),
        N("Weizenbock", "weizenbock", ["Schneider Weisse Tap 6 Aventinus"]),
        N("Berliner Weisse", "berliner-weisse", ["Berliner Kindl Weisse"]),
      ]),
      N("Altbier", "altbier", ["Diebels Alt"]),
      N("Kölsch", "kolsch", ["Früh Kölsch", "Küppers Kölsch"]),
    ]),
  ] },
  { n: "Underjäst", tone: "under", c: [
    N("Modern lager", "modern-lager", ["S:t Eriks Pils"]),
    N("Amerikansk lager", null, [], [
      N("Amerikansk amber och red lager", "wiener", ["Brooklyn Lager"]),
      N("Amerikansk ljus lager", null, ["Pabst Blue Ribbon"]),
    ]),
    N("Internationell lager", null, [], [
      N("Internationell mörk lager", null, ["Falcon Bayersk"]),
      N("Internationell ljus lager", null, ["Stella Artois"]),
    ]),
    N("Pils", "tysk-pilsner", [], [
      N("Amerikansk pils", null, [], [N("Imperial pils", "imperial-pils", ["Samuel Adams Hallertau Imperial Pils"])]),
      N("Tysk pils", "tysk-pilsner", ["Jever", "Bitburger Premium Pils"]),
      N("Tjeckisk pils", "tjeckisk-pilsner", ["Pilsner Urquell"]),
    ]),
    N("Tjeckisk lager", null, [], [
      N("Tmavé", "dunkel", ["U Fleků Flekovský tmavý ležák"]),
      N("Černé", "schwarzbier", ["Krušovice Černé"]),
    ]),
    N("Tysk lager", null, [], [
      N("Kellerbier", null, ["Riegele Kellerbier"]),
      N("Bock", "bock", [], [
        N("Majbock", "helles-bock"),
        N("Dubbelbock", "dubbelbock", ["Ayinger Celebrator"]),
        N("Eisbock", "eisbock", ["Aventinus Weizen-Eisbock"]),
      ]),
      N("Dortmunder", "export", ["DAB Original"]),
      N("Rauchbier", "rauchbier", ["Aecht Schlenkerla Rauchbier Märzen"]),
      N("Wiener", "wiener", ["Samuel Adams Boston Lager"]),
      N("Märzen", "marzen", ["Sierra Nevada Oktoberfest"]),
      N("Münchener", null, [], [
        N("Münchener helles", "helles", ["Hofbräu Original"]),
        N("Münchener dunkel", "dunkel", ["König Ludwig Dunkel"]),
      ]),
      N("Schwarzbier", "schwarzbier", ["Köstritzer Schwarzbier"]),
    ]),
  ] },
];
