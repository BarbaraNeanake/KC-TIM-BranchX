"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, signSession, type Role } from "@/lib/session";

function matchRole(password: string): Role | null {
  const admin = process.env.ADMIN_PASSWORD;
  const viewer = process.env.VIEWER_PASSWORD;
  if (admin && password === admin) return "admin";
  if (viewer && password === viewer) return "viewer";
  return null;
}

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  const role = matchRole(password);
  if (!role) {
    await new Promise((r) => setTimeout(r, 600)); // redam brute force ringan
    return { error: "Password salah." };
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Tanpa maxAge = session cookie: terhapus saat browser ditutup.
    // Token di dalamnya tetap kedaluwarsa setelah SESSION_TTL_S.
  });
  // Hanya izinkan redirect ke path internal.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
