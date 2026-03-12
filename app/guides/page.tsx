import { prisma } from "@/lib/prisma";
import { NoticeBanner, PageTitle } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GuidesPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);
  const guides = await prisma.guide.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="対象別案内"
        description="企業向け、学生向け、教職員向けの導線をまとめています。"
      />
      <section className="card-grid">
        {guides.map((guide) => (
          <article className="card" key={guide.id}>
            <div className="card-top">
              <div>
                <h3>{guide.title}</h3>
                <p className="muted small">{guide.audience}</p>
              </div>
            </div>
            <p>{guide.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
