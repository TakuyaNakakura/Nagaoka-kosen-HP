import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  articleAttachments,
  companyToSnapshot,
  facultySpecialties,
  seedKeywords,
} from "@/lib/domain";
import { CompanyCard, EventCard, NewsCard, NoticeBanner, PageTitle, SeedCard } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);

  const [companies, seeds, articles, events, inquiryCount] = await Promise.all([
    prisma.company.findMany({
      where: { isPublic: true },
      orderBy: { name: "asc" },
      take: 3,
    }),
    prisma.researchSeed.findMany({
      where: { isPublished: true },
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.newsArticle.findMany({
      where: { isPublished: true },
      orderBy: { publishedDate: "desc" },
      take: 3,
    }),
    prisma.eventItem.findMany({
      where: { isPublished: true },
      orderBy: { eventDate: "asc" },
      take: 3,
    }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
  ]);

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">企業と学校を、技術連携でつなぐ</div>
            <h1>長岡高専技術協力会の活動と連携窓口を、一つに整理したWebサイト</h1>
            <p>
              会員企業情報、教員プロフィール、研究シーズ、活動報告、イベント情報、問い合わせ導線を統合した本番向けベースです。Next.js
              と Prisma を用いて、公開サイト・会員企業・管理者の3ロールを一元化しています。
            </p>
            <div className="hero-actions">
              <Link className="button" href="/companies">
                会員企業を探す
              </Link>
              <Link className="ghost-button invert" href="/research">
                研究シーズを見る
              </Link>
              <Link className="ghost-button invert" href="/contact">
                技術相談を送る
              </Link>
            </div>
          </div>
          <div className="hero-stats">
            <div className="card">
              <div className="grid-2">
                <div>
                  <span className="muted small">公開企業</span>
                  <span className="value">{companies.length}</span>
                </div>
                <div>
                  <span className="muted small">公開研究シーズ</span>
                  <span className="value">{seeds.length}</span>
                </div>
                <div>
                  <span className="muted small">今後のイベント</span>
                  <span className="value">{events.length}</span>
                </div>
                <div>
                  <span className="muted small">未対応問い合わせ</span>
                  <span className="value">{inquiryCount}</span>
                </div>
              </div>
            </div>
            <div className="hero-callout">
              <strong>デモ用ログイン</strong>
              <p className="small">
                会員企業: <code>member@example.com / member123</code>
                <br />
                管理者: <code>admin@example.com / admin123</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>主要導線</h2>
            <p>トップから3クリック以内で主要機能へ到達できる構成です。</p>
          </div>
        </div>
        <div className="grid-3">
          <article className="card">
            <h3>会員企業を探す</h3>
            <p>業種、関連分野、関連学科、キーワードから会員企業を検索できます。</p>
            <Link className="button secondary" href="/companies">
              企業一覧・検索
            </Link>
          </article>
          <article className="card">
            <h3>教員・研究シーズを探す</h3>
            <p>教員名、研究キーワード、学科から研究情報を確認できます。</p>
            <Link className="button secondary" href="/research">
              教員・研究シーズ
            </Link>
          </article>
          <article className="card">
            <h3>相談する</h3>
            <p>技術相談、共同研究相談、一般問い合わせ、入会相談を受け付けます。</p>
            <Link className="button secondary" href="/contact">
              問い合わせフォーム
            </Link>
          </article>
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>新規の会員企業</h2>
            <p>研究連携やインターン受入に積極的な企業を掲載しています。</p>
          </div>
          <Link className="ghost-button" href="/companies">
            すべて見る
          </Link>
        </div>
        <div className="card-grid">
          {companies.map((company) => {
            const snapshot = companyToSnapshot(company);
            return (
              <CompanyCard
                key={company.id}
                company={{
                  slug: company.slug,
                  name: company.name,
                  industry: company.industry,
                  city: company.city,
                  summary: company.summary,
                  relatedFields: snapshot.relatedFields,
                  departments: snapshot.departments,
                  workflowStatus: company.workflowStatus,
                }}
              />
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>研究シーズ</h2>
            <p>共同研究や技術相談に発展しやすいテーマをピックアップしています。</p>
          </div>
          <Link className="ghost-button" href="/research">
            一覧へ
          </Link>
        </div>
        <div className="card-grid">
          {seeds.map((seed) => (
            <SeedCard
              key={seed.id}
              seed={{
                slug: seed.slug,
                title: seed.title,
                department: seed.department,
                teacherName: seed.teacher.name,
                summary: seed.summary,
                keywords: seedKeywords(seed),
                isPublished: seed.isPublished,
              }}
            />
          ))}
        </div>
      </section>

      <section className="split">
        <div className="section-block">
          <div className="section-header">
            <div>
              <h2>最新情報</h2>
              <p>活動報告、議事録、制度案内をまとめています。</p>
            </div>
            <Link className="ghost-button" href="/news">
              一覧へ
            </Link>
          </div>
          <div className="stack">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
        <div className="section-block">
          <div className="section-header">
            <div>
              <h2>活動予定</h2>
              <p>講演会、交流会、説明会などを確認できます。</p>
            </div>
            <Link className="ghost-button" href="/events">
              一覧へ
            </Link>
          </div>
          <div className="timeline">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
