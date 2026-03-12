import { prisma } from "@/lib/prisma";
import { DetailList, NoticeBanner, PageTitle } from "@/components/ui";
import { organizationOfficers, organizationPurpose, organizationRules } from "@/lib/domain";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrganizationPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);
  const organization = await prisma.organizationInfo.findUnique({
    where: { id: 1 },
  });

  if (!organization) {
    return (
      <>
        <NoticeBanner notice={notice} kind={kind} />
        <PageTitle title="組織概要" description="組織情報はまだ登録されていません。" />
      </>
    );
  }

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="組織概要"
        description="技術協力会の概要、役員、設立目的、規約を公開しています。"
      />
      <section className="detail-grid">
        <article className="detail-card">
          <h3>概要</h3>
          <p>{organization.overview}</p>
          <h3>設立目的</h3>
          <DetailList values={organizationPurpose(organization)} />
        </article>
        <aside className="detail-card">
          <h3>役員</h3>
          <DetailList values={organizationOfficers(organization)} />
          <h3>規約</h3>
          <DetailList values={organizationRules(organization)} />
        </aside>
      </section>
    </>
  );
}
