import { db, saveRecipe, uniqueSlug } from "@/lib/db";

// Kopierar ett recept (med bild) till ett hushåll. Dryckesförslag följer inte med,
// de lär sig av varje hushålls egen smak.
export async function copyRecipe(fromId, toHh) {
  const sql = db();
  const [r] = await sql(`select body from recipes where id = $1 and deleted_at is null`, [fromId]);
  if (!r) throw new Error("Receptet finns inte.");
  const copy = { ...r.body };
  delete copy.drinks;
  delete copy.allergens;
  const id = await uniqueSlug(copy.title);
  const [img] = await sql(`select mime, data from recipe_images where recipe_id = $1`, [fromId]);
  if (img) {
    await sql(`insert into recipe_images (recipe_id, mime, data, updated_at) values ($1,$2,$3,now()) on conflict (recipe_id) do nothing`, [id, img.mime, img.data]);
    copy.image = `/api/images/${id}?v=1`;
  }
  await saveRecipe(id, { ...copy, __hh: toHh });
  return id;
}
