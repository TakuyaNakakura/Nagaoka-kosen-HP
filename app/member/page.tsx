import { UserRole } from "@prisma/client";
import { NavLinks } from "@/components/nav-links";
import { DetailList, MetricCard, NoticeBanner, PageTitle } from "@/components/ui";
import { MEMBER_SECTIONS, WORKFLOW_LABELS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { companyToSnapshot } from "@/lib/domain";
import { formatDate, formatDateTime, readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MemberDashboardPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);
  const user = await requireUser(UserRole.MEMBER);
  const company = user.companyId
    ? await prisma.company.findUnique({
        where: { id: user.companyId },
      })
    : null;

  if (!company) {
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="会員企業マイページ" description="企業情報がアカウントに紐付いていません。" />
      </>
    );
  }

  const [notifications, requests, inquiryCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        scope: "MEMBER",
        companyId: company.id,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.companyUpdateRequest.findMany({
      where: { companyId: company.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.inquiry.count({
      where: { relatedCompanyId: company.id },
    }),
  ]);

  const snapshot = companyToSnapshot(company);

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="会員企業マイページ"
        description="自社情報、公開状況、申請状況、通知を確認できます。"
      />
      <section className="layout-with-sidebar">
        <aside className="sidebar">
          <section className="panel">
            <h3>会員企業メニュー</h3>
            <NavLinks
              items={MEMBER_SECTIONS.map((section) => ({
                href: section.key ? `/member/${section.key}` : "/member",
                label: section.label,
              }))}
              className="subnav"
            />
          </section>
        </aside>
        <div className="section-block">
          <div className="dashboard-grid">
            <MetricCard
              label="公開状態"
              value={WORKFLOW_LABELS[company.workflowStatus]}
              note="現在の企業ページの状態"
            />
            <MetricCard label="申請件数" value={requests.length} note="過去を含む更新申請数" />
            <MetricCard label="関連問い合わせ" value={inquiryCount} note="自社に関連する問い合わせ" />
            <MetricCard
              label="最終公開日"
              value={formatDate(company.lastPublishedAt)}
              note="公開ページ反映日"
            />
          </div>
          <article className="card">
            <h3>{company.name}</h3>
            <p>{company.summary}</p>
            <div className="pill-row">
              {snapshot.departments.map((department) => (
                <span className="pill" key={department}>
                  {department}
                </span>
              ))}
            </div>
            <div className="inline-actions">
              <a className="button secondary" href="/member/edit">
                自社情報を編集
              </a>
              <a className="ghost-button" href="/member/public">
                公開ページ確認
              </a>
            </div>
          </article>
          <article className="card">
            <h3>通知</h3>
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
