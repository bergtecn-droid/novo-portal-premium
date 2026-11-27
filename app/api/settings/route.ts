import { readPortalSettings } from "@/lib/server-articles";
import { siteUnlocked } from "@/lib/server-lock";

export async function GET() {
  const settings = await readPortalSettings();
  // Portal bloqueado e visitante sem senha: nada vaza.
  if (!(await siteUnlocked(settings))) {
    return Response.json({ settings: null });
  }
  if (!settings) return Response.json({ settings: null });
  // Nunca expor o hash da senha do bloqueio publicamente.
  const { sitePasswordHash: _omit, ...publicSettings } = settings;
  return Response.json({ settings: publicSettings });
}
