import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { NavLinks } from "@/components/nav-links";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "長岡高専技術協力会 Webサイト",
  description:
    "長岡工業高等専門学校 技術協力会の公開サイト、会員企業サイト、管理画面を備えた Next.js 実装です。",
};

const NAV_ITEMS = [
  { href: "/", label: "トップ" },
  { href: "/companies", label: "会員企業" },
  { href: "/research", label: "研究シーズ" },
  { href: "/news", label: "活動報告" },
  { href: "/events", label: "イベント" },
  { href: "/join", label: "入会案内" },
  { href: "/contact", label: "問い合わせ" },
  { href: "/organization", label: "組織情報" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "MEMBER" ? "/member" : "/login";

  const dashboardLabel =
    user?.role === "ADMIN"
      ? "管理ダッシュボード"
      : user?.role === "MEMBER"
        ? "会員企業マイページ"
        : "ログイン";

  return (
    <html lang="ja">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="header-inner">
              <Link className="brand" href="/">
                <span className="brand-kicker">Nagaoka Kosen</span>
                <span className="brand-name">長岡高専技術協力会 Webサイト</span>
              </Link>
              <div className="nav-row">
                <NavLinks items={NAV_ITEMS} className="nav-links" />
                {user ? (
                  <span className="session-pill">
                    {user.name} / {user.role === "ADMIN" ? "admin" : "member"}
                  </span>
                ) : null}
                <Link className="ghost-button" href={dashboardHref}>
                  {dashboardLabel}
                </Link>
                {user ? (
                  <form action="/actions/auth/logout" method="post">
                    <button className="ghost-button" type="submit">
                      ログアウト
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </header>
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <div className="site-footer-inner">
              <p className="footer-note">
                Next.js + Prisma で再構成した本番向けベースです。公開サイト、会員企業、管理者向け機能を同一コードベースで運用できます。
              </p>
              <div className="inline-actions">
                <Link className="ghost-button" href="/guides">
                  対象別案内
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
