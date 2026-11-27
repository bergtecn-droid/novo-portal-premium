export const ADMIN_COOKIE = "portal-nova-admin";

export const DEFAULT_ADMIN_PASSWORD = "nova-admin-2025";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export async function adminToken(): Promise<string> {
  return hashAdminPassword(adminPassword());
}

/** SHA-256 de `${senha}:portal-nova-salt` (formato do cookie de admin). */
export async function hashAdminPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${password}:portal-nova-salt`),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
