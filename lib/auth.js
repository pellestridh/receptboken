// Familjekod: den som anger rätt kod får en cookie med en hash av koden.
// Byts koden i Vercel blir alla gamla cookies ogiltiga.
export const COOKIE = "rb_auth";

export async function tokenFor(code) {
  const data = new TextEncoder().encode("receptboken:" + code);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isAuthed(cookieValue) {
  const code = process.env.FAMILY_CODE;
  if (!code || !cookieValue) return false;
  return cookieValue === (await tokenFor(code));
}
