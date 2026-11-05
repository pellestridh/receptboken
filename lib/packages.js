// Vanliga förpackningar i svenska butiker och hur länge varan håller efter öppning (dagar i kylen).
// Används för att räkna ut vad som blir kvar hemma efter ett köp. Ingen "@/"-import här.
// q och unit är förpackningens storlek. days = öppnad i kyl, frozen = i frysen.
const K = (re, q, unit, days, frozen = 90, name) => ({ re, q, unit, days, frozen, name });

export const PACKAGES = [
  // Mejeri
  K(/ricotta/, 250, "g", 7), K(/mascarpone/, 250, "g", 5), K(/mozzarella/, 125, "g", 3, 60),
  K(/burrata/, 125, "g", 2, 0), K(/feta/, 150, "g", 7), K(/halloumi/, 200, "g", 10),
  K(/parmesan|parmigiano|grana padano|pecorino/, 150, "g", 30),
  K(/crème fraiche|creme fraiche/, 2, "dl", 7, 0), K(/gräddfil/, 3, "dl", 7, 0),
  K(/matlagningsgrädde|vispgrädde|grädde(?!fil)/, 3, "dl", 5, 60), K(/kokosmjölk|kokosgrädde/, 4, "dl", 4, 60),
  K(/turkisk yoghurt|grekisk yoghurt|yoghurt/, 10, "dl", 7, 0), K(/kvarg|kesella/, 5, "dl", 5, 0),
  K(/smör(?!deg)/, 500, "g", 30, 180),
  // Kött och fisk
  K(/köttfärs|nötfärs|blandfärs|fläskfärs|lammfärs|kycklingfärs/, 500, "g", 1, 90),
  K(/bacon|pancetta/, 140, "g", 5, 60), K(/salami|ventricina|chorizo|nduja|'nduja/, 100, "g", 4, 60),
  K(/prosciutto|parmaskinka|crudo|serrano|bresaola/, 70, "g", 3, 30), K(/rökt karré|vedrökt karré|kassler/, 150, "g", 4, 60),
  K(/kycklingfilé|kycklingbröst|kycklinglårfilé/, 900, "g", 1, 90),
  K(/räkor/, 500, "g", 2, 90), K(/laxfilé|lax\b/, 400, "g", 1, 90),
  // Grönt
  K(/vitkål/, 1500, "g", 21, 0, "vitkål"), K(/rödkål/, 1200, "g", 21, 0), K(/spetskål/, 800, "g", 7, 0),
  K(/rotselleri/, 700, "g", 21, 0), K(/purjolök/, 2, "st", 10, 0), K(/blomkål/, 600, "g", 5, 0), K(/broccoli/, 400, "g", 4, 0),
  K(/färsk spenat|babyspenat|bladspenat|^spenat/, 65, "g", 3, 0), K(/ruccola|rucola/, 65, "g", 3, 0),
  K(/romansallad|romaine/, 2, "st", 5, 0), K(/champinjoner/, 250, "g", 4, 0),
  K(/koriander(?!frö)/, 1, "kruka", 5, 0), K(/basilika/, 1, "kruka", 5, 0), K(/persilja/, 1, "kruka", 7, 0), K(/dill/, 1, "kruka", 5, 0),
  K(/rosmarin/, 1, "kruka", 10, 0), K(/salladslök/, 1, "knippe", 5, 0), K(/ingefära/, 100, "g", 21, 180),
  // Skafferi som blir kvar efter öppning
  K(/krossade tomater|passerade tomater|körsbärstomater på burk|san marzano|hela tomater/, 400, "g", 4, 120),
  K(/tomatpuré/, 140, "g", 14, 120), K(/pesto/, 190, "g", 7, 90), K(/currypasta/, 110, "g", 30, 0),
  K(/vitlöksdressing|caesardressing|dressing/, 2.5, "dl", 14, 0), K(/picklad rödlök/, 3, "dl", 21, 0),
  K(/chiliolja/, 1, "dl", 180, 0), K(/pinjenötter/, 100, "g", 60, 180),
];

// Hemmagjort som brukar frysas, för manuella poster.
export const HOMEMADE = { tomatsås: 120, "tomatsås till pizza": 120, buljong: 120, fond: 120, pesto: 90 };

const conv = { g: ["g", 1], kg: ["g", 1000], hg: ["g", 100], ml: ["dl", 0.01], cl: ["dl", 0.1], dl: ["dl", 1], l: ["dl", 10], liter: ["dl", 10], msk: ["dl", 0.15], tsk: ["dl", 0.05] };
// Mängd i förpackningens enhet, eller null om enheterna inte går att jämföra.
export function toUnit(q, unit, target) {
  const u = String(unit || "").toLowerCase().trim();
  if (u === target) return q;
  const a = conv[u], b = conv[target];
  if (a && b && a[0] === b[0]) return (q * a[1]) / b[1];
  if (target === "st" && !u) return q;
  return null;
}

export function packFor(name) {
  const n = String(name || "").toLowerCase();
  return PACKAGES.find((p) => p.re.test(n)) || null;
}

// Hur mycket blir kvar när man köper hela förpackningar av det som behövs?
export function leftoverOf(name, q, unit) {
  const p = packFor(name);
  if (!p || q == null) return null;
  const need = toUnit(q, unit, p.unit);
  if (need == null || need <= 0) return null;
  const packs = Math.max(1, Math.ceil(need / p.q - 0.02));
  const left = Math.round((packs * p.q - need) * 10) / 10;
  if (left < p.q * 0.1) return null; // nästan allt går åt
  return { q: left, unit: p.unit, days: p.days, frozen: p.frozen };
}
