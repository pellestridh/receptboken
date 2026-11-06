// Tolkar en mängd som skrivs för hand i inköpslistan, till exempel "2", "500 g", "1,5 l" eller "2–3 st".
// Ingen "@/"-import här, används både i webbläsaren och på servern.
export const UNITS = ["st", "g", "kg", "hg", "ml", "cl", "dl", "l", "msk", "tsk", "krm", "förp", "paket", "pkt", "burk", "burkar", "flaska", "flaskor", "påse", "påsar", "knippe", "kruka", "krukor", "klyftor", "skivor", "liter"];
const num = (s) => Number(String(s).replace(",", "."));
const NUM = String.raw`(\d+(?:[.,]\d+)?|½|¼)`;
const frac = (s) => (s === "½" ? 0.5 : s === "¼" ? 0.25 : num(s));

// Hela strängen är en mängd: { q, q2, unit } eller { amt } för fri text som "en näve". Tom sträng tar bort mängden.
export function parseAmount(str) {
  const s = String(str || "").trim().toLowerCase();
  if (!s) return { q: null, q2: null, unit: "", amt: "" };
  const m = s.match(new RegExp(`^${NUM}(?:\\s*[-–]\\s*${NUM})?\\s*([a-zåäö.]*)$`));
  if (m && (!m[3] || UNITS.includes(m[3].replace(/\.$/, "")))) {
    return { q: frac(m[1]), q2: m[2] ? frac(m[2]) : null, unit: (m[3] || "").replace(/\.$/, "").replace(/^liter$/, "l"), amt: "" };
  }
  return { q: null, q2: null, unit: "", amt: String(str).trim().slice(0, 30) };
}

// En egen vara med mängd först eller sist: "2 l mjölk", "mjölk 2 l", "3 avokado".
export function splitAmount(str) {
  const s = String(str || "").trim();
  const u = UNITS.join("|");
  let m = s.match(new RegExp(`^${NUM}(?:\\s*[-–]\\s*${NUM})?\\s*(?:(${u})\\.?\\s+)?(.+)$`, "i"));
  if (m && m[4]) return { name: m[4].trim(), q: frac(m[1]), q2: m[2] ? frac(m[2]) : null, unit: (m[3] || "").toLowerCase().replace(/^liter$/, "l") };
  m = s.match(new RegExp(`^(.+?)\\s+${NUM}(?:\\s*[-–]\\s*${NUM})?\\s*(${u})?\\.?$`, "i"));
  if (m) return { name: m[1].trim(), q: frac(m[2]), q2: m[3] ? frac(m[3]) : null, unit: (m[4] || "").toLowerCase().replace(/^liter$/, "l") };
  return { name: s, q: null, q2: null, unit: "" };
}
