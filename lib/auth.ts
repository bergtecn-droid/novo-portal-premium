export const ADMIN_COOKIE = "portal-nova-admin";

export const DEFAULT_ADMIN_PASSWORD = "nova-admin-2025";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export async function adminToken(): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${adminPassword()}:portal-nova-salt`),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
