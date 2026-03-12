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
  const title = String(formData.get("title") || "");

  await prisma.$transaction([
    prisma.researchSeed.create({
      data: {
        slug: `${slugify(title) || "seed"}-${Date.now().toString(36).slice(-4)}`,
        title,
        department: String(formData.get("department") || ""),
        teacherId: String(formData.get("teacherId") || ""),
        keywordsJson: JSON.stringify(parseCommaList(formData.get("keywords"))),
        summary: String(formData.get("summary") || ""),
        potential: String(formData.get("potential") || ""),
        collaboration: String(formData.get("collaboration") || ""),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "技術シーズ追加",
        detail: `${title} を追加`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/seeds", "技術シーズを登録しました。");
}
