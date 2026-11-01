import { ok, fail, body } from "@/lib/http";
import { readSettings, writeSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return ok({ settings: await readSettings() }); } catch (e) { return fail(e, 500); }
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
    if (typeof b.shareInspiration === "boolean") await writeSetting("shareInspiration", b.shareInspiration);
    if (b.wineProgress && typeof b.wineProgress === "object") {
      const cur = (await readSettings()).wineProgress || {};
      const [k, v] = Object.entries(b.wineProgress)[0] || [];
      if (k) await writeSetting("wineProgress", { ...cur, [String(k).slice(0, 30)]: { done: !!v?.done, quiz: Number(v?.quiz) || 0, at: new Date().toISOString() } });
    }
    return ok({ settings: await readSettings() });
  } catch (e) {
    return fail(e);
  }
}
