import { NextResponse } from "next/server";
import { getCurrentUser, invalidateSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")[1];

  if (token) {
    await invalidateSession(token);
  }

  if (user) {
    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `${user.role === "ADMIN" ? "admin" : "member"}: ${user.name}`,
        action: "ログアウト",
        detail: "セッション終了",
      },
    });
  }

  const response = NextResponse.redirect(
    new URL(`/?notice=${encodeURIComponent("ログアウトしました")}&kind=success`, request.url),
  );
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
