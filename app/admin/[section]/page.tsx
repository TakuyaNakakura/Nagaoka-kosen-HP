import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { NavLinks } from "@/components/nav-links";
import {
  AdminTableRowDate,
  AssetList,
  EmptyState,
  InquiryStatusBadge,
  MembershipStatusBadge,
  NoticeBanner,
  PageTitle,
  WorkflowBadge,
} from "@/components/ui";
import { ADMIN_SECTIONS, DEPARTMENTS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import {
  articleAttachments,
  companyToSnapshot,
  organizationOfficers,
  organizationPlans,
  organizationPurpose,
  organizationRules,
  permissionCapabilities,
  seedKeywords,
} from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime, readSearchParam } from "@/lib/utils";

type Props = {
  params: Promise<{ section: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function Sidebar() {
  return (
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
  );
}

export default async function AdminSectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const query = (await searchParams) ?? {};
  const notice = readSearchParam(query.notice);
  const kind = readSearchParam(query.kind);
  await requireUser(UserRole.ADMIN);

  if (section === "companies") {
    const companies = await prisma.company.findMany({ orderBy: { name: "asc" } });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="会員企業管理" description="会員企業情報の登録、編集、公開状態を管理します。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>企業名</th>
                      <th>業種</th>
                      <th>公開</th>
                      <th>ワークフロー</th>
                      <th>最終公開日</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td>{company.name}</td>
                        <td>{company.industry}</td>
                        <td>{company.isPublic ? "公開" : "非公開"}</td>
                        <td>
                          <WorkflowBadge status={company.workflowStatus} />
                        </td>
                        <td>{formatDate(company.lastPublishedAt)}</td>
                        <td>
                          <div className="inline-actions">
                            <a href={`/companies/${company.slug}`}>公開ページ</a>
                            <form action="/actions/admin/company" method="post">
                              <input type="hidden" name="intent" value="toggle-public" />
                              <input type="hidden" name="companyId" value={company.id} />
                              <button className="ghost-button" type="submit">
                                公開切替
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="form-card">
              <h3>会員企業追加</h3>
              <form action="/actions/admin/company" method="post">
                <input type="hidden" name="intent" value="create" />
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="company-name">企業名</label>
                    <input id="company-name" name="name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="company-industry">業種</label>
                    <input id="company-industry" name="industry" required />
                  </div>
                  <div className="field">
                    <label htmlFor="company-city">市区町村</label>
                    <input id="company-city" name="city" required />
                  </div>
                  <div className="field">
                    <label htmlFor="company-website">Webサイト</label>
                    <input id="company-website" name="website" required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="company-address">所在地</label>
                  <input id="company-address" name="address" required />
                </div>
                <div className="field">
                  <label htmlFor="company-summary">企業概要</label>
                  <textarea id="company-summary" name="summary" />
                </div>
                <div className="button-row">
                  <button className="button" type="submit">
                    登録
                  </button>
                </div>
              </form>
            </article>
          </div>
        </section>
      </>
    );
  }

  if (section === "accounts") {
    const [accounts, companies] = await Promise.all([
      prisma.user.findMany({
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        include: { company: true },
      }),
      prisma.company.findMany({
        where: {
          users: {
            none: {
              role: "MEMBER",
            },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="アカウント管理" description="会員企業アカウントの発行、停止、再設定を行います。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>種別</th>
                      <th>名称</th>
                      <th>メールアドレス</th>
                      <th>状態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account) => (
                      <tr key={account.id}>
                        <td>{account.role}</td>
                        <td>{account.role === "MEMBER" ? account.company?.name || account.name : account.name}</td>
                        <td>{account.email}</td>
                        <td>{account.active ? "有効" : "停止"}</td>
                        <td>
                          <form action="/actions/admin/account" method="post">
                            <input type="hidden" name="intent" value="toggle-active" />
                            <input type="hidden" name="userId" value={account.id} />
                            <button className="ghost-button" type="submit">
                              状態切替
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="form-card">
              <h3>会員企業アカウント追加</h3>
              <form action="/actions/admin/account" method="post">
                <input type="hidden" name="intent" value="create-member" />
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="account-company">対象企業</label>
                    <select id="account-company" name="companyId">
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="account-email">メールアドレス</label>
                    <input id="account-email" name="email" type="email" required />
                  </div>
                  <div className="field">
                    <label htmlFor="account-name">表示名</label>
                    <input id="account-name" name="name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="account-password">初期パスワード</label>
                    <input id="account-password" name="password" type="password" required />
                  </div>
                </div>
                <button className="button" type="submit">
                  アカウント発行
                </button>
              </form>
            </article>
          </div>
        </section>
      </>
    );
  }

  if (section === "applications") {
    const applications = await prisma.companyUpdateRequest.findMany({
      orderBy: { updatedAt: "desc" },
      include: { company: true },
    });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="更新申請承認" description="会員企業からの更新申請を承認、差戻し、却下できます。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            {applications.map((application) => {
              const snapshot = JSON.parse(application.snapshotJson) as ReturnType<typeof companyToSnapshot>;
              return (
                <article className="card" key={application.id}>
                  <div className="card-top">
                    <div>
                      <h3>{application.company.name}</h3>
                      <p className="muted small">申請日 {formatDateTime(application.submittedAt || application.updatedAt)}</p>
                    </div>
                    <WorkflowBadge status={application.status} />
                  </div>
                  <p>{snapshot.summary}</p>
                  <div className="pill-row">
                    {snapshot.relatedFields.map((field) => (
                      <span className="pill" key={field}>
                        {field}
                      </span>
                    ))}
                  </div>
                  <form action="/actions/admin/application" method="post">
                    <input type="hidden" name="applicationId" value={application.id} />
                    <div className="field">
                      <label htmlFor={`review-${application.id}`}>コメント</label>
                      <textarea
                        id={`review-${application.id}`}
                        name="reviewComment"
                        defaultValue={application.reviewComment || ""}
                      />
                    </div>
                    <div className="button-row">
                      <button className="button" type="submit" name="action" value="approve">
                        承認
                      </button>
                      <button className="button secondary" type="submit" name="action" value="return">
                        差戻し
                      </button>
                      <button className="button danger" type="submit" name="action" value="reject">
                        却下
                      </button>
                    </div>
                  </form>
                </article>
              );
            })}
          </div>
        </section>
      </>
    );
  }

  if (section === "faculty") {
    const faculty = await prisma.faculty.findMany({ orderBy: { name: "asc" } });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="教員プロフィール管理" description="教員情報の登録、編集、公開状態を管理します。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>教員名</th>
                      <th>学科</th>
                      <th>状態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.department}</td>
                        <td>{item.isPublished ? "公開" : "非公開"}</td>
                        <td>
                          <form action="/actions/admin/publish" method="post">
                            <input type="hidden" name="kind" value="faculty" />
                            <input type="hidden" name="id" value={item.id} />
                            <button className="ghost-button" type="submit">
                              公開切替
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="form-card">
              <h3>教員プロフィール追加</h3>
              <form action="/actions/admin/faculty" method="post">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="faculty-name">教員名</label>
                    <input id="faculty-name" name="name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="faculty-department">学科</label>
                    <select id="faculty-department" name="department">
                      {DEPARTMENTS.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="faculty-specialties">専門分野（カンマ区切り）</label>
                  <input id="faculty-specialties" name="specialties" />
                </div>
                <div className="field">
                  <label htmlFor="faculty-summary">研究内容</label>
                  <textarea id="faculty-summary" name="summary" />
                </div>
                <div className="field">
                  <label htmlFor="faculty-contact">問い合わせ先</label>
                  <input id="faculty-contact" name="contact" />
                </div>
                <button className="button" type="submit">
                  登録
                </button>
              </form>
            </article>
          </div>
        </section>
      </>
    );
  }

  if (section === "seeds") {
    const [seeds, faculty] = await Promise.all([
      prisma.researchSeed.findMany({
        include: { teacher: true },
        orderBy: { title: "asc" },
      }),
      prisma.faculty.findMany({ orderBy: { name: "asc" } }),
    ]);
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="技術シーズ管理" description="技術シーズ情報の登録、編集、公開切替を行います。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>タイトル</th>
                      <th>学科</th>
                      <th>担当教員</th>
                      <th>状態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seeds.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.department}</td>
                        <td>{item.teacher.name}</td>
                        <td>{item.isPublished ? "公開" : "非公開"}</td>
                        <td>
                          <form action="/actions/admin/publish" method="post">
                            <input type="hidden" name="kind" value="seed" />
                            <input type="hidden" name="id" value={item.id} />
                            <button className="ghost-button" type="submit">
                              公開切替
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="form-card">
              <h3>技術シーズ追加</h3>
              <form action="/actions/admin/seed" method="post">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="seed-title">タイトル</label>
                    <input id="seed-title" name="title" required />
                  </div>
                  <div className="field">
                    <label htmlFor="seed-department">学科</label>
                    <select id="seed-department" name="department">
                      {DEPARTMENTS.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="seed-teacher">担当教員</label>
                    <select id="seed-teacher" name="teacherId">
                      {faculty.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="seed-keywords">キーワード（カンマ区切り）</label>
                    <input id="seed-keywords" name="keywords" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="seed-summary">概要</label>
                  <textarea id="seed-summary" name="summary" />
                </div>
                <div className="field">
                  <label htmlFor="seed-potential">活用可能性</label>
                  <textarea id="seed-potential" name="potential" />
                </div>
                <div className="field">
                  <label htmlFor="seed-collaboration">共同研究の可能性</label>
                  <input id="seed-collaboration" name="collaboration" />
                </div>
                <button className="button" type="submit">
                  登録
                </button>
              </form>
            </article>
          </div>
        </section>
      </>
    );
  }

  if (section === "news") {
    const articles = await prisma.newsArticle.findMany({
      orderBy: { publishedDate: "desc" },
    });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="ニュース管理" description="記事の作成、編集、公開状態の切替を行います。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>タイトル</th>
                      <th>カテゴリ</th>
                      <th>日付</th>
                      <th>状態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.category}</td>
                        <td>{formatDate(item.publishedDate)}</td>
                        <td>{item.isPublished ? "公開" : "非公開"}</td>
                        <td>
                          <form action="/actions/admin/publish" method="post">
                            <input type="hidden" name="kind" value="news" />
                            <input type="hidden" name="id" value={item.id} />
                            <button className="ghost-button" type="submit">
                              公開切替
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="form-card">
              <h3>記事追加</h3>
              <form action="/actions/admin/news" method="post">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="news-title">タイトル</label>
                    <input id="news-title" name="title" required />
                  </div>
                  <div className="field">
                    <label htmlFor="news-category">カテゴリ</label>
                    <input id="news-category" name="category" required />
                  </div>
                  <div className="field">
                    <label htmlFor="news-date">日付</label>
                    <input id="news-date" name="date" type="date" required />
                  </div>
                  <div className="field">
                    <label htmlFor="news-attachments">添付資料（カンマ区切り）</label>
                    <input id="news-attachments" name="attachments" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="news-summary">概要</label>
                  <textarea id="news-summary" name="summary" />
                </div>
                <div className="field">
                  <label htmlFor="news-body">本文</label>
                  <textarea id="news-body" name="body" />
                </div>
                <button className="button" type="submit">
                  登録
                </button>
              </form>
            </article>
          </div>
        </section>
      </>
    );
  }

  if (section === "events") {
    const events = await prisma.eventItem.findMany({ orderBy: { eventDate: "asc" } });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="イベント管理" description="イベント、講演会、説明会等の予定情報を登録・編集・公開します。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            <article className="table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>イベント名</th>
                      <th>開催日</th>
                      <th>対象</th>
                      <th>状態</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{formatDate(item.eventDate)}</td>
                        <td>{item.target}</td>
                        <td>{item.isPublished ? "公開" : "非公開"}</td>
                        <td>
                          <form action="/actions/admin/publish" method="post">
                            <input type="hidden" name="kind" value="event" />
                            <input type="hidden" name="id" value={item.id} />
                            <button className="ghost-button" type="submit">
                              公開切替
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article className="form-card">
              <h3>イベント追加</h3>
              <form action="/actions/admin/event" method="post">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="event-title">イベント名</label>
                    <input id="event-title" name="title" required />
                  </div>
                  <div className="field">
                    <label htmlFor="event-date">開催日</label>
                    <input id="event-date" name="eventDate" type="date" required />
                  </div>
                  <div className="field">
                    <label htmlFor="event-place">場所</label>
                    <input id="event-place" name="place" required />
                  </div>
                  <div className="field">
                    <label htmlFor="event-target">対象者</label>
                    <input id="event-target" name="target" required />
                  </div>
                  <div className="field">
                    <label htmlFor="event-deadline">申込締切</label>
                    <input id="event-deadline" name="deadline" type="date" required />
                  </div>
                  <div className="field">
                    <label htmlFor="event-contact">問い合わせ先</label>
                    <input id="event-contact" name="contact" required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="event-summary">概要</label>
                  <textarea id="event-summary" name="summary" />
                </div>
                <div className="field">
                  <label htmlFor="event-details">詳細</label>
                  <textarea id="event-details" name="details" />
                </div>
                <button className="button" type="submit">
                  登録
                </button>
              </form>
            </article>
          </div>
        </section>
      </>
    );
  }

  if (section === "inquiries") {
    const inquiries = await prisma.inquiry.findMany({
      include: { relatedCompany: true },
      orderBy: { createdAt: "desc" },
    });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="問い合わせ管理" description="問い合わせの確認、担当者振分け、対応状況管理を行います。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            {inquiries.map((item) => (
              <article className="card" key={item.id}>
                <div className="card-top">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="muted small">
                      {formatDateTime(item.createdAt)} / {item.companyName} / {item.contactName}
                    </p>
                  </div>
                  <InquiryStatusBadge status={item.status} />
                </div>
                <p>{item.message}</p>
                <form action="/actions/admin/inquiry" method="post">
                  <input type="hidden" name="inquiryId" value={item.id} />
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor={`inquiry-assigned-${item.id}`}>担当者</label>
                      <input id={`inquiry-assigned-${item.id}`} name="assignedTo" defaultValue={item.assignedTo} />
                    </div>
                    <div className="field">
                      <label htmlFor={`inquiry-status-${item.id}`}>対応状況</label>
                      <select id={`inquiry-status-${item.id}`} name="status" defaultValue={item.status}>
                        <option value="NEW">新規</option>
                        <option value="IN_PROGRESS">対応中</option>
                        <option value="COMPLETED">完了</option>
                      </select>
                    </div>
                  </div>
                  <button className="button secondary" type="submit">
                    更新
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  }

  if (section === "join") {
    const applications = await prisma.membershipApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="入会申請管理" description="入会申請内容の確認、審査、対応状況管理を行います。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            {applications.map((item) => (
              <article className="card" key={item.id}>
                <div className="card-top">
                  <div>
                    <h3>{item.companyName}</h3>
                    <p className="muted small">
                      {item.contactName} / {item.email}
                    </p>
                  </div>
                  <MembershipStatusBadge status={item.status} />
                </div>
                <p>
                  <strong>希望種別:</strong> {item.membershipType}
                </p>
                <p>{item.notes}</p>
                <form action="/actions/admin/membership" method="post">
                  <input type="hidden" name="membershipId" value={item.id} />
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor={`membership-status-${item.id}`}>状態</label>
                      <select id={`membership-status-${item.id}`} name="status" defaultValue={item.status}>
                        <option value="NEW">新規</option>
                        <option value="REVIEWING">審査中</option>
                        <option value="COMPLETED">完了</option>
                      </select>
                    </div>
                  </div>
                  <button className="button secondary" type="submit">
                    更新
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  }

  if (section === "organization") {
    const organization = await prisma.organizationInfo.findUnique({ where: { id: 1 } });
    if (!organization) notFound();
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="組織情報管理" description="概要、役員、規約、会費等の組織情報を更新できます。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <article className="form-card">
            <form action="/actions/admin/organization" method="post">
              <div className="field">
                <label htmlFor="org-overview">概要</label>
                <textarea id="org-overview" name="overview" defaultValue={organization.overview} />
              </div>
              <div className="field">
                <label htmlFor="org-purpose">設立目的（1行1項目）</label>
                <textarea id="org-purpose" name="purpose" defaultValue={organizationPurpose(organization).join("\n")} />
              </div>
              <div className="field">
                <label htmlFor="org-officers">役員（1行1項目）</label>
                <textarea id="org-officers" name="officers" defaultValue={organizationOfficers(organization).join("\n")} />
              </div>
              <div className="field">
                <label htmlFor="org-rules">規約（1行1項目）</label>
                <textarea id="org-rules" name="rules" defaultValue={organizationRules(organization).join("\n")} />
              </div>
              <div className="field">
                <label htmlFor="org-plans">会員プラン（JSON）</label>
                <textarea id="org-plans" name="plans" defaultValue={JSON.stringify(organizationPlans(organization), null, 2)} />
              </div>
              <button className="button" type="submit">
                更新
              </button>
            </form>
          </article>
        </section>
      </>
    );
  }

  if (section === "permissions") {
    const profiles = await prisma.permissionProfile.findMany({
      orderBy: { createdAt: "asc" },
    });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="権限管理" description="管理者ごとの利用可能機能や担当範囲を設定できます。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <div className="stack">
            {profiles.map((profile) => (
              <article className="form-card" key={profile.id}>
                <h3>{profile.roleName}</h3>
                <form action="/actions/admin/permission" method="post">
                  <input type="hidden" name="permissionId" value={profile.id} />
                  <div className="field">
                    <label htmlFor={`permission-scope-${profile.id}`}>担当範囲</label>
                    <input id={`permission-scope-${profile.id}`} name="scope" defaultValue={profile.scope} />
                  </div>
                  <div className="field">
                    <label htmlFor={`permission-capabilities-${profile.id}`}>権限（1行1項目）</label>
                    <textarea
                      id={`permission-capabilities-${profile.id}`}
                      name="capabilities"
                      defaultValue={permissionCapabilities(profile).join("\n")}
                    />
                  </div>
                  <button className="button secondary" type="submit">
                    更新
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  }

  if (section === "audit") {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="更新履歴・監査ログ" description="各種データの更新履歴、承認履歴、操作履歴を確認できます。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <article className="table-card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>日時</th>
                    <th>操作主体</th>
                    <th>操作</th>
                    <th>詳細</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td>{item.actorLabel}</td>
                      <td>{item.action}</td>
                      <td>{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </>
    );
  }

  notFound();
}
