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
  const kind = String(formData.get("kind") || "");
  const id = String(formData.get("id") || "");

  if (kind === "faculty") {
    const item = await prisma.faculty.findUnique({ where: { id } });
    if (!item) return redirectWithNotice(request, "/admin/faculty", "対象が見つかりません。", "error");
    await prisma.faculty.update({ where: { id }, data: { isPublished: !item.isPublished } });
  }

  if (kind === "seed") {
    const item = await prisma.researchSeed.findUnique({ where: { id } });
    if (!item) return redirectWithNotice(request, "/admin/seeds", "対象が見つかりません。", "error");
    await prisma.researchSeed.update({ where: { id }, data: { isPublished: !item.isPublished } });
  }

  if (kind === "news") {
    const item = await prisma.newsArticle.findUnique({ where: { id } });
    if (!item) return redirectWithNotice(request, "/admin/news", "対象が見つかりません。", "error");
    await prisma.newsArticle.update({ where: { id }, data: { isPublished: !item.isPublished } });
  }

  if (kind === "event") {
    const item = await prisma.eventItem.findUnique({ where: { id } });
    if (!item) return redirectWithNotice(request, "/admin/events", "対象が見つかりません。", "error");
    await prisma.eventItem.update({ where: { id }, data: { isPublished: !item.isPublished } });
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      actorLabel: `admin: ${user.name}`,
      action: "公開切替",
      detail: `${kind}:${id} を更新`,
    },
  });

  return redirectWithNotice(request, "/admin", "公開状態を切り替えました。");
}
