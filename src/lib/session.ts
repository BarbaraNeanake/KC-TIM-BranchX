// Token sesi bertanda tangan HMAC-SHA256 (Web Crypto) — dipakai oleh proxy.ts
// maupun server code, jadi jangan import modul khusus Node di sini.

export type Role = "admin" | "viewer";
export const SESSION_COOKIE = "gm_session";
export const SESSION_TTL_S = 60 * 60 * 12; // 12 jam

const enc = new TextEncoder();

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32)
    throw new Error("SESSION_SECRET belum di-set (minimal 32 karakter).");
  return s;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bin = String.fromCharCode(...new Uint8Array(sig));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(role: Role): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  const payload = `${role}.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySession(
  token: string | undefined,
): Promise<{ role: Role } | null> {
  if (!token) return null;
  const [role, exp, sig] = token.split(".");
  if ((role !== "admin" && role !== "viewer") || !exp || !sig) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const expected = await hmac(`${role}.${exp}`);
  return safeEqual(sig, expected) ? { role } : null;
}
