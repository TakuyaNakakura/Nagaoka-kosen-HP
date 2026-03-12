import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import { prisma } from "@/lib/prisma";
import { parseCommaList, slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return redirectWithNotice(request, "/login", "管理者ログインが必要です。", "error");
  }

  const formData = await request.formData();
  const name = String(formData.get("name") || "");

  await prisma.$transaction([
    prisma.faculty.create({
      data: {
        slug: `${slugify(name) || "faculty"}-${Date.now().toString(36).slice(-4)}`,
        name,
        department: String(formData.get("department") || ""),
        specialtiesJson: JSON.stringify(parseCommaList(formData.get("specialties"))),
        summary: String(formData.get("summary") || ""),
        contact: String(formData.get("contact") || ""),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "教員追加",
        detail: `${name} を追加`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/faculty", "教員プロフィールを登録しました。");
}
