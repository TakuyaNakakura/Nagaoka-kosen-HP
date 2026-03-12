import { InquiryType, NotificationScope } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { redirectWithNotice } from "@/lib/action-response";

export async function POST(request: Request) {
  const formData = await request.formData();
  const companySlug = String(formData.get("companySlug") || "");
  const company = companySlug
    ? await prisma.company.findUnique({ where: { slug: companySlug } })
    : null;

  const inquiry = await prisma.inquiry.create({
    data: {
      type: String(formData.get("type") || "TECHNICAL") as InquiryType,
      companyName: String(formData.get("companyName") || ""),
      contactName: String(formData.get("contactName") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      title: String(formData.get("title") || ""),
      message: String(formData.get("message") || ""),
      relatedCompanyId: company?.id,
      assignedTo: "技術協力会 事務局",
    },
  });

  await prisma.notification.create({
    data: {
      scope: NotificationScope.ADMIN,
      message: `新しい問い合わせ「${inquiry.title}」が届きました。`,
    },
  });

  if (company) {
    await prisma.notification.create({
      data: {
        scope: NotificationScope.MEMBER,
        companyId: company.id,
        message: `${inquiry.companyName} から問い合わせが届きました。`,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorLabel: "public",
      action: "問い合わせ登録",
      detail: inquiry.title,
    },
  });

  return redirectWithNotice(request, "/contact", "問い合わせを受け付けました。");
}
