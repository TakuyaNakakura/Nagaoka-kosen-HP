import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import { prisma } from "@/lib/prisma";
import { parseLines } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return redirectWithNotice(request, "/login", "管理者ログインが必要です。", "error");
  }

  const formData = await request.formData();
  const permissionId = String(formData.get("permissionId") || "");

  await prisma.$transaction([
    prisma.permissionProfile.update({
      where: { id: permissionId },
      data: {
        scope: String(formData.get("scope") || ""),
        capabilitiesJson: JSON.stringify(parseLines(formData.get("capabilities"))),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "権限設定更新",
        detail: `${permissionId} を更新`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/permissions", "権限設定を更新しました。");
}
