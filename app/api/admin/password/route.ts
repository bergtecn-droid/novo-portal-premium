import { cookies } from "next/headers";
import { ADMIN_COOKIE, hashAdminPassword } from "@/lib/auth";
import {
  adminAuthorized,
  readCustomAdminHash,
  verifyAdminPassword,
  writeCustomAdminHash,
} from "@/lib/server-admin-auth";
import { storageActive } from "@/lib/server-articles";

export async function POST(req: Request) {
  if (!(await adminAuthorized())) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    currentPassword?: string;
    newPassword?: string;
  };
  const current = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const next = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!(await verifyAdminPassword(current))) {
    return Response.json(
      { error: "A senha atual está incorreta." },
      { status: 400 },
    );
  }
  if (next.trim().length < 6) {
    return Response.json(
      { error: "A nova senha precisa ter pelo menos 6 caracteres." },
      { status: 400 },
    );
  }
  if (!storageActive()) {
    return Response.json(
      {
        error:
          "A troca de senha precisa da nuvem ativa. Ative o Vercel Blob primeiro (guia na seção ☁️ Nuvem do painel) e tente de novo.",
      },
      { status: 503 },
    );
  }

  const existing = await readCustomAdminHash();
  const nextHash = await hashAdminPassword(next);
  if (existing === nextHash) {
    return Response.json(
      { error: "A nova senha é igual à senha atual." },
      { status: 400 },
    );
  }

  await writeCustomAdminHash(nextHash);

  // Renova o cookie para a nova senha (a sessão atual continua aberta).
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, nextHash, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });

  return Response.json({ ok: true });
}
