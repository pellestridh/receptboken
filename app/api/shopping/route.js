import { hh } from "@/lib/household";
import { db, rid } from "@/lib/db";
import { ok, fail, body } from "@/lib/http";
import { splitAmount } from "@/lib/amount";
import { listShopping, addShopping } from "@/lib/shoppingDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return ok({ items: await listShopping() }); } catch (e) { return fail(e, 500); }
}

// { items: [{name, unit, q, q2, amt, pantry, from}] } eller { custom: "namn" }
export async function POST(req) {
  try {
    const b = await body(req);
    if (b.custom) {
      // Mängd kan skrivas först eller sist: "2 l mjölk" eller "mjölk 2 l".
      const a = splitAmount(String(b.custom).slice(0, 140));
      const name = a.name.slice(0, 120);
      if (name) await db()(`insert into shopping_items (id,name,aisle,hh,q,q2,unit) values ($1,$2,'Egna varor',$3,$4,$5,$6)`, [rid(), name, hh(), a.q, a.q2, a.unit || ""]);
      return ok({ items: await listShopping() });
    }
    const info = {};
    return ok({ items: await addShopping(b.items, info), covered: info.covered || [] });
  } catch (e) {
    return fail(e);
  }
}

// ?scope=done (avbockade) eller ?scope=all
export async function DELETE(req) {
  try {
    const scope = new URL(req.url).searchParams.get("scope");
    if (scope === "all") await db()(`delete from shopping_items where hh = $1`, [hh()]);
    else await db()(`delete from shopping_items where done and hh = $1`, [hh()]);
    return ok({ items: await listShopping() });
  } catch (e) {
    return fail(e, 500);
  }
}
