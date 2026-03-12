import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { NavLinks } from "@/components/nav-links";
import { DetailList, NoticeBanner, PageTitle, WorkflowBadge } from "@/components/ui";
import { DEPARTMENTS, MEMBER_SECTIONS, RESEARCH_FIELDS } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { companyToSnapshot } from "@/lib/domain";
import { prisma } from "@/lib/prisma";
import { formatDateTime, readSearchParam } from "@/lib/utils";

type Props = {
  params: Promise<{ section: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function parseSnapshot(raw: string) {
  return JSON.parse(raw) as ReturnType<typeof companyToSnapshot>;
}

function Sidebar() {
  return (
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
  );
}

export default async function MemberSectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const query = (await searchParams) ?? {};
  const notice = readSearchParam(query.notice);
  const kind = readSearchParam(query.kind);
  const user = await requireUser(UserRole.MEMBER);
  const company = user.companyId
    ? await prisma.company.findUnique({
        where: { id: user.companyId },
      })
    : null;

  if (!company) notFound();

  const requests = await prisma.companyUpdateRequest.findMany({
    where: { companyId: company.id },
    orderBy: { updatedAt: "desc" },
  });

  const activeRequest = requests.find((request) =>
    ["DRAFT", "PENDING", "RETURNED", "REJECTED"].includes(request.status),
  );
  const draftSnapshot = activeRequest ? parseSnapshot(activeRequest.snapshotJson) : companyToSnapshot(company);

  if (section === "edit") {
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle
          title="自社情報編集"
          description="企業概要、所在地、関連分野、受入情報、資料を編集し、更新申請できます。"
        />
        <section className="layout-with-sidebar">
          <Sidebar />
          <article className="form-card">
            <form action="/actions/member/company" method="post" encType="multipart/form-data">
              <input type="hidden" name="existingMaterialsJson" value={JSON.stringify(draftSnapshot.materials)} />
              <input type="hidden" name="existingGalleryJson" value={JSON.stringify(draftSnapshot.gallery)} />
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="member-name">企業名</label>
                  <input id="member-name" name="name" defaultValue={draftSnapshot.name} required />
                </div>
                <div className="field">
                  <label htmlFor="member-industry">業種</label>
                  <input id="member-industry" name="industry" defaultValue={draftSnapshot.industry} required />
                </div>
                <div className="field">
                  <label htmlFor="member-city">市区町村</label>
                  <input id="member-city" name="city" defaultValue={draftSnapshot.city} />
                </div>
                <div className="field">
                  <label htmlFor="member-website">Webサイト</label>
                  <input id="member-website" name="website" defaultValue={draftSnapshot.website} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="member-address">所在地</label>
                <input id="member-address" name="address" defaultValue={draftSnapshot.address} />
              </div>
              <div className="field">
                <label htmlFor="member-summary">企業概要</label>
                <textarea id="member-summary" name="summary" defaultValue={draftSnapshot.summary} />
              </div>
              <div className="field">
                <label htmlFor="member-message">企業メッセージ</label>
                <textarea id="member-message" name="message" defaultValue={draftSnapshot.message} />
              </div>
              <div className="field">
                <label htmlFor="member-business">事業内容（1行1項目）</label>
                <textarea id="member-business" name="business" defaultValue={draftSnapshot.business.join("\n")} />
              </div>
              <div className="field">
                <label htmlFor="member-acceptance">受入可能項目（1行1項目）</label>
                <textarea
                  id="member-acceptance"
                  name="acceptanceItems"
                  defaultValue={draftSnapshot.acceptanceItems.join("\n")}
                />
              </div>
              <div className="fieldset">
                <legend>関連学科</legend>
                <div className="checkbox-grid">
                  {DEPARTMENTS.map((department) => (
                    <label className="checkbox-item" key={department}>
                      <input
                        type="checkbox"
                        name="departments"
                        value={department}
                        defaultChecked={draftSnapshot.departments.includes(department)}
                      />
                      {department}
                    </label>
                  ))}
                </div>
              </div>
              <div className="fieldset">
                <legend>関連分野</legend>
                <div className="checkbox-grid">
                  {RESEARCH_FIELDS.map((field) => (
                    <label className="checkbox-item" key={field}>
                      <input
                        type="checkbox"
                        name="relatedFields"
                        value={field}
                        defaultChecked={draftSnapshot.relatedFields.includes(field)}
                      />
                      {field}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="member-keywords">キーワード（カンマ区切り）</label>
                  <input id="member-keywords" name="keywords" defaultValue={draftSnapshot.keywords.join(", ")} />
                </div>
                <div className="field">
                  <label htmlFor="member-hiring">採用・受入情報</label>
                  <input id="member-hiring" name="hiringInfo" defaultValue={draftSnapshot.hiringInfo} />
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="member-internship">インターン受入</label>
                  <select
                    id="member-internship"
                    name="internshipAvailable"
                    defaultValue={draftSnapshot.internshipAvailable ? "true" : "false"}
                  >
                    <option value="true">可</option>
                    <option value="false">不可</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="member-visit">会社見学</label>
                  <select
                    id="member-visit"
                    name="siteVisitAvailable"
                    defaultValue={draftSnapshot.siteVisitAvailable ? "true" : "false"}
                  >
                    <option value="true">可</option>
                    <option value="false">不可</option>
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="member-materials">資料名（1行1項目）</label>
                  <textarea
                    id="member-materials"
                    name="materialsText"
                    defaultValue={draftSnapshot.materials.map((item) => item.name).join("\n")}
                  />
                </div>
                <div className="field">
                  <label htmlFor="member-gallery">画像・掲載項目（1行1項目）</label>
                  <textarea
                    id="member-gallery"
                    name="galleryText"
                    defaultValue={draftSnapshot.gallery.map((item) => item.name).join("\n")}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="member-material-files">資料アップロード</label>
                  <input id="member-material-files" name="materialFiles" type="file" multiple />
                </div>
                <div className="field">
                  <label htmlFor="member-image-files">画像アップロード</label>
                  <input id="member-image-files" name="imageFiles" type="file" multiple accept="image/*" />
                </div>
              </div>
              <div className="button-row">
                <button className="button secondary" type="submit" name="intent" value="save">
                  下書き保存
                </button>
                <button className="button" type="submit" name="intent" value="submit">
                  更新申請
                </button>
              </div>
            </form>
          </article>
        </section>
      </>
    );
  }

  if (section === "status") {
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle
          title="申請状況確認"
          description="承認待ち、承認済み、差戻し、却下などの状況を確認できます。"
        />
        <section className="layout-with-sidebar">
          <Sidebar />
          <article className="table-card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>更新日時</th>
                    <th>状態</th>
                    <th>コメント</th>
                    <th>審査日</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length ? (
                    requests.map((request) => (
                      <tr key={request.id}>
                        <td>{formatDateTime(request.updatedAt)}</td>
                        <td>
                          <WorkflowBadge status={request.status} />
                        </td>
                        <td>{request.reviewComment || "コメントなし"}</td>
                        <td>{formatDateTime(request.reviewedAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>申請履歴はありません。</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </>
    );
  }

  if (section === "public") {
    const snapshot = companyToSnapshot(company);
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="自社公開ページ確認" description="現在公開中の企業ページ内容を確認できます。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <article className="detail-card">
            <div className="status-row">
              <WorkflowBadge status={company.workflowStatus} />
            </div>
            <h3>{company.name}</h3>
            <p>{company.summary}</p>
            <div className="pill-row">
              {snapshot.departments.map((department) => (
                <span className="pill" key={department}>
                  {department}
                </span>
              ))}
            </div>
            <h3>事業内容</h3>
            <DetailList values={snapshot.business} />
            <h3>受入可能項目</h3>
            <DetailList values={snapshot.acceptanceItems} />
            <div className="inline-actions">
              <a className="button secondary" href={`/companies/${company.slug}`}>
                公開ページで見る
              </a>
            </div>
          </article>
        </section>
      </>
    );
  }

  if (section === "inquiries") {
    const inquiries = await prisma.inquiry.findMany({
      where: { relatedCompanyId: company.id },
      orderBy: { createdAt: "desc" },
    });

    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="問い合わせ受信確認" description="自社に関連する問い合わせ内容を確認できます。" />
        <section className="layout-with-sidebar">
          <Sidebar />
          <article className="table-card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>日時</th>
                    <th>種別</th>
                    <th>差出人</th>
                    <th>件名</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length ? (
                    inquiries.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDateTime(item.createdAt)}</td>
                        <td>{item.type}</td>
                        <td>
                          {item.companyName} / {item.contactName}
                        </td>
                        <td>
                          {item.title}
                          <br />
                          <span className="muted small">{item.message}</span>
                        </td>
                        <td>{item.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>関連問い合わせはありません。</td>
                    </tr>
                  )}
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
