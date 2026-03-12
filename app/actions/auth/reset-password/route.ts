import { NextResponse } from "next/server";
import { consumePasswordResetToken } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");

  if (password.length < 8) {
    return NextResponse.redirect(
      new URL(
        `/reset-password?notice=${encodeURIComponent("パスワードは8文字以上にしてください")}&kind=error`,
        request.url,
      ),
    );
  }

  const ok = await consumePasswordResetToken(token, password);

  return NextResponse.redirect(
    new URL(
      ok
        ? `/login?notice=${encodeURIComponent("パスワードを更新しました")}&kind=success`
        : `/reset-password?notice=${encodeURIComponent("トークンが無効または期限切れです")}&kind=error`,
      request.url,
    ),
  );
}
