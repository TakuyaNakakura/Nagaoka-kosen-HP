import { NextResponse } from "next/server";

export function redirectWithNotice(
  request: Request,
  fallbackPath: string,
  notice: string,
  kind: "success" | "error" = "success",
) {
  const referer = request.headers.get("referer");
  const url = referer ? new URL(referer) : new URL(fallbackPath, request.url);
  url.searchParams.set("notice", notice);
  url.searchParams.set("kind", kind);
  return NextResponse.redirect(url);
}
