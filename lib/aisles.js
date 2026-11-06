// Avdelningsindelning så att inköpslistan följer butiken.
// Svenska sammansättningar avgörs av sista ledet: "lantbrödsmjöl" är mjöl, inte bröd,
// och "pizzamjöl" är mjöl, inte öl. Därför testas först hela namnet mot slutord,
// sedan mot ord som får stå var som helst.

const L = "a-zåäöéüæø";
// Ordet sist i namnet (eller som eget ord), t.ex. "mjöl" i "vetemjöl" och "lantbrödsmjöl".
const ends = (words) => new RegExp(`(${words.join("|")})(?![${L}])`, "i");
// Ett eget ord, inte del av ett längre.
const word = (words) => new RegExp(`(?<![${L}])(${words.join("|")})(?![${L}])`, "i");

// Slutled som avgör, i prioritetsordning.
const HERBS = "(timjan|oregano|rosmarin|basilika|persilja|dill|mynta|salvia|dragon|mejram|koriander|gräslök|lagerblad|chili)";
const TAIL = [
  // Torkade örter och kryddor står på kryddhyllan.
  ["Kryddor", new RegExp(`(?<![${L}])(torkad|torkade|torkat|malen|malet|mald|hel|hela|krossad|krossade)(?![${L}]).*${HERBS}|${HERBS}.*(?<![${L}])(torkad|torkade|torkat|malen|malet|mald)(?![${L}])|${HERBS}(?![${L}]).*(burk|påse)`, "i")],
  ["Kryddor", ends(["kryddor", "kryddblandning", "krydda", "peppar", "svartpeppar", "vitpeppar", "rosépeppar", "kanel", "kanelstång", "kanelstänger", "kardemumma", "kardemummakärnor", "paprikapulver", "rökt paprika", "spiskummin", "kummin", "chiliflakes", "chilipulver", "cayennepeppar", "kajennpeppar", "gurkmeja", "ingefärspulver", "muskot", "muskotnöt", "kryddnejlika", "kryddnejlikor", "kryddpeppar", "stjärnanis", "anis", "fänkålsfrö", "fänkålsfrön", "korianderfrö", "korianderfrön", "senapsfrö", "senapsfrön", "kumminfrö", "lagerblad", "oregano", "mejram", "vaniljstång", "vaniljstänger", "vaniljpulver", "saffran", "garam masala", "curry", "currypulver", "za'atar", "sumak", "ras el hanout", "baharat", "dukkah", "harissa krydda", "flingsalt", "havssalt", "örtsalt", "vitlökspulver", "lökpulver", "chipotle", "ancho", "pul biber", "aleppopeppar", "furikake", "shichimi", "togarashi", "sichuanpeppar", "femkryddspulver", "tacokrydda", "grillkrydda", "pepparrotspulver", "enbär", "fänkålsfrö"])],
  // Torkat och på burk står i skafferiet, även örter och frukt.
  ["Skafferi och övrigt", word(["torkad", "torkade", "torkat", "konserverad", "konserverade", "på burk"])],
  ["Hushåll och hygien", ends(["tvättmedel", "sköljmedel", "diskmedel", "disktabletter", "maskindisk", "toalettpapper", "hushållspapper", "servetter", "tandkräm", "tandborste", "tandborstar", "tandtråd", "munskölj", "rakblad", "rakhyvel", "plåster", "hudkräm", "handkräm", "bodylotion", "solkräm", "bomullspads", "bomullspinnar", "tops", "tamponger", "bindor", "toapapper", "hushållsrullar", "disksvamp", "disksvampar", "diskborste", "diskduk", "disktrasa", "sopsäckar", "glödlampa", "glödlampor", "kattmat", "hundmat", "kattsand", "tvättlappar", "schampo", "balsam", "tvål", "duschtvål", "deodorant", "blöjor", "soppåsar", "fryspåsar", "plastfolie", "aluminiumfolie", "bakplåtspapper", "rengöringsmedel", "batterier", "tändstickor", "värmeljus", "stearinljus", "kronljus", "blockljus", "tändljus"])],
  ["Skafferi och övrigt", ends(["krossade tomater", "passerade tomater", "tomatpuré", "kokosmjölk", "kokosgrädde", "mjöl", "socker", "salt", "jäst", "bakpulver", "vaniljsocker", "kakao", "flingor", "gryn", "müsli", "granola", "pasta", "spaghetti", "makaroner", "nudlar", "(?<!spar)ris", "couscous", "bulgur", "quinoa", "linser", "bönor", "kikärtor", "olja", "vinäger", "ättika", "buljong", "fond", "sås", "soja", "ketchup", "senap", "majonnäs", "sylt", "marmelad", "honung", "sirap", "kaffe", "örtte", "konserv", "puré", "pesto", "currypasta", "nötter", "mandlar", "frön", "russin", "choklad", "kex", "chips", "popcorn", "knäckebröd", "skorpor", "ströbröd", "panko", "tortillachips", "tacoskal"])],
  ["Frys", ends(["glass", "fryst", "frysta", "frysgrönsaker", "pommes frites", "isbitar"])],
  ["Dryck", ends(["vin", "öl", "cider", "juice", "läsk", "mineralvatten", "kolsyrat vatten", "must", "saft", "lättöl", "alkoholfritt"])],
  ["Bröd", ends(["bröd", "limpa", "baguette", "tortilla", "tortillas", "pitabröd", "naan", "frallor", "bullar", "kanelbullar", "hamburgerbröd", "korvbröd", "ciabatta", "focaccia", "surdegsbröd", "rostbröd"])],
  ["Mejeri och ägg", ends(["mjölk", "grädde", "smör", "ost", "yoghurt", "fil", "filmjölk", "crème fraiche", "creme fraiche", "gräddfil", "kvarg", "ägg", "paneer", "halloumi", "färskost", "mascarpone", "ricotta", "feta", "parmesan", "mozzarella", "kesella", "keso", "havredryck", "margarin"])],
  ["Kött, fisk och fågel", ends(["kyckling", "kycklingfilé", "kycklinglår", "nötkött", "fläsk", "fläskfilé", "karré", "lamm", "högrev", "färs", "bacon", "korv", "skinka", "torsk", "lax", "räkor", "fisk", "kött", "entrecôte", "oxfilé", "kalv", "anka", "musslor", "sej", "kolja", "tonfisk", "sill", "chorizo", "salami", "prosciutto", "pancetta", "biff", "stek", "filé", "kotletter", "revben", "pulled pork"])],
  ["Frukt och grönt", ends(["lök", "vitlök", "morot", "morötter", "potatis", "tomat", "tomater", "gurka", "sallad", "paprika", "chili", "ingefära", "citron", "citroner", "lime", "äpple", "äpplen", "banan", "bananer", "spenat", "fänkål", "persilja", "dill", "koriander", "gräslök", "basilika", "örter", "svamp", "champinjoner", "zucchini", "aubergine", "broccoli", "blomkål", "kål", "purjolök", "selleri", "avokado", "bär", "frukt", "mynta", "timjan", "rosmarin", "rödbetor", "rödbeta", "sötpotatis", "pumpa", "ärtor", "sockerärtor", "bönor färska", "päron", "apelsin", "apelsiner", "clementiner", "vindruvor", "melon", "mango", "ananas", "jordgubbar", "blåbär", "hallon", "palsternacka", "rotselleri", "rucola", "ruccola", "salladslök", "schalottenlök", "majs", "grönkål",
    "satsuma", "satsumas", "mandarin", "mandariner", "clementin", "klementin", "klementiner", "kiwi", "kiwis", "plommon", "persika", "persikor", "nektarin", "nektariner", "aprikos", "aprikoser", "fikon", "granatäpple", "granatäpplen", "passionsfrukt", "grapefrukt", "pomelo", "physalis", "papaya", "litchi", "körsbär", "lingon", "vinbär", "krusbär", "tranbär", "björnbär", "smultron", "hjortron", "druvor", "nypotatis", "rädisor", "rädisa", "sparris", "kålrot", "jordärtskocka", "jordärtskockor", "haricots verts", "brytbönor", "bladselleri", "pak choi", "mangold", "isbergssallad", "gurkor", "tomat", "kronärtskocka", "chilipeppar", "jalapeño", "dragon", "salvia", "citrongräs", "limeblad", "groddar", "skott", "pepparrot"])],
];

// Ord som avgör var de än står (när slutledet inte gav svar).
const ANY = [
  ["Skafferi och övrigt", word(["te", "teblad", "tepåsar"])],
  ["Hushåll och hygien", /^ljus$/i],
  ["Frys", word(["frysta?", "djupfryst"])],
  ["Kött, fisk och fågel", /kyckling|fläsk|nötfärs|blandfärs|lammfärs|räkor|lax(?![a-zåäö])|torsk/i],
  ["Mejeri och ägg", /mjölk(?!.*choklad)|grädd|yoghurt|crème|creme/i],
  ["Frukt och grönt", /färsk(a)? (örter|basilika|koriander|persilja)/i],
];

export function aisleFor(name, pantry) {
  if (pantry) return "Skafferi";
  const n = String(name || "").toLowerCase().trim();
  for (const [a, re] of TAIL) if (re.test(n)) return a;
  for (const [a, re] of ANY) if (re.test(n)) return a;
  return "Skafferi och övrigt";
}

// Som aisleFor, men null när inget ord känns igen.
export function aisleMatch(name) {
  const n = String(name || "").toLowerCase().trim();
  for (const [a, re] of TAIL) if (re.test(n)) return a;
  for (const [a, re] of ANY) if (re.test(n)) return a;
  return null;
}

export const AISLE_ORDER = ["Frukt och grönt", "Bröd", "Mejeri och ägg", "Kött, fisk och fågel", "Frys", "Skafferi och övrigt", "Kryddor", "Dryck", "Hushåll och hygien", "Baslistan", "Skafferi", "Egna varor"];
