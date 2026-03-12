import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssetList, DetailList, NoticeBanner, PageTitle, PillRow, TagRow, WorkflowBadge } from "@/components/ui";
import { companyToSnapshot } from "@/lib/domain";
import { readSearchParam } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompanyDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const notice = readSearchParam(query.notice);
  const kind = readSearchParam(query.kind);
  const company = await prisma.company.findUnique({
    where: { slug },
  });

  if (!company || !company.isPublic) notFound();

  const snapshot = companyToSnapshot(company);

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle title={company.name} description={`${company.industry} / ${company.city}`} />
      <section className="detail-grid">
        <article className="detail-card">
          <div className="status-row">
            <WorkflowBadge status={company.workflowStatus} />
            <TagRow values={snapshot.relatedFields} />
          </div>
          <h3>企業概要</h3>
          <p>{company.summary}</p>
          <h3>事業内容</h3>
          <DetailList values={snapshot.business} />
          <h3>受入可能項目</h3>
          <DetailList values={snapshot.acceptanceItems} />
          <h3>企業メッセージ</h3>
          <p>{company.message}</p>
        </article>
        <aside className="detail-card">
          <h3>基本情報</h3>
          <div className="detail-list">
            <div className="detail-item">
              <strong>所在地</strong>
              <br />
              {company.address}
            </div>
            <div className="detail-item">
              <strong>関連学科</strong>
              <br />
              {snapshot.departments.join(" / ")}
            </div>
            <div className="detail-item">
              <strong>会社見学</strong>
              <br />
              {company.siteVisitAvailable ? "可" : "要相談"}
            </div>
            <div className="detail-item">
              <strong>インターン受入</strong>
              <br />
              {company.internshipAvailable ? "可" : "現在募集なし"}
            </div>
            <div className="detail-item">
              <strong>採用・受入情報</strong>
              <br />
              {company.hiringInfo}
            </div>
            <div className="detail-item">
              <strong>外部リンク</strong>
              <br />
              <a href={company.website} target="_blank" rel="noreferrer">
                {company.website}
              </a>
            </div>
          </div>
          <h3>資料</h3>
          <AssetList items={snapshot.materials} />
          <h3>ギャラリー</h3>
          <AssetList items={snapshot.gallery} />
          <Link className="button" href={`/contact?type=TECHNICAL&company=${company.slug}`}>
            この企業に関する相談
          </Link>
        </aside>
      </section>
    </>
  );
}
