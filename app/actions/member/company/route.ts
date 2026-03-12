import { NotificationScope, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import type { AssetLink } from "@/lib/domain";
import { parseCompanySnapshotFromForm } from "@/lib/form-parsers";
import { prisma } from "@/lib/prisma";
import { assertUploadConstraints, saveFiles } from "@/lib/storage";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.MEMBER || !user.companyId) {
    return redirectWithNotice(request, "/login", "ログインが必要です。", "error");
  }

  const formData = await request.formData();
  const materialFiles = formData
    .getAll("materialFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const imageFiles = formData
    .getAll("imageFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  let uploadedMaterials: AssetLink[] = [];
  let uploadedGallery: AssetLink[] = [];

  try {
    assertUploadConstraints([...materialFiles, ...imageFiles]);
    [uploadedMaterials, uploadedGallery] = await Promise.all([
      saveFiles(materialFiles, "materials"),
      saveFiles(imageFiles, "images"),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ファイルの保存に失敗しました。";
    return redirectWithNotice(request, "/member/edit", message, "error");
  }

  const snapshot = parseCompanySnapshotFromForm(formData, uploadedMaterials, uploadedGallery);
  const intent = String(formData.get("intent") || "save");

  const existingRequest = await prisma.companyUpdateRequest.findFirst({
    where: {
      companyId: user.companyId,
      status: { in: ["DRAFT", "PENDING", "RETURNED", "REJECTED"] },
    },
    orderBy: { updatedAt: "desc" },
  });

  const status = intent === "submit" ? "PENDING" : "DRAFT";

  if (existingRequest) {
    await prisma.companyUpdateRequest.update({
      where: { id: existingRequest.id },
      data: {
        snapshotJson: JSON.stringify(snapshot),
        status,
        submittedAt: intent === "submit" ? new Date() : existingRequest.submittedAt,
      },
    });
  } else {
    await prisma.companyUpdateRequest.create({
      data: {
        companyId: user.companyId,
        snapshotJson: JSON.stringify(snapshot),
        status,
        submittedAt: intent === "submit" ? new Date() : null,
      },
    });
  }

  if (intent === "submit") {
    await prisma.company.update({
      where: { id: user.companyId },
      data: {
        workflowStatus: "PENDING",
      },
    });
    await prisma.notification.create({
      data: {
        scope: NotificationScope.ADMIN,
        message: `${snapshot.name} から更新申請が届きました。`,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      actorLabel: `member: ${user.name}`,
      action: intent === "submit" ? "更新申請" : "下書き保存",
      detail: intent === "submit" ? `${snapshot.name} の更新申請を送信` : `${snapshot.name} の下書きを保存`,
    },
  });

  return redirectWithNotice(
    request,
    intent === "submit" ? "/member/status" : "/member/edit",
    intent === "submit" ? "更新申請を送信しました。" : "下書きを保存しました。",
  );
}
