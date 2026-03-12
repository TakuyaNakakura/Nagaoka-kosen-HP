import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  createSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import { prisma } from "@/lib/prisma";

function safeNextPath(value: string, fallback: string) {
  return value.startsWith("/") ? value : fallback;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const role = String(formData.get("role") || "MEMBER") as UserRole;
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== role || !user.active) {
    return redirectWithNotice(request, "/login", "ログイン情報が一致しません", "error");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return redirectWithNotice(request, "/login", "ログイン情報が一致しません", "error");
  }

  const token = await createSession(user.id);
  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      actorLabel: `${user.role === "ADMIN" ? "admin" : "member"}: ${user.name}`,
      action: "ログイン",
      detail: "ダッシュボードにアクセス",
    },
  });

  const fallback = user.role === "ADMIN" ? "/admin" : "/member";
  const response = NextResponse.redirect(
    new URL(safeNextPath(next, fallback), request.url),
  );
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
