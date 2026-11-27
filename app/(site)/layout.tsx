import { RadioPlayer } from "@/components/radio-player";
import { LockScreen } from "@/components/lock-screen";
import { readLockState, siteUnlocked } from "@/lib/server-lock";
import { readPortalSettings } from "@/lib/server-articles";

// O bloqueio do portal precisa ser avaliado a cada visita (servidor).
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await readPortalSettings();
  const state = await readLockState(settings);
  const unlocked = await siteUnlocked(settings);

  if (state.locked && !unlocked) {
    return (
      <LockScreen portalName={settings?.portalName} logoUrl={settings?.logoUrl} />
    );
  }

  return (
    <>
      {children}
      <RadioPlayer />
    </>
  );
}
