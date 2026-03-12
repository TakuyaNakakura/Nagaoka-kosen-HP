import { prisma } from "@/lib/prisma";
import { DEPARTMENTS } from "@/lib/constants";
import { facultySpecialties, seedKeywords } from "@/lib/domain";
import { FacultyCard, NoticeBanner, PageTitle, SeedCard } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResearchPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const q = readSearchParam(params.q).toLowerCase();
  const department = readSearchParam(params.department);
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);

  const [facultyRecords, seedRecords] = await Promise.all([
    prisma.faculty.findMany({
      where: { isPublished: true },
      orderBy: { name: "asc" },
    }),
    prisma.researchSeed.findMany({
      where: { isPublished: true },
      include: { teacher: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const faculty = facultyRecords
    .map((item) => ({ ...item, specialties: facultySpecialties(item) }))
    .filter((item) => {
      const haystack = [item.name, item.department, item.summary, item.specialties.join(" ")]
        .join(" ")
        .toLowerCase();
      return (!q || haystack.includes(q)) && (!department || item.department === department);
    });

  const seeds = seedRecords
    .map((item) => ({ ...item, keywords: seedKeywords(item) }))
    .filter((item) => {
      const haystack = [
        item.title,
        item.department,
        item.summary,
        item.potential,
        item.teacher.name,
        item.keywords.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return (!q || haystack.includes(q)) && (!department || item.department === department);
    });

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="教員・研究シーズ"
        description="教員名、研究キーワード、学科から研究情報を検索できます。"
      />
      <section className="filter-card">
        <form method="get">
          <div className="search-bar">
            <div className="field">
              <label htmlFor="research-q">キーワード</label>
              <input
                id="research-q"
                name="q"
                defaultValue={q}
                placeholder="教員名、研究テーマ、キーワード"
              />
            </div>
            <div className="field">
              <label htmlFor="research-department">学科</label>
              <select id="research-department" name="department" defaultValue={department}>
                <option value="">すべて</option>
                {DEPARTMENTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>案内</label>
              <div className="info-box small">
                教員情報と技術シーズを同時に絞り込みます。
              </div>
            </div>
            <div className="field">
              <label>導線</label>
              <div className="info-box small">
                詳細画面から担当教員や関連テーマをたどれます。
              </div>
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
            <h2>教員プロフィール</h2>
            <p>{faculty.length}件</p>
          </div>
        </div>
        <div className="card-grid">
          {faculty.length ? (
            faculty.map((item) => (
              <FacultyCard
                key={item.id}
                faculty={{
                  slug: item.slug,
                  name: item.name,
                  department: item.department,
                  summary: item.summary,
                  specialties: item.specialties,
                  isPublished: item.isPublished,
                }}
              />
            ))
          ) : (
            <div className="empty-state">条件に一致する教員はありません。</div>
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <h2>技術シーズ</h2>
            <p>{seeds.length}件</p>
          </div>
        </div>
        <div className="card-grid">
          {seeds.length ? (
            seeds.map((item) => (
              <SeedCard
                key={item.id}
                seed={{
                  slug: item.slug,
                  title: item.title,
                  department: item.department,
                  teacherName: item.teacher.name,
                  summary: item.summary,
                  keywords: item.keywords,
                  isPublished: item.isPublished,
                }}
              />
            ))
          ) : (
            <div className="empty-state">条件に一致する技術シーズはありません。</div>
          )}
        </div>
      </section>
    </>
  );
}
