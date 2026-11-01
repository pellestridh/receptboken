// Inloggning per hushåll. Familjekoden i Vercel (FAMILY_CODE) är hushållet "hem";
// andra hushåll har egna koder i databasen. Cookien är hushållets id plus en signatur,
// så att middleware kan avgöra hushållet utan att fråga databasen.
export const COOKIE = "rb_auth";

async function sha(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Gamla cookien (före hushåll) gäller fortfarande som "hem".
export const tokenFor = (code) => sha("receptboken:" + code);
export const codeHash = (code) => sha("receptboken-hushall:" + String(code).trim());

export async function cookieFor(hh) {
  return `${hh}.${await sha(`receptboken:${process.env.FAMILY_CODE}:${hh}`)}`;
}

// Returnerar hushållets id, eller null om cookien inte är giltig.
export async function householdFrom(cookieValue) {
  const code = process.env.FAMILY_CODE;
  if (!code || !cookieValue) return null;
  if (cookieValue === (await tokenFor(code))) return "hem";
  const i = cookieValue.lastIndexOf(".");
  if (i < 1) return null;
  const hh = cookieValue.slice(0, i);
  if (!/^[a-z0-9-]{1,40}$/.test(hh)) return null;
  return cookieValue === (await cookieFor(hh)) ? hh : null;
}
