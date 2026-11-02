import { askJson } from "@/lib/claude";
import { ok, fail, body } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Läser av en fotograferad receptsida till text. { data: base64-jpeg, n, of }
export async function POST(req) {
  try {
    const { data, n = 1, of = 1 } = await body(req);
    if (!data) throw new Error("Ingen bild kom med.");
    const out = await askJson({
      system: `Du skriver av en fotograferad sida ur en kokbok eller ett recept, ordagrant på originalspråket. Ta med rubrik, portioner, ingredienser med mängder och alla steg. Behåll radbrytningar i ingredienslistan. Hoppa över sidnummer och sådant som inte hör till receptet. Svara bara med JSON: {"text": "..."}`,
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data } },
        { type: "text", text: `Sida ${n} av ${of}. Skriv av texten.` },
      ],
      schema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
      toolName: "page_text", maxTokens: 4000, textOnly: true,
    });
    const text = String(out?.text || "").trim();
    if (text.length < 20) throw new Error(`Sida ${n} gick inte att läsa. Fota rakare och i bättre ljus.`);
    return ok({ text });
  } catch (e) {
    return fail(e);
  }
}
