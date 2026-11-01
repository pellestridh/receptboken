// Känner igen recept som redan finns: samma källänk eller i praktiken samma rubrik.
// Rena funktioner, används både i webbläsaren och på servern.

export function normUrl(u) {
  try {
    const x = new URL(String(u).trim());
    const host = x.hostname.toLowerCase().replace(/^(www|m)\./, "");
    const path = decodeURIComponent(x.pathname).toLowerCase().replace(/\/(amp|print)\/?$/, "").replace(/\/+$/, "");
    const keep = [...x.searchParams].filter(([k]) => /^(id|p|recipe|recept)$/i.test(k)).map(([k, v]) => `${k}=${v}`).join("&");
    return host + path + (keep ? "?" + keep : "");
  } catch {
    return "";
  }
}

const STOP = new Set(["med", "och", "i", "på", "a", "la", "al", "alla", "à", "recept", "enkel", "enkelt", "god", "goda", "gott", "klassisk", "klassiska", "min", "mammas", "bästa", "snabb", "snabba", "hemmagjord", "hemmagjorda"]);
const words = (t) => String(t || "").toLowerCase().normalize("NFC")
  .replace(/[^a-zåäöéèüàâç0-9\s-]/g, " ").split(/[\s-]+/).filter((w) => w && !STOP.has(w));

export function sameTitle(a, b) {
  const A = words(a), B = words(b);
  if (!A.length || !B.length) return false;
  if (A.join(" ") === B.join(" ")) return true;
  const sa = new Set(A), sb = new Set(B);
  const inter = [...sa].filter((w) => sb.has(w)).length;
  // "Kyckling med misomajonnäs" och "Grillad kyckling med misomajonnäs"
  const small = Math.min(sa.size, sb.size), big = Math.max(sa.size, sb.size);
  if (small >= 2 && inter === small && big - small <= 1) return true;
  return inter / new Set([...sa, ...sb]).size >= 0.75;
}

// recipes: [{ id, title, sourceUrl }]
export function findDuplicate(recipes, { url, title }) {
  const nu = url ? normUrl(url) : "";
  if (nu) {
    const hit = recipes.find((r) => r.sourceUrl && normUrl(r.sourceUrl) === nu);
    if (hit) return { ...hit, why: "url" };
  }
  if (title) {
    const hit = recipes.find((r) => sameTitle(r.title, title));
    if (hit) return { ...hit, why: "title" };
  }
  return null;
}
