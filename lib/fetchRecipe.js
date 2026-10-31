// Hämtar en receptsida. Använder sidans strukturerade receptdata (schema.org Recipe) om den finns,
// annars sidans text. Returnerar bara det Claude behöver, så att inläsningen blir billig.

function decode(s) {
  return s
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function findRecipe(node) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const n of node) { const f = findRecipe(n); if (f) return f; }
    return null;
  }
  const t = node["@type"];
  if (t === "Recipe" || (Array.isArray(t) && t.includes("Recipe"))) return node;
  if (node["@graph"]) return findRecipe(node["@graph"]);
  return null;
}

function imageOf(img) {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (Array.isArray(img)) return imageOf(img[0]);
  return img.url || null;
}

function instructions(x) {
  if (!x) return [];
  if (typeof x === "string") return [decode(x.replace(/<[^>]+>/g, " ")).trim()];
  if (Array.isArray(x)) return x.flatMap(instructions);
  if (x["@type"] === "HowToSection") return [`## ${x.name || ""}`, ...instructions(x.itemListElement)];
  if (x.text) return [decode(String(x.text).replace(/<[^>]+>/g, " ")).trim()];
  if (x.itemListElement) return instructions(x.itemListElement);
  return [];
}

export async function fetchRecipePage(url) {
  let u;
  try { u = new URL(url); } catch { throw new Error("Länken ser inte ut som en webbadress."); }
  if (!/^https?:$/.test(u.protocol)) throw new Error("Länken måste börja med http:// eller https://.");

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  let html;
  try {
    const res = await fetch(u, {
      signal: ctl.signal,
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        "accept-language": "sv-SE,sv;q=0.9,en;q=0.8",
        accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`Sidan svarade med fel ${res.status}.`);
    html = await res.text();
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Sidan svarade inte i tid.");
    throw e instanceof Error && e.message.startsWith("Sidan") ? e : new Error("Sidan gick inte att hämta.");
  } finally {
    clearTimeout(timer);
  }

  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1] || null;
  const site = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1] || u.hostname.replace(/^www\./, "");

  // 1. Strukturerad receptdata
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    let json;
    try { json = JSON.parse(b[1].trim()); } catch { continue; }
    const r = findRecipe(json);
    if (r) {
      const author = Array.isArray(r.author) ? r.author.map((a) => a?.name || a).join(", ") : r.author?.name || r.author || "";
      const lines = [
        `Titel: ${decode(String(r.name || ""))}`,
        author ? `Av: ${decode(String(author))}` : "",
        r.recipeYield ? `Portioner: ${[].concat(r.recipeYield).join(" / ")}` : "",
        r.totalTime ? `Total tid: ${r.totalTime}` : "",
        r.description ? `Beskrivning: ${decode(String(r.description))}` : "",
        "",
        "Ingredienser:",
        ...[].concat(r.recipeIngredient || r.ingredients || []).map((i) => "- " + decode(String(i))),
        "",
        "Gör så här:",
        ...(() => { let n = 0; return instructions(r.recipeInstructions).map((s) => (s.startsWith("## ") ? s : `${++n}. ${s}`)); })(),
      ].filter((l) => l !== undefined);
      return { text: lines.join("\n"), image: imageOf(r.image) || og, site, author: String(author || "") };
    }
  }

  // 2. Sidans text
  const text = decode(
    html
      .replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h\d|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  ).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim().slice(0, 40000);
  if (text.length < 200) throw new Error("Sidan innehöll inget recept som gick att läsa. Prova att fota eller kopiera texten.");
  return { text, image: og, site, author: "" };
}
