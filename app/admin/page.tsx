import { UserRole } from "@prisma/client";
import { NavLinks } from "@/components/nav-links";
import { MetricCard, NoticeBanner, PageTitle } from "@/components/ui";
import { ADMIN_SECTIONS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);
  await requireUser(UserRole.ADMIN);

  const [pendingApplications, unresolvedInquiries, publicCompanies, auditCount, notifications] =
    await Promise.all([
      prisma.companyUpdateRequest.count({ where: { status: "PENDING" } }),
      prisma.inquiry.count({ where: { status: { not: "COMPLETED" } } }),
      prisma.company.count({ where: { isPublic: true } }),
      prisma.auditLog.count(),
      prisma.notification.findMany({
        where: { scope: "ADMIN" },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle title="管理ダッシュボード" description="未承認申請数、未対応問い合わせ数、更新状況を確認できます。" />
      <section className="layout-with-sidebar">
        <aside className="sidebar">
          <section className="panel">
            <h3>管理メニュー</h3>
            <NavLinks
              items={ADMIN_SECTIONS.map((section) => ({
                href: section.key ? `/admin/${section.key}` : "/admin",
                label: section.label,
              }))}
              className="subnav"
            />
          </section>
        </aside>
        <div className="section-block">
          <div className="dashboard-grid">
            <MetricCard label="未承認申請" value={pendingApplications} note="更新申請承認ページで審査" />
            <MetricCard label="未完了問い合わせ" value={unresolvedInquiries} note="問い合わせ管理で対応" />
            <MetricCard label="公開企業" value={publicCompanies} note="会員企業管理の公開数" />
            <MetricCard label="監査ログ" value={auditCount} note="操作履歴を永続化" />
          </div>
          <article className="card">
            <h3>管理者通知</h3>
            <div className="stack">
              {notifications.length ? (
                notifications.map((item) => (
                  <div className="detail-item" key={item.id}>
                    <strong>{formatDateTime(item.createdAt)}</strong>
                    <br />
                    {item.message}
                  </div>
                ))
              ) : (
                <div className="empty-state">通知はありません。</div>
              )}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
