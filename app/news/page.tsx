import { prisma } from "@/lib/prisma";
import { NewsCard, NoticeBanner, PageTitle } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);

  const articles = await prisma.newsArticle.findMany({
    where: { isPublished: true },
    orderBy: { publishedDate: "desc" },
  });

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="活動報告・新着情報"
        description="ニュース、活動報告、議事録、資料をアーカイブしています。"
      />
      <section className="stack">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </section>
    </>
  );
}
