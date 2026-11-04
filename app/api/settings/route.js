import { ok, fail, body } from "@/lib/http";
import { readSettings, writeSetting, publicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return ok({ settings: await publicSettings() }); } catch (e) { return fail(e, 500); }
}

// { lightKcal? } | { allergies?: [{who, what}] }
export async function POST(req) {
  try {
    const b = await body(req);
    if (b.lightKcal != null) {
      await writeSetting("lightKcal", Math.max(100, Math.min(2000, Math.round(Number(b.lightKcal) || 500))));
    }
    if (Array.isArray(b.allergies)) {
      const list = b.allergies
        .map((a) => ({ who: String(a.who || "").trim().slice(0, 40), what: String(a.what || "").trim().slice(0, 60) }))
        .filter((a) => a.what)
        .slice(0, 30);
      await writeSetting("allergies", list);
    }
    if (Array.isArray(b.stores)) {
      const list = b.stores.map((x) => ({ name: String(x.name || "").trim().slice(0, 60), url: String(x.url || "").trim().slice(0, 300) }))
        .filter((x) => x.name && /^https:\/\/(www\.)?(ica|willys|coop|hemkop|lidl)\.se\//.test(x.url)).slice(0, 6)
        .map((x) => ({ ...x, key: x.url.replace(/^https:\/\/(www\.)?/, "").replace(/[^a-z0-9]+/gi, "-").replace(/-+$/, "").slice(0, 60) }));
      await writeSetting("stores", list);
    }
    if (typeof b.drinkTaste === "string") await writeSetting("drinkTaste", b.drinkTaste.trim().slice(0, 800));
    if (typeof b.shareInspiration === "boolean") await writeSetting("shareInspiration", b.shareInspiration);
    for (const pk of ["wineProgress", "beerProgress"]) if (b[pk] && typeof b[pk] === "object") {
      const cur = (await readSettings())[pk] || {};
      const [k, v] = Object.entries(b[pk])[0] || [];
      if (k) await writeSetting(pk, { ...cur, [String(k).slice(0, 30)]: { done: !!v?.done, quiz: Number(v?.quiz) || 0, at: new Date().toISOString() } });
    }
    return ok({ settings: await publicSettings() });
  } catch (e) {
    return fail(e);
  }
}
