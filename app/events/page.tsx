import { prisma } from "@/lib/prisma";
import { EventCard, NoticeBanner, PageTitle } from "@/components/ui";
import { readSearchParam } from "@/lib/utils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice = readSearchParam(params.notice);
  const kind = readSearchParam(params.kind);

  const events = await prisma.eventItem.findMany({
    where: { isPublished: true },
    orderBy: { eventDate: "asc" },
  });

  return (
    <>
      <NoticeBanner notice={notice} kind={kind} />
      <PageTitle
        title="イベント・活動予定"
        description="講演会、交流会、説明会などの予定を一覧で表示します。"
      />
      <section className="timeline">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </>
  );
}
