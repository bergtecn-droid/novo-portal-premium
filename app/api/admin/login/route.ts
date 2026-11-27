import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminToken,
  hashAdminPassword,
} from "@/lib/auth";
import { readCustomAdminHash, verifyAdminPassword } from "@/lib/server-admin-auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ password: "" }));
  const password = typeof body.password === "string" ? body.password : "";

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  // Cookie = hash da senha usada no login (padrão ou trocada no painel).
  const custom = await readCustomAdminHash();
  const token =
    custom && (await hashAdminPassword(password)) === custom
      ? custom
      : await adminToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
