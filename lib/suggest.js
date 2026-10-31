// Förslagslogik för matsedlar. Används både på servern (ny meny) och i appen (Byt).
// recipes: sammanfattningar från /api/recipes (type, minutes, rating, lastCooked, kitchen, base, timesCooked)

const DAY = 86400000;
const daysSince = (iso) => (iso ? (Date.now() - new Date(iso).getTime()) / DAY : Infinity);

function rng(seed) {
  let s = seed % 233280 || 1;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// mode: "vardag" | "helg" | "forratt" | "varmratt" | "dessert"
export function suggest(recipes, { mode = "vardag", exclude = [], chosen = [], seed = Date.now() } = {}) {
  const r = rng(Math.floor(seed));
  const ex = new Set(exclude);
  const isType = (x, t) => (x.type || "Huvudrätt").toLowerCase().includes(t);
  let pool = recipes.filter((x) => !ex.has(x.id));
  if (mode === "forratt") pool = pool.filter((x) => isType(x, "förrätt"));
  else if (mode === "dessert") pool = pool.filter((x) => isType(x, "dessert") || isType(x, "efterrätt"));
  else pool = pool.filter((x) => isType(x, "huvudrätt"));
  if (!pool.length) return null;

  const kitchens = chosen.map((c) => c.kitchen), bases = chosen.map((c) => c.base);
  const scored = pool.map((x) => {
    const since = daysSince(x.lastCooked);
    let s = r() * 2;
    s += (x.rating || 0) * 0.5;
    if (since < 14) s -= 4;
    else s += Math.min(since, 90) / 30;
    if (mode === "vardag") s += (x.minutes || 60) <= 40 ? 2 : (x.minutes || 60) <= 60 ? 0 : -3;
    if (mode === "helg") {
      if ((x.rating || 0) >= 4 && since >= 30) s += 2; // favorit som inte lagats på länge
      if (!x.timesCooked) s += 1.5;                    // något ni inte provat
    }
    s -= kitchens.filter((k) => k && k === x.kitchen).length * 1.2;
    s -= bases.filter((b) => b && b === x.base).length * 1.5;
    return { x, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0].x;
}

export function suggestMany(recipes, modes, seed = Date.now()) {
  const chosen = [];
  return modes.map((mode, i) => {
    const pick = suggest(recipes, { mode, exclude: chosen.map((c) => c.id), chosen, seed: seed + i * 7919 });
    if (pick) chosen.push(pick);
    return pick;
  });
}

// Datum för en ny meny
export function menuDays(kind, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const dow = (d.getDay() + 6) % 7; // 0 = måndag
  const add = (n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  if (kind === "vecka") {
    const start = dow >= 3 ? add(7 - dow) : add(-dow); // från torsdag planeras nästa vecka
    return [0, 1, 2, 3].map((i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  if (kind === "helg") {
    const fri = dow <= 4 ? add(4 - dow) : add(4 - dow + 7);
    if (dow === 5 || dow === 6) return dow === 5 ? [add(0), add(1)] : [add(0)];
    return [0, 1, 2].map((i) => new Date(fri.getFullYear(), fri.getMonth(), fri.getDate() + i));
  }
  const sat = dow <= 5 ? add(5 - dow) : add(6);
  return [sat];
}

export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function weekNumber(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y) / DAY + 1) / 7);
}
