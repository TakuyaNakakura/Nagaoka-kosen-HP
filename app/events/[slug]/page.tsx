import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoticeBanner, PageTitle } from "@/components/ui";
import { formatDate, readSearchParam } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const notice = readSearchParam(query.notice);
  const kind = readSearchParam(query.kind);
  const event = await prisma.eventItem.findUnique({
    where: { slug },
  });

  if (!event || !event.isPublished) notFound();

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle title={event.title} description={`${formatDate(event.eventDate)} / ${event.place}`} />
      <section className="detail-grid">
        <article className="detail-card">
          <h3>開催概要</h3>
          <p>{event.summary}</p>
          <h3>詳細</h3>
          <p>{event.details}</p>
        </article>
        <aside className="detail-card">
          <div className="detail-list">
            <div className="detail-item">
              <strong>対象者</strong>
              <br />
              {event.target}
            </div>
            <div className="detail-item">
              <strong>申込締切</strong>
              <br />
              {formatDate(event.deadline)}
            </div>
            <div className="detail-item">
              <strong>問い合わせ先</strong>
              <br />
              {event.contact}
            </div>
          </div>
          <Link className="button" href="/contact?type=GENERAL">
            参加方法を問い合わせる
          </Link>
        </aside>
      </section>
    </>
  );
}
