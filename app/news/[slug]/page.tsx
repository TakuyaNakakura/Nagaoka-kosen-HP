import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { articleAttachments } from "@/lib/domain";
import { AssetList, NoticeBanner, PageTitle } from "@/components/ui";
import { formatDate, readSearchParam } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewsDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const notice = readSearchParam(query.notice);
  const kind = readSearchParam(query.kind);
  const article = await prisma.newsArticle.findUnique({
    where: { slug },
  });

  if (!article || !article.isPublished) notFound();

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title={article.title}
        description={`${article.category} / ${formatDate(article.publishedDate)}`}
      />
      <section className="detail-card">
        <p>{article.body}</p>
        <h3>添付資料</h3>
        <AssetList items={articleAttachments(article).map((name) => ({ name }))} />
      </section>
    </>
  );
}
