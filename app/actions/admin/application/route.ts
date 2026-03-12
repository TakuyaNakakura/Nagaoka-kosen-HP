import { NotificationScope, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import { snapshotToCompanyInput } from "@/lib/domain";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return redirectWithNotice(request, "/login", "管理者ログインが必要です。", "error");
  }

  const formData = await request.formData();
  const applicationId = String(formData.get("applicationId") || "");
  const action = String(formData.get("action") || "return");
  const reviewComment = String(formData.get("reviewComment") || "");

  const application = await prisma.companyUpdateRequest.findUnique({
    where: { id: applicationId },
    include: { company: true },
  });

  if (!application) {
    return redirectWithNotice(request, "/admin/applications", "申請が見つかりません。", "error");
  }

  const snapshot = JSON.parse(application.snapshotJson);

  if (action === "approve") {
    await prisma.$transaction([
      prisma.company.update({
        where: { id: application.companyId },
        data: {
          ...snapshotToCompanyInput(snapshot),
          workflowStatus: "APPROVED",
          lastPublishedAt: new Date(),
        },
      }),
      prisma.companyUpdateRequest.update({
        where: { id: application.id },
        data: {
          status: "APPROVED",
          reviewComment,
          reviewedAt: new Date(),
          reviewerName: user.name,
        },
      }),
      prisma.notification.create({
        data: {
          scope: NotificationScope.MEMBER,
          companyId: application.companyId,
          message: `${application.company.name} の更新申請が承認されました。`,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          actorLabel: `admin: ${user.name}`,
          action: "申請審査",
          detail: `${application.company.name} を承認`,
        },
      }),
    ]);
  } else if (action === "return") {
    await prisma.$transaction([
      prisma.company.update({
        where: { id: application.companyId },
        data: { workflowStatus: "RETURNED" },
      }),
      prisma.companyUpdateRequest.update({
        where: { id: application.id },
        data: {
          status: "RETURNED",
          reviewComment,
          reviewedAt: new Date(),
          reviewerName: user.name,
        },
      }),
      prisma.notification.create({
        data: {
          scope: NotificationScope.MEMBER,
          companyId: application.companyId,
          message: `${application.company.name} の更新申請が差戻しになりました。`,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          actorLabel: `admin: ${user.name}`,
          action: "申請審査",
          detail: `${application.company.name} を差戻し`,
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.company.update({
        where: { id: application.companyId },
        data: { workflowStatus: "REJECTED" },
      }),
      prisma.companyUpdateRequest.update({
        where: { id: application.id },
        data: {
          status: "REJECTED",
          reviewComment,
          reviewedAt: new Date(),
          reviewerName: user.name,
        },
      }),
      prisma.notification.create({
        data: {
          scope: NotificationScope.MEMBER,
          companyId: application.companyId,
          message: `${application.company.name} の更新申請が却下されました。`,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          actorLabel: `admin: ${user.name}`,
          action: "申請審査",
          detail: `${application.company.name} を却下`,
        },
      }),
    ]);
  }

  return redirectWithNotice(request, "/admin/applications", "更新申請を処理しました。");
}
