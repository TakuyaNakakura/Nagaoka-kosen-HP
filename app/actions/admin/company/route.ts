import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

function uniqueSlug(name: string) {
  const base = slugify(name) || "company";
  return `${base}-${Date.now().toString(36).slice(-5)}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return redirectWithNotice(request, "/login", "管理者ログインが必要です。", "error");
  }

  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "toggle-public") {
    const companyId = String(formData.get("companyId") || "");
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return redirectWithNotice(request, "/admin/companies", "企業が見つかりません。", "error");
    }
    await prisma.$transaction([
      prisma.company.update({
        where: { id: company.id },
        data: { isPublic: !company.isPublic },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          actorLabel: `admin: ${user.name}`,
          action: "公開切替",
          detail: `${company.name} を ${company.isPublic ? "非公開" : "公開"} に変更`,
        },
      }),
    ]);
    return redirectWithNotice(request, "/admin/companies", "公開状態を切り替えました。");
  }

  const name = String(formData.get("name") || "");
  if (!name) {
    return redirectWithNotice(request, "/admin/companies", "企業名は必須です。", "error");
  }

  await prisma.$transaction([
    prisma.company.create({
      data: {
        slug: uniqueSlug(name),
        name,
        industry: String(formData.get("industry") || ""),
        city: String(formData.get("city") || ""),
        address: String(formData.get("address") || ""),
        website: String(formData.get("website") || ""),
        summary: String(formData.get("summary") || ""),
        businessJson: "[]",
        relatedFieldsJson: "[]",
        departmentsJson: "[]",
        acceptanceItemsJson: "[]",
        keywordsJson: "[]",
        materialsJson: "[]",
        galleryJson: "[]",
        hiringInfo: "",
        message: "",
        workflowStatus: "APPROVED",
        lastPublishedAt: new Date(),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "企業追加",
        detail: `${name} を追加`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/companies", "会員企業を登録しました。");
}
