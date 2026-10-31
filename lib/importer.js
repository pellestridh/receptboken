import { db } from "@/lib/db";
import { fetchRecipePage } from "@/lib/fetchRecipe";
import { callRecipeTool, cleanRecipe, rules } from "@/lib/claude";

async function categories() {
  try {
    const rows = await db()(`select distinct kitchen, type, base from recipes where deleted_at is null`);
    const pick = (k) => [...new Set(rows.map((r) => r[k]).filter(Boolean))];
    return { kitchen: pick("kitchen"), type: pick("type"), base: pick("base") };
  } catch {
    return {};
  }
}

// files: [{ mediaType, data (base64) }]
export async function importRecipe({ url, text, files = [] }) {
  const content = [];
  let page = null;
  if (url && !text) {
    page = await fetchRecipePage(url);
    text = page.text;
  }
  for (const f of files) {
    if (f.mediaType === "application/pdf") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.data } });
    } else if (/^image\/(jpeg|png|webp|gif)$/.test(f.mediaType)) {
      content.push({ type: "image", source: { type: "base64", media_type: f.mediaType, data: f.data } });
    } else if (f.text) {
      text = [text, f.text].filter(Boolean).join("\n\n---\n\n");
    }
  }
  if (!content.length && !text) throw new Error("Inget recept att läsa. Klistra in en länk, text eller välj en fil.");

  const intro = files.length
    ? "Gör om receptet i bifogade bilder eller filer till receptbokens format."
    : "Gör om receptet nedan till receptbokens format.";
  content.push({
    type: "text",
    text: [
      intro,
      url ? `Källa: ${url}${page?.site ? ` (${page.site})` : ""}. Sätt source.url till länken och source.name till sajtens namn och kockens namn om det framgår.` : "Sätt source.name till kokbokens titel eller kockens namn om det syns, annars lämna source tomt.",
      text ? `\nRECEPTET:\n${text.slice(0, 60000)}` : "",
    ].join("\n"),
  });

  const raw = await callRecipeTool({ system: rules(await categories()), content });
  const r = cleanRecipe(raw);
  if (url) r.source = { ...(r.source || {}), url };
  if (page?.image && !r.image) r.image = page.image;
  return r;
}

export async function reviseRecipe(recipe, instruction) {
  const content = [{
    type: "text",
    text: `Här är ett recept ur receptboken som JSON. Ändra det enligt önskemålet och returnera hela receptet. Ändra bara det som önskemålet gäller, och lägg till en rad i "changes" om vad du ändrade.\n\nÖNSKEMÅL: ${instruction}\n\nRECEPTET:\n${JSON.stringify(recipe)}`,
  }];
  const raw = await callRecipeTool({ system: rules(await categories()), content });
  const r = cleanRecipe(raw);
  if (recipe.source) r.source = recipe.source;
  if (recipe.image && !r.image) r.image = recipe.image;
  r.pairsWith = recipe.pairsWith || [];
  if (recipe.drinks) r.drinks = recipe.drinks;
  return r;
}
