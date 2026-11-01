import { ownRecipe } from "@/lib/household";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    await ownRecipe(params.id);
    const [img] = await db()(`select mime, data from recipe_images where recipe_id = $1`, [params.id]);
    if (!img) return new Response("Ingen bild", { status: 404 });
    return new Response(Buffer.from(img.data, "base64"), {
      headers: { "content-type": img.mime, "cache-control": "private, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Fel", { status: 500 });
  }
}
