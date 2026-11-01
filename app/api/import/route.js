import { importRecipe } from "@/lib/importer";
import { ok, fail, body } from "@/lib/http";
import { duplicateOf } from "@/lib/dupesDb";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// { url?, text?, files?: [{ mediaType, data (base64) | text }] }
export async function POST(req) {
  try {
    const { url, text, files, force } = await body(req);
    // Samma länk finns redan: säg det innan Claude läser in något.
    if (url?.trim() && !force) {
      const duplicate = await duplicateOf({ url: url.trim() });
      if (duplicate) return ok({ duplicate });
    }
    const recipe = await importRecipe({
      url: url?.trim() || null,
      text: text?.trim() || null,
      files: Array.isArray(files) ? files.slice(0, 8) : [],
    });
    return ok({ recipe });
  } catch (e) {
    return fail(e);
  }
}
