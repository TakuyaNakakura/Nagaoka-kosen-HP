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
  const plansText = String(formData.get("plans") || "[]");

  await prisma.$transaction([
    prisma.organizationInfo.update({
      where: { id: 1 },
      data: {
        overview: String(formData.get("overview") || ""),
        purposeJson: JSON.stringify(parseLines(formData.get("purpose"))),
        officersJson: JSON.stringify(parseLines(formData.get("officers"))),
        rulesJson: JSON.stringify(parseLines(formData.get("rules"))),
        membershipPlansJson: plansText,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "組織情報更新",
        detail: "組織概要を更新",
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/organization", "組織情報を更新しました。");
}
