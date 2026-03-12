import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { seedKeywords } from "@/lib/domain";
import { NoticeBanner, PageTitle, TagRow } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SeedDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const notice = readSearchParam(query.notice);
  const kind = readSearchParam(query.kind);

  const seed = await prisma.researchSeed.findUnique({
    where: { slug },
    include: { teacher: true },
  });

  if (!seed || !seed.isPublished) notFound();

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle title={seed.title} description={`${seed.department} / ${seed.teacher.name}`} />
      <section className="detail-grid">
        <article className="detail-card">
          <TagRow values={seedKeywords(seed)} />
          <h3>概要</h3>
          <p>{seed.summary}</p>
          <h3>活用可能性</h3>
          <p>{seed.potential}</p>
          <h3>共同研究の可能性</h3>
          <p>{seed.collaboration}</p>
        </article>
        <aside className="detail-card">
          <h3>担当教員</h3>
          <div className="detail-item">
            <strong>{seed.teacher.name}</strong>
            <br />
            {seed.teacher.department}
            <br />
            <Link href={`/faculty/${seed.teacher.slug}`}>教員プロフィールを見る</Link>
          </div>
          <Link className="button" href="/contact?type=JOINT">
            このシーズを相談する
          </Link>
        </aside>
      </section>
    </>
  );
}
