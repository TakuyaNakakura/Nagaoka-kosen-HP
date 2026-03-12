import { prisma } from "@/lib/prisma";
import { DOCUMENT_LINKS } from "@/lib/constants";
import { NoticeBanner, PageTitle } from "@/components/ui";
import { organizationPlans } from "@/lib/domain";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JoinPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);
  const organization = await prisma.organizationInfo.findUnique({ where: { id: 1 } });
  const plans = organization ? organizationPlans(organization) : [];

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="入会案内"
        description="会員種別、会費、規約、各種資料を確認できます。"
      />
      <section className="grid-2">
        <div className="stack">
          {plans.map((plan) => (
            <article className="card" key={plan.id}>
              <h3>{plan.name}</h3>
              <p className="muted">{plan.audience}</p>
              <p>
                <strong>{plan.fee}</strong>
              </p>
              <div className="detail-list">
                {plan.benefits.map((benefit) => (
                  <div className="detail-item" key={benefit}>
                    {benefit}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="stack">
          <article className="card">
            <h3>関連資料</h3>
            <div className="stack">
              {DOCUMENT_LINKS.map((doc) => (
                <a className="ghost-button" key={doc.path} href={doc.path} download>
                  {doc.name}
                </a>
              ))}
            </div>
          </article>
          <article className="form-card">
            <h3>入会相談フォーム</h3>
            <form action="/actions/public/join" method="post">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="join-company-name">会社名</label>
                  <input id="join-company-name" name="companyName" required />
                </div>
                <div className="field">
                  <label htmlFor="join-contact-name">担当者名</label>
                  <input id="join-contact-name" name="contactName" required />
                </div>
                <div className="field">
                  <label htmlFor="join-email">メールアドレス</label>
                  <input id="join-email" name="email" type="email" required />
                </div>
                <div className="field">
                  <label htmlFor="join-type">希望会員種別</label>
                  <select id="join-type" name="membershipType">
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="join-notes">相談内容</label>
                <textarea
                  id="join-notes"
                  name="notes"
                  placeholder="連携テーマ、希望時期など"
                />
              </div>
              <button className="button" type="submit">
                入会相談を送信
              </button>
            </form>
          </article>
        </div>
      </section>
    </>
  );
}
