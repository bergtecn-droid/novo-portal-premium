import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminToken } from "@/lib/auth";
import {
  materializePortalSettings,
  writePortalSettings,
} from "@/lib/server-articles";
import type { PortalSettings } from "@/lib/settings";

export async function POST(req: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(token && token === (await adminToken()))) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    settings?: PortalSettings;
  };
  const settings = body.settings;
  if (!settings || typeof settings.portalName !== "string") {
    return Response.json({ error: "Configurações inválidas" }, { status: 400 });
  }
  const materialized = await materializePortalSettings(settings);
  await writePortalSettings(materialized);
  return Response.json({ ok: true });
}
