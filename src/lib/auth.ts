import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type Role } from "./session";

// proxy.ts hanya pemeriksaan optimistis; halaman & API tetap memverifikasi
// sesi sendiri lewat helper di bawah.

export async function getSession() {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** Untuk halaman: redirect ke /login bila belum login / role kurang. */
export async function requirePageRole(role: Role = "viewer") {
  const s = await getSession();
  if (!s) redirect("/login");
  if (role === "admin" && s.role !== "admin") redirect("/");
  return s;
}

/** Untuk route handler: kembalikan Response error, atau null bila lolos. */
export async function guardApi(role: Role = "viewer") {
  const s = await getSession();
  if (!s) return Response.json({ error: "Belum login" }, { status: 401 });
  if (role === "admin" && s.role !== "admin")
    return Response.json({ error: "Hanya admin" }, { status: 403 });
  return null;
}
