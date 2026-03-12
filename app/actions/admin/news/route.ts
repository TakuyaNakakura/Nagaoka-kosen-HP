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
    prisma.newsArticle.create({
      data: {
        slug: `${slugify(title) || "news"}-${Date.now().toString(36).slice(-4)}`,
        title,
        category: String(formData.get("category") || ""),
        publishedDate: new Date(String(formData.get("date") || "")),
        summary: String(formData.get("summary") || ""),
        body: String(formData.get("body") || ""),
        attachmentsJson: JSON.stringify(parseCommaList(formData.get("attachments"))),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "ニュース追加",
        detail: `${title} を追加`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/news", "ニュース記事を登録しました。");
}
