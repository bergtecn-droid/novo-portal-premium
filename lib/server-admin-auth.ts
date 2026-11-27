import { cookies } from "next/headers";
import { head, put } from "@vercel/blob";
import {
  ADMIN_COOKIE,
  adminPassword,
  adminToken,
  hashAdminPassword,
} from "./auth";
import { storageActive } from "./server-articles";

/**
 * Senha do administrador definida pelo próprio painel.
 *
 * - Padrão: env ADMIN_PASSWORD ou "nova-admin-2025" (lib/auth.ts).
 * - Custom: hash salvo no Blob (admin-auth.json) quando o admin troca a
 *   senha pela seção 🔑 do painel — precisa da nuvem ativa.
 */

const FILE_NAME = "admin-auth.json";

export async function readCustomAdminHash(): Promise<string | null> {
  if (!storageActive()) return null;
  try {
    const info = await head(FILE_NAME);
    const res = await fetch(info.url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { passwordHash?: string };
    return typeof data.passwordHash === "string" ? data.passwordHash : null;
  } catch {
    return null;
  }
}

export async function writeCustomAdminHash(hash: string): Promise<void> {
  await put(FILE_NAME, JSON.stringify({ passwordHash: hash }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** A senha confere com a padrão (env) OU com a trocada no painel? */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (password) {
    const custom = await readCustomAdminHash();
    if (custom && (await hashAdminPassword(password)) === custom) return true;
  }
  return password === adminPassword();
}

/** Cookie de admin válido (senha padrão ou trocada no painel)? */
export async function adminAuthorized(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  if (token === (await adminToken())) return true;
  const custom = await readCustomAdminHash();
  return Boolean(custom && token === custom);
}
