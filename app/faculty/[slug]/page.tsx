import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { facultySpecialties } from "@/lib/domain";
import { NoticeBanner, PageTitle, TagRow } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FacultyDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const notice = readSearchParam(query.notice);
  const kind = readSearchParam(query.kind);
  const faculty = await prisma.faculty.findUnique({
    where: { slug },
    include: {
      seeds: {
        where: { isPublished: true },
        orderBy: { title: "asc" },
      },
    },
  });

  if (!faculty || !faculty.isPublished) notFound();

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle title={faculty.name} description={`${faculty.department} / 教員プロフィール`} />
      <section className="detail-grid">
        <article className="detail-card">
          <TagRow values={facultySpecialties(faculty)} />
          <h3>研究内容</h3>
          <p>{faculty.summary}</p>
          <h3>関連技術シーズ</h3>
          <div className="stack">
            {faculty.seeds.map((seed) => (
              <div className="detail-item" key={seed.id}>
                <strong>{seed.title}</strong>
                <br />
                {seed.summary}
                <br />
                <Link href={`/seeds/${seed.slug}`}>詳細を見る</Link>
              </div>
            ))}
          </div>
        </article>
        <aside className="detail-card">
          <h3>問い合わせ先</h3>
          <div className="detail-item">{faculty.contact}</div>
          <h3>所属</h3>
          <div className="detail-item">{faculty.department}</div>
          <Link className="button" href="/contact?type=JOINT">
            共同研究を相談する
          </Link>
        </aside>
      </section>
    </>
  );
}
