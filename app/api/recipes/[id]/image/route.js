import { db } from "@/lib/db";
import { fetchImageFor } from "@/lib/fetchRecipe";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";

async function setImage(id, url) {
  await db()(
    `update recipes set image_url = $2, updated_at = now(),
       body = case when $2::text is null then body - 'image' else jsonb_set(body, '{image}', to_jsonb($2::text)) end
     where id = $1`,
    [id, url]
  );
}

// { data, mime } = egen bild (base64, redan förminskad i webbläsaren)
// { fromSource: true } = hämta bilden från receptets källsida
// { remove: true } = ta bort bilden
export async function POST(req, { params }) {
  try {
    const sql = db();
    const id = params.id;
    const b = await body(req);
    if (b.remove) {
      await sql(`delete from recipe_images where recipe_id = $1`, [id]);
      await setImage(id, null);
      return ok({ image: null });
    }
    if (b.fromSource) {
      const [r] = await sql(`select source_url from recipes where id = $1`, [id]);
      if (!r?.source_url) throw new Error("Receptet har ingen källänk.");
      const img = await fetchImageFor(r.source_url);
      if (!img) throw new Error("Källsidan hade ingen bild som gick att hämta.");
      await setImage(id, img);
      return ok({ image: img });
    }
    if (!b.data || !/^image\/(jpeg|png|webp)$/.test(b.mime || "")) throw new Error("Bilden gick inte att läsa.");
    if (b.data.length > 3_000_000) throw new Error("Bilden är för stor.");
    await sql(
      `insert into recipe_images (recipe_id, mime, data, updated_at) values ($1,$2,$3,now())
       on conflict (recipe_id) do update set mime = $2, data = $3, updated_at = now()`,
      [id, b.mime, b.data]
    );
    const url = `/api/images/${id}?v=${Date.now()}`;
    await setImage(id, url);
    return ok({ image: url });
  } catch (e) {
    return fail(e);
  }
}
