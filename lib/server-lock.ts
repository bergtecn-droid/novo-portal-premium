import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { readPortalSettings } from "./server-articles";
import type { PortalSettings } from "./settings";

/**
 * Bloqueio do portal (site público inteiro).
 *
 * - Estado principal: settings.siteLocked + sitePasswordHash (nuvem, via
 *   portal-settings.json) — configurável no painel 🔒 Bloqueio do portal.
 * - Fallback: env PORTAL_LOCK_PASSWORD (senha direto no painel da Vercel).
 * - O /admin NUNCA é bloqueado (tem a própria senha).
 */

export const ACCESS_COOKIE = "portal-nova-access";

export function hashSitePassword(password: string): string {
  return createHash("sha256")
    .update(`${password}:portal-nova-salt`)
    .digest("hex");
}

export interface LockState {
  locked: boolean;
  hash: string | null;
  source: "settings" | "env" | "none";
}

export async function readLockState(
  knownSettings?: PortalSettings | null,
): Promise<LockState> {
  const settings = knownSettings === undefined
    ? await readPortalSettings()
    : knownSettings;
  if (settings?.siteLocked && settings.sitePasswordHash) {
    return {
      locked: true,
      hash: settings.sitePasswordHash,
      source: "settings",
    };
  }
  const envPassword = process.env.PORTAL_LOCK_PASSWORD;
  if (envPassword) {
    return {
      locked: true,
      hash: hashSitePassword(envPassword),
      source: "env",
    };
  }
  return { locked: false, hash: null, source: "none" };
}

/** true quando o visitante pode ver o site (portal aberto ou cookie válido). */
export async function siteUnlocked(
  knownSettings?: PortalSettings | null,
): Promise<boolean> {
  const state = await readLockState(knownSettings);
  if (!state.locked) return true;
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  return Boolean(token && state.hash && token === state.hash);
}
