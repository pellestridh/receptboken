import { askJson } from "@/lib/claude";
import { readSettings, allergyText } from "@/lib/settings";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// { ingredient, menu: [titlar] } -> tre idéer på rätter som använder resten av råvaran
export async function POST(req) {
  try {
    const { ingredient, menu = [] } = await body(req);
    const ing = String(ingredient || "").trim().slice(0, 60);
    if (!ing) throw new Error("Ingen råvara angiven.");
    const { allergies } = await readSettings();
    const out = await askJson({
      system: `Du hjälper en svensk familj att använda upp råvaror. Föreslå tre olika middagsrätter som använder ${ing}, gärna en svensk vardagsrätt, en från ett annat kök och en snabb. Rätterna ska inte likna dem som redan finns på veckans meny. ${allergyText(allergies)} Svara bara med JSON: {"ideas":[{"title":"...","why":"en mening om rätten och hur mycket ${ing} den använder","minutes":30}]}`,
      content: `Veckans meny: ${menu.slice(0, 10).join(", ") || "tom"}.`,
      schema: { type: "object", properties: { ideas: { type: "array", items: { type: "object", properties: { title: { type: "string" }, why: { type: "string" }, minutes: { type: "integer" } }, required: ["title"] } } }, required: ["ideas"] },
      toolName: "ideas", maxTokens: 800, textOnly: true,
    });
    const ideas = (Array.isArray(out?.ideas) ? out.ideas : []).slice(0, 3).map((x) => ({ title: String(x.title || "").slice(0, 80), why: String(x.why || "").slice(0, 220), minutes: Number(x.minutes) || null })).filter((x) => x.title);
    if (!ideas.length) throw new Error("Claude hittade inga idéer just nu. Försök igen.");
    return ok({ ideas });
  } catch (e) {
    return fail(e);
  }
}
