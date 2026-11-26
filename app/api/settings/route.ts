import { readPortalSettings } from "@/lib/server-articles";

export async function GET() {
  const settings = await readPortalSettings();
  return Response.json({ settings });
}
