import { Resend } from "resend";
import { getAppBaseUrl, isPasswordResetDebugEnabled } from "@/lib/runtime";

type PasswordResetMailInput = {
  email: string;
  name: string;
  token: string;
  requestUrl: string;
};

type DeliveryResult =
  | {
      mode: "email";
      resetUrl: string;
    }
  | {
      mode: "debug";
      resetUrl: string;
    };

export async function sendPasswordResetEmail(input: PasswordResetMailInput): Promise<DeliveryResult> {
  const resetUrl = new URL("/reset-password", getAppBaseUrl(input.requestUrl));
  resetUrl.searchParams.set("token", input.token);
  const resolvedResetUrl = resetUrl.toString();

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const mailFrom = process.env.MAIL_FROM?.trim();

  if (resendApiKey && mailFrom) {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: mailFrom,
      to: [input.email],
      subject: "長岡高専技術協力会 パスワード再設定",
      text: [
        `${input.name} 様`,
        "",
        "パスワード再設定の依頼を受け付けました。",
        "以下のリンクから 1 時間以内に再設定を完了してください。",
        resolvedResetUrl,
      ].join("\n"),
      html: [
        `<p>${escapeHtml(input.name)} 様</p>`,
        "<p>パスワード再設定の依頼を受け付けました。</p>",
        "<p>以下のリンクから 1 時間以内に再設定を完了してください。</p>",
        `<p><a href="${resolvedResetUrl}">${resolvedResetUrl}</a></p>`,
      ].join(""),
    });

    if (error) {
      throw new Error(`再設定メールの送信に失敗しました: ${error.message}`);
    }

    return {
      mode: "email",
      resetUrl: resolvedResetUrl,
    };
  }

  if (isPasswordResetDebugEnabled()) {
    return {
      mode: "debug",
      resetUrl: resolvedResetUrl,
    };
  }

  throw new Error("パスワード再設定メールの送信設定が未完了です。RESEND_API_KEY と MAIL_FROM を設定してください。");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
