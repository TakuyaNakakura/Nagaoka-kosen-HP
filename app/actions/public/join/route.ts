import { NotificationScope } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redirectWithNotice } from "@/lib/action-response";

export async function POST(request: Request) {
  const formData = await request.formData();

  const application = await prisma.membershipApplication.create({
    data: {
      companyName: String(formData.get("companyName") || ""),
      contactName: String(formData.get("contactName") || ""),
      email: String(formData.get("email") || ""),
      membershipType: String(formData.get("membershipType") || ""),
      notes: String(formData.get("notes") || ""),
    },
  });

  await prisma.notification.create({
    data: {
      scope: NotificationScope.ADMIN,
      message: `${application.companyName} から入会相談が届きました。`,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorLabel: "public",
      action: "入会相談登録",
      detail: application.companyName,
    },
  });

  return redirectWithNotice(request, "/join", "入会相談を受け付けました。");
}
