// Näringsvärden från Livsmedelsverkets livsmedelsdatabas (CC BY 4.0).
// API:t saknar namnsökning, så hela listan (ca 2 500 livsmedel) cachas i databasen och söks här.
import { db } from "@/lib/db";

const BASE = "https://dataportal.livsmedelsverket.se/livsmedel/api/v1";

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Livsmedelsverket svarade ${res.status}`);
  return res.json();
}

const arr = (j) => (Array.isArray(j) ? j : j?.livsmedel || j?.data || j?.items || j?.naringsvarden || []);
const val = (o, ...keys) => { for (const k of keys) { const v = o?.[k] ?? o?.[k.charAt(0).toUpperCase() + k.slice(1)]; if (v != null) return v; } return null; };

export async function ensureFoods() {
  const sql = db();
  const [{ count }] = await sql(`select count(*)::int as count from foods`);
  if (count > 1000) return;
  for (let offset = 0; offset < 5000; offset += 500) {
    const page = arr(await getJson(`${BASE}/livsmedel?offset=${offset}&limit=500`));
    if (!page.length) break;
    const rows = page.map((f) => [Number(val(f, "nummer")), String(val(f, "namn") || "")]).filter(([n, m]) => n && m);
    if (rows.length) {
      await sql(
        `insert into foods (nummer, namn) select * from unnest($1::int[], $2::text[]) on conflict (nummer) do update set namn = excluded.namn`,
        [rows.map((r) => r[0]), rows.map((r) => r[1])]
      );
    }
    if (page.length < 500) break;
  }
}

const norm = (s) => s.toLowerCase().normalize("NFC").replace(/[^a-zåäöéü0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export async function candidatesFor(names) {
  const foods = await db()(`select nummer, namn from foods`);
  const prepared = foods.map((f) => ({ ...f, n: norm(f.namn) }));
  return names.map((name) => {
    const words = norm(name).split(" ").filter((w) => w.length > 2);
    if (!words.length) return [];
    const scored = prepared.map((f) => {
      let s = 0;
      for (const w of words) {
        const stem = w.replace(/(ar|er|or|na|en|et|n)$/, "");
        if (f.n.startsWith(w) || f.n.startsWith(stem)) s += 3;
        else if (f.n.includes(" " + stem) || f.n.includes(stem)) s += 1.5;
      }
      if (s > 0) s -= f.n.length / 80; // kortare namn = mer grundläggande livsmedel
      if (/\brå\b|\bfärsk\b/.test(f.n)) s += 0.4;
      return { nummer: f.nummer, namn: f.namn, s };
    }).filter((x) => x.s > 0);
    scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, 6).map(({ nummer, namn }) => ({ nummer, namn }));
  });
}

export async function nutrientsFor(nummer) {
  const sql = db();
  const [c] = await sql(`select kcal, protein, carbs, fat from food_nutrients where nummer = $1`, [nummer]);
  if (c) return c;
  const list = arr(await getJson(`${BASE}/livsmedel/${nummer}/naringsvarden`));
  const num = (x) => { const v = Number(String(x ?? "").replace(",", ".")); return Number.isFinite(v) ? v : null; };
  const find = (test) => { const n = list.find(test); return n ? num(val(n, "varde")) : null; };
  const code = (n) => String(val(n, "euroFIRkod") || "").toUpperCase();
  const name = (n) => String(val(n, "namn") || "").toLowerCase();
  const unit = (n) => String(val(n, "enhet") || "").toLowerCase();
  const out = {
    kcal: find((n) => (code(n) === "ENERC" && unit(n) === "kcal") || name(n).includes("energi (kcal)")),
    protein: find((n) => code(n) === "PROT" || name(n) === "protein"),
    carbs: find((n) => ["CHO", "CHOAVL"].includes(code(n)) || name(n).startsWith("kolhydrater")),
    fat: find((n) => code(n) === "FAT" || name(n).startsWith("fett")),
  };
  if (out.kcal == null) throw new Error("Saknar energivärde");
  await sql(`insert into food_nutrients (nummer, kcal, protein, carbs, fat) values ($1,$2,$3,$4,$5) on conflict (nummer) do nothing`,
    [nummer, out.kcal, out.protein, out.carbs, out.fat]);
  return out;
}
