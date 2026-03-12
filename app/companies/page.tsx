import { prisma } from "@/lib/prisma";
import { companyToSnapshot } from "@/lib/domain";
import { DEPARTMENTS, INDUSTRIES, RESEARCH_FIELDS } from "@/lib/constants";
import { CompanyCard, NoticeBanner, PageTitle } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompaniesPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const q = readSearchParam(params.q).toLowerCase();
  const industry = readSearchParam(params.industry);
  const field = readSearchParam(params.field);
  const department = readSearchParam(params.department);
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);

  const companies = await prisma.company.findMany({
    where: { isPublic: true },
    orderBy: { name: "asc" },
  });

  const filtered = companies.filter((company) => {
    const snapshot = companyToSnapshot(company);
    const haystack = [
      company.name,
      company.industry,
      company.summary,
      snapshot.business.join(" "),
      snapshot.relatedFields.join(" "),
      snapshot.departments.join(" "),
      snapshot.keywords.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!q || haystack.includes(q)) &&
      (!industry || company.industry === industry) &&
      (!field || snapshot.relatedFields.includes(field)) &&
      (!department || snapshot.departments.includes(department))
    );
  });

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="会員企業一覧・検索"
        description="企業名、業種、関連分野、関連学科で会員企業を絞り込めます。"
      />
      <section className="filter-card">
        <form method="get">
          <div className="search-bar">
            <div className="field">
              <label htmlFor="company-q">キーワード</label>
              <input
                id="company-q"
                name="q"
                defaultValue={q}
                placeholder="企業名、事業内容、キーワード"
              />
            </div>
            <div className="field">
              <label htmlFor="company-industry">業種</label>
              <select id="company-industry" name="industry" defaultValue={industry}>
                <option value="">すべて</option>
                {INDUSTRIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="company-field">関連分野</label>
              <select id="company-field" name="field" defaultValue={field}>
                <option value="">すべて</option>
                {RESEARCH_FIELDS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="company-department">関連学科</label>
              <select id="company-department" name="department" defaultValue={department}>
                <option value="">すべて</option>
                {DEPARTMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button className="button" type="submit">
              検索
            </button>
          </div>
        </form>
      </section>
      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>検索結果</h2>
            <p>{filtered.length}件の会員企業が見つかりました。</p>
          </div>
        </div>
        <div className="card-grid">
          {filtered.length ? (
            filtered.map((company) => {
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
            })
          ) : (
            <div className="empty-state">条件に一致する企業はありません。</div>
          )}
        </div>
      </section>
    </>
  );
}
