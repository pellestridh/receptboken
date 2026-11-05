// Kvar hemma: rester efter köp och sådant man själv lägger in, till exempel fryst tomatsås.
import { db, rid } from "@/lib/db";
import { hh } from "@/lib/household";
import { leftoverOf, packFor, toUnit, HOMEMADE } from "@/lib/packages";

const day = 864e5;
const r1 = (x) => (x == null ? null : Math.round(Number(x) * 10) / 10);
const row = (r) => ({ id: r.id, name: r.name, q: r.q == null ? null : Number(r.q), unit: r.unit || "", useBy: r.use_by, frozen: r.frozen, fromShop: !!r.shop_id, createdAt: r.created_at });

export async function listPantry() {
  const rows = await db()(`select * from pantry where hh = $1 order by frozen, use_by nulls last, name`, [hh()]);
  return rows.map(row);
}

// Samma vara: samma namn, eller samma förpackningssort (mozzarella i bitar = mozzarella).
const same = (a, b) => { const x = a.toLowerCase().trim(), y = b.toLowerCase().trim(); if (x === y) return true; const p = packFor(x); return !!p && p === packFor(y); };

// Avbockad vara i inköpslistan: lägg det som blir över i Kvar hemma.
export async function onBought(item) {
  const left = leftoverOf(item.name, item.q == null ? null : Number(item.q), item.unit);
  if (!left) return null;
  const id = rid();
  await db()(`insert into pantry (id, hh, name, q, unit, use_by, shop_id) values ($1,$2,$3,$4,$5,$6,$7)`,
    [id, hh(), item.name, left.q, left.unit, new Date(Date.now() + left.days * day).toISOString(), item.id]);
  return id;
}
export async function onUnbought(shopId) {
  await db()(`delete from pantry where shop_id = $1 and hh = $2`, [shopId, hh()]);
}

// Före inköpslistan: dra av det som finns hemma. Returnerar det som ska köpas och det som täcktes.
export async function coverFromPantry(items) {
  const sql = db();
  const stock = await listPantry();
  const out = [], covered = [];
  for (const it of items || []) {
    if (!it?.name || it.pantry) { out.push(it); continue; }
    const p = stock.find((s) => (s.q == null || s.q > 0) && same(s.name, it.name));
    if (!p) { out.push(it); continue; }
    if (it.q == null || p.q == null) { covered.push(it.name); continue; } // finns hemma, mängden okänd: köp inte
    const need = toUnit(Number(it.q), it.unit, p.unit);
    if (need == null) { out.push(it); continue; }
    const use = Math.min(need, p.q);
    p.q = r1(p.q - use);
    if (p.q <= 0.05) await sql(`delete from pantry where id = $1 and hh = $2`, [p.id, hh()]);
    else await sql(`update pantry set q = $2 where id = $1 and hh = $3`, [p.id, p.q, hh()]);
    covered.push(it.name);
    if (need - use > 0.05) out.push({ ...it, q: toUnit(need - use, p.unit, String(it.unit || p.unit).toLowerCase()) ?? null, unit: it.unit });
  }
  return { items: out, covered };
}

export async function addPantry({ name, q, unit, frozen }) {
  const n = String(name || "").trim().slice(0, 80);
  if (!n) throw new Error("Skriv vad som finns hemma.");
  const p = packFor(n);
  const keep = frozen ? (HOMEMADE[n.toLowerCase()] || p?.frozen || 90) : (p?.days ?? 7);
  await db()(`insert into pantry (id, hh, name, q, unit, use_by, frozen) values ($1,$2,$3,$4,$5,$6,$7)`,
    [rid(), hh(), n, q == null || q === "" ? null : r1(q), String(unit || "").slice(0, 20), new Date(Date.now() + keep * day).toISOString(), !!frozen]);
}

export async function updatePantry(id, b) {
  const sql = db();
  if (b.remove) return sql(`delete from pantry where id = $1 and hh = $2`, [id, hh()]);
  if (b.freeze != null) {
    const [r] = await sql(`select name from pantry where id = $1 and hh = $2`, [id, hh()]);
    const p = packFor(r?.name || "");
    const keep = b.freeze ? (HOMEMADE[String(r?.name || "").toLowerCase()] || p?.frozen || 90) : (p?.days ?? 3);
    return sql(`update pantry set frozen = $2, use_by = $3 where id = $1 and hh = $4`, [id, !!b.freeze, new Date(Date.now() + keep * day).toISOString(), hh()]);
  }
  if (b.q != null) return sql(`update pantry set q = $2 where id = $1 and hh = $3`, [id, r1(b.q), hh()]);
}
