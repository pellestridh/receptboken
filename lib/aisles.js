// Grov avdelningsindelning så att inköpslistan följer butiken.
const RULES = [
  ["Frukt och grönt", /lök|vitlök|morot|potatis|tomat(?!puré)|gurka|sallad|paprika|chili|ingefära|citron|lime|äpple|banan|spenat|fänkål|persilja|dill|koriander|gräslök|basilika|örter|svamp|zucchini|aubergine|broccoli|blomkål|kål|purjo|selleri|avokado|bär|frukt|mynta|timjan(?!.*torkad)|rödbet|sötpotatis|pumpa|ärt(?!.*fryst)/i],
  ["Mejeri och ägg", /mjölk|grädde|smör|ost|yoghurt|fil|crème|creme|kvarg|ägg|paneer|halloumi|färskost|mascarpone|ricotta|feta|parmesan/i],
  ["Kött, fisk och fågel", /kyckling|nöt|fläsk|lamm|högrev|färs|bacon|korv|skink|torsk|lax|räk|fisk|kött|entrecôte|oxfilé|kalv|anka|musslor/i],
  ["Bröd", /bröd|tortilla|pitabröd|baguette|naan/i],
  ["Frys", /fryst|frysta/i],
  ["Hushåll och hygien", /tvätt|toalett|diskmedel|disktabl|tandkräm|tandborst|schampo|balsam|tvål|hushållspapper|blöj|soppås|fryspås|plastfolie|aluminiumfolie|bakplåtspapper|deodorant|rengöring/i],
  ["Dryck", /\bvin\b|\böl\b|cider|juice|läsk/i],
];

export function aisleFor(name, pantry) {
  if (pantry) return "Skafferi";
  for (const [a, re] of RULES) if (re.test(name)) return a;
  return "Skafferi och övrigt";
}

export const AISLE_ORDER = ["Frukt och grönt", "Bröd", "Mejeri och ägg", "Kött, fisk och fågel", "Frys", "Skafferi och övrigt", "Dryck", "Hushåll och hygien", "Baslistan", "Skafferi", "Egna varor"];
