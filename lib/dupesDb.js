import { db } from "@/lib/db";
import { findDuplicate } from "@/lib/dupes";

// Letar bland sparade recept och väntande utkast.
export async function duplicateOf({ url, title }) {
  const sql = db();
  const recipes = await sql(`select id, title, source_url as "sourceUrl" from recipes where deleted_at is null`);
  const r = findDuplicate(recipes, { url, title });
  if (r) return { kind: "recipe", id: r.id, title: r.title, why: r.why };
  const drafts = await sql(`select id, body->>'title' as title, source_url as "sourceUrl" from drafts`);
  const d = findDuplicate(drafts, { url, title });
  if (d) return { kind: "draft", id: d.id, title: d.title, why: d.why };
  return null;
}
