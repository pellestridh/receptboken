const FR = { 0.25: "¼", 0.5: "½", 0.75: "¾" };

function frac(x, step) {
  x = Math.round(x / step) * step;
  if (x <= 0) x = step;
  const w = Math.floor(x + 1e-9);
  const r = Math.round((x - w) * 100) / 100;
  if (r === 0) return String(w);
  if (FR[r]) return (w ? w : "") + FR[r];
  return String(x).replace(".", ",");
}

export function fmtQ(x, unit) {
  if (x == null) return "";
  if (unit === "g" || unit === "ml") { const v = Math.round(x / 5) * 5; return String(v < 5 ? 5 : v); }
  if (unit === "kg" || unit === "l") return String(Math.round(x * 10) / 10).replace(".", ",");
  if (unit === "" || unit === "st") return frac(x, 0.5);
  return frac(x, 0.25);
}

export function amtText(it, f = 1) {
  if (it.q == null) return it.amt || "";
  let a = fmtQ(it.q * f, it.unit);
  if (it.q2 != null) a += "–" + fmtQ(it.q2 * f, it.unit);
  return a + (it.unit ? " " + it.unit : "");
}

export function mins(m) {
  m = m || 0;
  return m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`;
}

export function mmss(s) {
  s = Math.max(0, Math.ceil(s));
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

export function dateSv(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }); } catch { return ""; }
}

export function daysSince(iso) {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export const accentVar = (a) => `var(--c-${a || "ember"})`;

export function stepItem(it) {
  return typeof it === "string" ? { t: it } : it;
}
