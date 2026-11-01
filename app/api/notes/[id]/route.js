import { ownRecipe } from "@/lib/household";
import { db, rid } from "@/lib/db";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

// action: "rate" {rating} | "cooked" | "entry" {text, author} | "delentry" {entryId}
export async function POST(req, { params }) {
  try {
    const sql = db();
    const id = params.id;
    const b = await body(req);
    await ownRecipe(id);
    await sql(`insert into notes (recipe_id) values ($1) on conflict do nothing`, [id]);
    if (b.action === "rate") {
      const v = Math.max(0, Math.min(5, Math.round(Number(b.rating) || 0)));
      await sql(`update notes set rating = $2 where recipe_id = $1`, [id, v]);
    } else if (b.action === "cooked") {
      await sql(`update notes set times_cooked = times_cooked + 1, last_cooked = now() where recipe_id = $1`, [id]);
    } else if (b.action === "uncooked") {
      await sql(`update notes set times_cooked = greatest(times_cooked - 1, 0) where recipe_id = $1`, [id]);
    } else if (b.action === "entry") {
      const text = String(b.text || "").trim().slice(0, 4000);
      if (!text) throw new Error("Anteckningen är tom.");
      await sql(`insert into note_entries (id, recipe_id, author, text) values ($1,$2,$3,$4)`, [rid(), id, String(b.author || "").slice(0, 40), text]);
    } else if (b.action === "delentry") {
      await sql(`delete from note_entries where id = $1 and recipe_id = $2`, [String(b.entryId), id]);
    } else {
      throw new Error("Okänd åtgärd.");
    }
    const [n] = await sql(`select rating, times_cooked, last_cooked from notes where recipe_id = $1`, [id]);
    const entries = await sql(`select id, author, text, created_at from note_entries where recipe_id = $1 order by created_at desc`, [id]);
    return ok({ notes: { rating: n?.rating || 0, timesCooked: n?.times_cooked || 0, lastCooked: n?.last_cooked || null, entries } });
  } catch (e) {
    return fail(e);
  }
}
