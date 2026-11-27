import { adminAuthorized } from "@/lib/server-admin-auth";
import {
  materializePortalSettings,
  readPortalSettings,
  writePortalSettings,
} from "@/lib/server-articles";
import type { PortalSettings } from "@/lib/settings";

export async function POST(req: Request) {
  if (!(await adminAuthorized())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    settings?: PortalSettings;
  };
  const settings = body.settings;
  if (!settings || typeof settings.portalName !== "string") {
    return Response.json({ error: "Configurações inválidas" }, { status: 400 });
  }
  // Nunca perder o hash da senha do bloqueio: se o salvo veio sem hash mas
  // o portal está trancado na nuvem, preserva o hash atual.
  const existing = await readPortalSettings();
  const merged: PortalSettings = {
    ...settings,
    siteLocked: settings.siteLocked ?? existing?.siteLocked ?? false,
    sitePasswordHash:
      settings.sitePasswordHash ??
      (settings.siteLocked ?? existing?.siteLocked
        ? existing?.sitePasswordHash
        : undefined),
  };
  const materialized = await materializePortalSettings(merged);
  await writePortalSettings(materialized);
  return Response.json({ ok: true });
}
