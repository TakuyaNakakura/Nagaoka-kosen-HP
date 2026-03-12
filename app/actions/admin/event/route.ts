import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { redirectWithNotice } from "@/lib/action-response";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return redirectWithNotice(request, "/login", "管理者ログインが必要です。", "error");
  }

  const formData = await request.formData();
  const title = String(formData.get("title") || "");

  await prisma.$transaction([
    prisma.eventItem.create({
      data: {
        slug: `${slugify(title) || "event"}-${Date.now().toString(36).slice(-4)}`,
        title,
        eventDate: new Date(String(formData.get("eventDate") || "")),
        place: String(formData.get("place") || ""),
        target: String(formData.get("target") || ""),
        deadline: new Date(String(formData.get("deadline") || "")),
        summary: String(formData.get("summary") || ""),
        details: String(formData.get("details") || ""),
        contact: String(formData.get("contact") || ""),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        actorLabel: `admin: ${user.name}`,
        action: "イベント追加",
        detail: `${title} を追加`,
      },
    }),
  ]);

  return redirectWithNotice(request, "/admin/events", "イベントを登録しました。");
}
