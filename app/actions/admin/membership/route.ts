import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return redirectWithNotice(request, "/login", "管理者ログインが必要です。", "error");
  }

  const formData = await request.formData();
  const membershipId = String(formData.get("membershipId") || "");

  await prisma.$transaction([
    prisma.membershipApplication.update({
      where: { id: membershipId },
      data: {
        status: String(formData.get("status") || "NEW") as "NEW" | "REVIEWING" | "COMPLETED",
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "入会相談更新",
        detail: `${membershipId} を更新`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/join", "入会相談の状態を更新しました。");
}
