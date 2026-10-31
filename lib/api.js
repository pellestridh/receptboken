"use client";

export async function api(path, { method = "GET", json } = {}) {
  const res = await fetch(path, {
    method,
    headers: json !== undefined ? { "content-type": "application/json" } : undefined,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    cache: "no-store",
  });
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login?next=" + encodeURIComponent(window.location.pathname);
    throw new Error("Du behöver logga in.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Något gick fel. Försök igen.");
  return data;
}

export function getName() {
  try { return localStorage.getItem("rb-name") || ""; } catch { return ""; }
}
export function setName(n) {
  try { localStorage.setItem("rb-name", n); } catch {}
}

export function lsGet(k, d) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
}
export function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}
