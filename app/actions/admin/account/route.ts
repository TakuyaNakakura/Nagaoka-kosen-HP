import { UserRole } from "@prisma/client";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return redirectWithNotice(request, "/login", "管理者ログインが必要です。", "error");
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "toggle-active") {
    const userId = String(formData.get("userId") || "");
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return redirectWithNotice(request, "/admin/accounts", "アカウントが見つかりません。", "error");
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { active: !target.active },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          actorLabel: `admin: ${user.name}`,
          action: "アカウント状態切替",
          detail: `${target.email} を ${target.active ? "停止" : "有効化"}`,
        },
      }),
    ]);
    return redirectWithNotice(request, "/admin/accounts", "アカウント状態を更新しました。");
  }

  const companyId = String(formData.get("companyId") || "");
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const name = String(formData.get("name") || "");
  const password = String(formData.get("password") || "");

  await prisma.$transaction([
    prisma.user.create({
      data: {
        companyId,
        email,
        name,
        role: "MEMBER",
        passwordHash: await hashPassword(password),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "アカウント発行",
        detail: `${email} を発行`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/accounts", "会員企業アカウントを発行しました。");
}
