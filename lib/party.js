// Hur mycket ska vi laga? Tumregler för buffé, mingel och middag.
// Ju fler rätter, desto mindre av varje. Plockmat räknas i bitar: 3–5 bitar per person som tilltugg,
// 10–15 om plockmaten är hela måltiden. En portion förrätt eller plockmat är ungefär 4 bitar, en portion varmrätt ungefär 10.
import { dishesOf } from "@/lib/dishes";

export const EVENTS = [
  { key: "buffe", name: "Buffé som middag", hint: "Gästerna tar lite av allt. Varje rätt räcker längre än receptet säger." },
  { key: "mingel", name: "Mingel och plockmat", hint: "Plockmaten är hela måltiden. Räkna med 10–15 bitar per person." },
  { key: "tilltugg", name: "Tilltugg före middagen", hint: "Bara något att smaka på. Räkna med 3–5 bitar per person." },
  { key: "middag", name: "Sittande middag", hint: "En portion per person och rätt." },
];

const ROLE_NAME = { varm: "Varmrätt", sida: "Sallad och tillbehör", brod: "Bröd", plock: "Plockmat", dessert: "Dessert" };
export function roleOf(r) {
  const d = dishesOf(r), t = String(r.type || "").toLowerCase();
  if (d.includes("dessert") || /dessert|efterrätt/.test(t)) return "dessert";
  if (d.includes("plock") || d.includes("forratt") || /förrätt|smårätt/.test(t)) return "plock";
  if (d.includes("brod") || /bröd|bak/.test(t)) return "brod";
  if (d.includes("sallad") || d.includes("tillbehor") || /tillbehör|sås|sallad/.test(t)) return "sida";
  return "varm";
}
export const roleName = (k) => ROLE_NAME[k];

const BUFFE = { varm: 1.25, sida: 1, brod: 0.6, plock: 0.6, dessert: 1 };
const MIDDAG = { varm: 1, sida: 1, brod: 0.5, plock: 1, dessert: 1 };
const PIECES = { mingel: 12, tilltugg: 4 };
const pieceUnit = (u) => /bit|st\b|styck|spett|snittar|pinnar|bollar/i.test(String(u || ""));

// Returnerar för varje recept hur många portioner (eller bitar) det ska göras för.
export function plan(recipes, guests, event) {
  const g = Math.max(1, guests | 0);
  const roles = recipes.map(roleOf);
  const count = (k) => roles.filter((x) => x === k).length || 1;
  return recipes.map((r, i) => {
    const role = roles[i];
    let portions, note;
    if (PIECES[event] && role !== "dessert") {
      const others = roles.filter((x) => x !== "dessert").length || 1;
      const pieces = Math.ceil((g * PIECES[event]) / others);
      if (pieceUnit(r.servingsUnit)) { portions = pieces; note = `${pieces} ${r.servingsUnit}`; }
      else { const per = role === "varm" ? 10 : role === "brod" ? 6 : 4; portions = Math.max(1, Math.ceil(pieces / per)); note = `cirka ${pieces} bitar`; }
    } else {
      const F = event === "middag" ? MIDDAG : event === "buffe" ? BUFFE : { dessert: 0.8 };
      const share = (g * (F[role] ?? 1)) / count(role);
      portions = Math.max(Math.ceil(share), Math.ceil(g * (event === "middag" ? 0.5 : 0.35)));
      note = null;
    }
    const factor = portions / (r.servings || 4);
    return { r, role, portions, factor, note };
  });
}

// Dryck: två glas första timmen, sedan ett i timmen per person. Vinflaska ungefär fem glas.
export function drinks(guests, hours) {
  const glasses = Math.max(0, Math.round(guests * (hours > 0 ? 1 + hours : 0)));
  return {
    glasses,
    wine: Math.ceil((glasses * 0.5) / 5),
    beer: Math.ceil(glasses * 0.3),
    soft: Math.ceil((glasses * 0.2 * 0.25) * 10) / 10,
  };
}
