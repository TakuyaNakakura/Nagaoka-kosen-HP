import { prisma } from "@/lib/prisma";
import { NoticeBanner, PageTitle } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContactPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const type = readSearchParam(params.type, "TECHNICAL");
  const companySlug = readSearchParam(params.company);
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);

  const companies = await prisma.company.findMany({
    where: { isPublic: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="問い合わせ"
        description="技術相談、共同研究相談、一般問い合わせを受け付けます。"
      />
      <section className="form-card">
        <form action="/actions/public/contact" method="post">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="contact-type">問い合わせ種別</label>
              <select id="contact-type" name="type" defaultValue={type}>
                <option value="TECHNICAL">技術相談</option>
                <option value="JOINT">共同研究相談</option>
                <option value="GENERAL">一般問い合わせ</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="contact-company">関連企業</label>
              <select id="contact-company" name="companySlug" defaultValue={companySlug}>
                <option value="">指定なし</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.slug}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="contact-company-name">会社名</label>
              <input id="contact-company-name" name="companyName" required />
            </div>
            <div className="field">
              <label htmlFor="contact-person-name">担当者名</label>
              <input id="contact-person-name" name="contactName" required />
            </div>
            <div className="field">
              <label htmlFor="contact-email">メールアドレス</label>
              <input id="contact-email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="contact-phone">電話番号</label>
              <input id="contact-phone" name="phone" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="contact-title">件名</label>
            <input id="contact-title" name="title" required />
          </div>
          <div className="field">
            <label htmlFor="contact-message">問い合わせ内容</label>
            <textarea
              id="contact-message"
              name="message"
              required
              placeholder="技術課題、相談したい内容、希望時期など"
            />
          </div>
          <button className="button" type="submit">
            送信する
          </button>
        </form>
      </section>
    </>
  );
}
