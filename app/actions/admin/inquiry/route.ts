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
  const inquiryId = String(formData.get("inquiryId") || "");

  await prisma.$transaction([
    prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        assignedTo: String(formData.get("assignedTo") || ""),
        status: String(formData.get("status") || "NEW") as "NEW" | "IN_PROGRESS" | "COMPLETED",
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "問い合わせ更新",
        detail: `${inquiryId} を更新`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/inquiries", "問い合わせ状況を更新しました。");
}
