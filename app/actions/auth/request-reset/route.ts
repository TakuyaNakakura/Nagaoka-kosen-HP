import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const role = String(formData.get("role") || "MEMBER") as UserRole;
  const email = String(formData.get("email") || "").toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== role) {
    return NextResponse.redirect(
      new URL(
        `/reset-password?notice=${encodeURIComponent("該当アカウントが見つかりませんでした")}&kind=error`,
        request.url,
      ),
    );
  }

  const token = await createPasswordResetToken(user.id);

  try {
    const delivery = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token,
      requestUrl: request.url,
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `${user.role === "ADMIN" ? "admin" : "member"}: ${user.name}`,
        action: "パスワード再設定申請",
        detail: delivery.mode === "email" ? "再設定メールを送信" : "再設定トークンを開発用表示",
      },
    });

    const destination = new URL("/reset-password", request.url);
    destination.searchParams.set(
      "notice",
      delivery.mode === "email"
        ? "再設定メールを送信しました。メール内のリンクから手続きを続けてください。"
        : "再設定トークンを発行しました。開発用のため画面に表示しています。",
    );
    destination.searchParams.set("kind", "success");

    if (delivery.mode === "debug") {
      destination.searchParams.set("token", token);
    }

    return NextResponse.redirect(destination);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "パスワード再設定メールの送信に失敗しました。";

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `${user.role === "ADMIN" ? "admin" : "member"}: ${user.name}`,
        action: "パスワード再設定申請失敗",
        detail: message,
      },
    });

    const destination = new URL("/reset-password", request.url);
    destination.searchParams.set("notice", message);
    destination.searchParams.set("kind", "error");
    return NextResponse.redirect(destination);
  }
}
