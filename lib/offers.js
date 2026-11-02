import { db } from "@/lib/db";
import { askJson } from "@/lib/claude";
import { readSettings } from "@/lib/settings";

export const DEFAULT_STORES = [
  { key: "ica-maxi-eskilstuna", name: "Maxi ICA Eskilstuna", url: "https://www.ica.se/erbjudanden/maxi-ica-stormarknad-eskilstuna-1004513/" },
  { key: "ica-kvantum-ekangen", name: "ICA Kvantum Ekängen", url: "https://www.ica.se/erbjudanden/ica-kvantum-ekangen-1004152/" },
  { key: "willys-ehandel", name: "Willys", url: "https://www.willys.se/erbjudanden/ehandel" },
];

export async function stores() {
  const s = await readSettings();
  return Array.isArray(s.stores) && s.stores.length ? s.stores : DEFAULT_STORES;
}

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

function htmlText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h\d|\/article|\/section)[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<")
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
}

async function get(url, json) {
  const r = await fetch(url, { headers: { "user-agent": UA, accept: json ? "application/json" : "text/html", "accept-language": "sv-SE,sv;q=0.9" }, cache: "no-store" });
  if (!r.ok) throw new Error(`Butikens sida svarade ${r.status}.`);
  return json ? r.json() : r.text();
}

// Willys (Axfood) har ett sökgränssnitt för kampanjer. Fälten läses tolerant.
async function willysLines(url) {
  const online = /ehandel/.test(url);
  const storeId = url.match(/butik[^0-9]*(\d{3,5})/)?.[1];
  const api = online || !storeId
    ? "https://www.willys.se/search/campaigns/online?q=&type=PERSONAL_GENERAL&page=0&size=500"
    : `https://www.willys.se/search/campaigns/offline?q=${storeId}&type=PERSONAL_GENERAL&page=0&size=500`;
  const d = await get(api, true);
  const list = d.results || d.products || d.items || [];
  if (!list.length) throw new Error("Willys gav inga erbjudanden.");
  return list.map((p) => {
    const pr = (p.potentialPromotions || p.promotions || [])[0] || {};
    return [p.name, p.manufacturer || p.brand, p.displayVolume || p.productLine2, p.priceValue ? `ord ${p.priceValue} kr` : p.price,
      pr.conditionLabel || pr.rewardLabel || pr.description, pr.comparePrice || p.comparePrice, pr.validUntil ? `t.o.m. ${String(pr.validUntil).slice(0, 10)}` : "",
      pr.campaignType === "LOYALTY" || /klubb|medlem/i.test(JSON.stringify(pr)) ? "Willys Plus" : ""].filter(Boolean).join(" | ");
  }).join("\n");
}

async function pageText(url) {
  if (/willys\.se/.test(url)) return willysLines(url);
  const html = await get(url, false);
  let t = htmlText(html);
  const i = t.search(/erbjudanden/i);
  if (i > 0) t = t.slice(Math.max(0, i - 200));
  if (t.length < 400) throw new Error("Sidan innehöll inga erbjudanden som gick att läsa.");
  return t.slice(0, 90000);
}

const SCHEMA = {
  type: "object",
  properties: {
    validTo: { type: "string", description: "Sista giltighetsdag om den framgår, ÅÅÅÅ-MM-DD, annars tom" },
    offers: { type: "array", items: { type: "object", properties: {
      name: { type: "string" }, brand: { type: "string" }, size: { type: "string" },
      price: { type: "string", description: "Erbjudandet som det står, t.ex. '2 för 38 kr' eller '35 kr/st'" },
      unitPrice: { type: "string", description: "Jämförpris, t.ex. '63:33/liter'" },
      ordPrice: { type: "string" }, member: { type: "string", description: "Stammis, MaxiKlipp, Willys Plus eller tom" },
      limit: { type: "string", description: "Begränsning, t.ex. 'max 2 per hushåll'" },
      food: { type: "boolean", description: "Mat eller dryck (inte hygien, djurmat, böcker)" },
      ingredients: { type: "array", items: { type: "string" }, description: "Enkla råvarunamn i singular gemener som receptet skulle skriva, t.ex. ['matlagningsgrädde','grädde'] eller ['palsternacka','rödbeta']" },
      category: { type: "string", description: "Frukt och grönt, Kött och chark, Fisk, Mejeri, Skafferi, Fryst, Bröd, Dryck, Godis och snacks, Övrigt" },
    }, required: ["name", "price"] } },
  },
  required: ["offers"],
};

async function parse(text, store) {
  const out = await askJson({
    system: `Du läser veckans erbjudanden från en svensk matbutik (${store.name}) och gör om dem till JSON. Ta med alla erbjudanden, i samma ordning. Hitta inte på något. Svara bara med JSON enligt schemat: {"validTo":"","offers":[{"name","brand","size","price","unitPrice","ordPrice","member","limit","food","ingredients":[],"category"}]}`,
    content: text, schema: SCHEMA, toolName: "save_offers", maxTokens: 16000, textOnly: true,
  });
  const list = (Array.isArray(out?.offers) ? out.offers : []).map((o) => ({
    name: String(o.name || "").slice(0, 120), brand: String(o.brand || "").slice(0, 60), size: String(o.size || "").slice(0, 60),
    price: String(o.price || "").slice(0, 60), unitPrice: String(o.unitPrice || "").slice(0, 60), ordPrice: String(o.ordPrice || "").slice(0, 60),
    member: String(o.member || "").slice(0, 30), limit: String(o.limit || "").slice(0, 60), food: o.food !== false,
    ingredients: (Array.isArray(o.ingredients) ? o.ingredients : []).map((x) => String(x).toLowerCase().trim()).filter(Boolean).slice(0, 5),
    category: String(o.category || "Övrigt").slice(0, 40),
  })).filter((o) => o.name && o.price);
  if (!list.length) throw new Error("Inga erbjudanden kunde läsas från sidan.");
  return { validTo: String(out.validTo || ""), offers: list };
}

export async function refreshStore(store) {
  const sql = db();
  try {
    const data = await parse(await pageText(store.url), store);
    await sql(`insert into store_offers (store, name, url, offers, error, fetched_at) values ($1,$2,$3,$4,null,now())
      on conflict (store) do update set name=$2, url=$3, offers=$4, error=null, fetched_at=now()`, [store.key, store.name, store.url, JSON.stringify(data)]);
  } catch (e) {
    await sql(`insert into store_offers (store, name, url, error, fetched_at) values ($1,$2,$3,$4,now())
      on conflict (store) do update set name=$2, url=$3, error=$4, fetched_at=now()`, [store.key, store.name, store.url, e.message]);
  }
}

// Hämtar om erbjudanden som är äldre än ett dygn (eller alltid med force).
export async function getOffers({ force = false, only = null } = {}) {
  const sql = db();
  const list = await stores();
  for (const s of list) {
    if (only && s.key !== only) continue;
    const [row] = await sql(`select fetched_at, url from store_offers where store = $1`, [s.key]);
    const old = !row || row.url !== s.url || Date.now() - new Date(row.fetched_at).getTime() > 20 * 3600 * 1000;
    if (force || old) await refreshStore(s);
  }
  const rows = await sql(`select * from store_offers where store = any($1)`, [list.map((s) => s.key)]);
  return list.map((s) => {
    const r = rows.find((x) => x.store === s.key);
    return { ...s, fetchedAt: r?.fetched_at || null, error: r?.error || null, validTo: r?.offers?.validTo || "", offers: r?.offers?.offers || [] };
  });
}

export { matchOffer } from "@/lib/offerMatch";
