// Tar emot en länk från iOS-genvägen "Till Receptboken". Receptet läses in och läggs
// som utkast som väntar på granskning i appen. Skyddas med SHORTCUT_KEY.
import { db, rid } from "@/lib/db";
import { importRecipe } from "@/lib/importer";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function text(msg, status = 200) {
  return new Response(msg, { status, headers: { "content-type": "text/plain; charset=utf-8" } });
}

async function handle(key, url, pasted) {
  if (!process.env.SHORTCUT_KEY || key !== process.env.SHORTCUT_KEY) return text("Fel nyckel i genvägen.", 401);
  const link = (url || "").match(/https?:\/\/\S+/)?.[0];
  if (!link && !pasted) return text("Ingen länk kom med.", 400);
  try {
    const recipe = await importRecipe({ url: link || null, text: pasted || null });
    await db()(`insert into drafts (id, body, source_url) values ($1, $2, $3)`, [rid(), JSON.stringify(recipe), link || null]);
    return text(`${recipe.title} väntar på granskning i Receptboken.`);
  } catch (e) {
    return text(`Det gick inte: ${e.message}`, 400);
  }
}

export async function POST(req) {
  const u = new URL(req.url);
  let b = {};
  try { b = await req.json(); } catch {}
  return handle(b.key || u.searchParams.get("key"), b.url || u.searchParams.get("url"), b.text);
}

export async function GET(req) {
  const u = new URL(req.url);
  return handle(u.searchParams.get("key"), u.searchParams.get("url"), null);
}
