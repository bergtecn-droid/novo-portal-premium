import { cookies } from "next/headers";
import { ACCESS_COOKIE, hashSitePassword, readLockState } from "@/lib/server-lock";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const password = typeof body.password === "string" ? body.password : "";
  if (!password.trim()) {
    return Response.json({ error: "Digite a senha." }, { status: 400 });
  }

  const state = await readLockState();
  if (!state.locked) {
    // Portal aberto — nada a desbloquear.
    return Response.json({ ok: true, locked: false });
  }

  if (hashSitePassword(password) !== state.hash) {
    return Response.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(ACCESS_COOKIE, state.hash, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return Response.json({ ok: true, locked: true });
}
