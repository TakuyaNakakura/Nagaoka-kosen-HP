import Link from "next/link";
import {
  INQUIRY_STATUS_LABELS,
  MEMBERSHIP_STATUS_LABELS,
  WORKFLOW_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

type NoticeProps = {
  notice?: string;
  kind?: string;
};

export function PageTitle({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="page-title">
      <div className="section-header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions}
      </div>
    </section>
  );
}

export function NoticeBanner({ notice, kind }: NoticeProps) {
  if (!notice) return null;
  return <div className={`flash ${kind === "error" ? "error" : ""}`}>{notice}</div>;
}

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "published" | "pending" | "danger" | "draft" | "neutral";
}) {
  return <span className={`status-badge status-${tone}`}>{label}</span>;
}

export function WorkflowBadge({ status }: { status: keyof typeof WORKFLOW_LABELS }) {
  const tone =
    status === "APPROVED"
      ? "published"
      : status === "PENDING"
        ? "pending"
        : status === "RETURNED" || status === "REJECTED"
          ? "danger"
          : "draft";
  return <StatusBadge label={WORKFLOW_LABELS[status]} tone={tone} />;
}

export function InquiryStatusBadge({
  status,
}: {
  status: keyof typeof INQUIRY_STATUS_LABELS;
}) {
  const tone =
    status === "COMPLETED"
      ? "published"
      : status === "IN_PROGRESS"
        ? "pending"
        : "draft";
  return <StatusBadge label={INQUIRY_STATUS_LABELS[status]} tone={tone} />;
}

export function MembershipStatusBadge({
  status,
}: {
  status: keyof typeof MEMBERSHIP_STATUS_LABELS;
}) {
  const tone =
    status === "COMPLETED"
      ? "published"
      : status === "REVIEWING"
        ? "pending"
        : "draft";
  return <StatusBadge label={MEMBERSHIP_STATUS_LABELS[status]} tone={tone} />;
}

export function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <article className="metric-card">
      <span className="muted small">{label}</span>
      <span className="value">{value}</span>
      <p className="muted small">{note}</p>
    </article>
  );
}

export function TagRow({ values }: { values: string[] }) {
  return (
    <div className="tag-row">
      {values.map((value) => (
        <span className="tag" key={value}>
          {value}
        </span>
      ))}
    </div>
  );
}

export function PillRow({ values }: { values: string[] }) {
  return (
    <div className="pill-row">
      {values.map((value) => (
        <span className="pill" key={value}>
          {value}
        </span>
      ))}
    </div>
  );
}

export function DetailList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <div className="empty-state">該当情報はありません。</div>;
  }
  return (
    <div className="detail-list">
      {values.map((value) => (
        <div className="detail-item" key={value}>
          {value}
        </div>
      ))}
    </div>
  );
}

export function AssetList({
  items,
}: {
  items: { name: string; url?: string }[];
}) {
  if (items.length === 0) return <div className="empty-state">資料はありません。</div>;
  return (
    <div className="pill-row">
      {items.map((item) =>
        item.url ? (
          <a key={`${item.name}-${item.url}`} className="pill link-pill" href={item.url}>
            {item.name}
          </a>
        ) : (
          <span className="pill" key={item.name}>
            {item.name}
          </span>
        ),
      )}
    </div>
  );
}

export function CompanyCard({
  company,
}: {
  company: {
    slug: string;
    name: string;
    industry: string;
    city: string;
    summary: string;
    relatedFields: string[];
    departments: string[];
    workflowStatus: keyof typeof WORKFLOW_LABELS;
  };
}) {
  return (
    <article className="card company-card">
      <div className="card-top">
        <div className="card-heading">
          <h3 className="card-title">{company.name}</h3>
          <p className="muted small card-meta">
            {company.industry} / {company.city}
          </p>
        </div>
        <WorkflowBadge status={company.workflowStatus} />
      </div>
      <p className="card-summary">{company.summary}</p>
      <TagRow values={company.relatedFields} />
      <PillRow values={company.departments} />
      <div className="inline-actions">
        <Link className="button secondary" href={`/companies/${company.slug}`}>
          詳細を見る
        </Link>
      </div>
    </article>
  );
}

export function FacultyCard({
  faculty,
}: {
  faculty: {
    slug: string;
    name: string;
    department: string;
    summary: string;
    specialties: string[];
    isPublished: boolean;
  };
}) {
  return (
    <article className="card">
      <div className="card-top">
        <div>
          <h3>{faculty.name}</h3>
          <p className="muted small">{faculty.department}</p>
        </div>
        <StatusBadge label={faculty.isPublished ? "公開中" : "非公開"} tone={faculty.isPublished ? "published" : "draft"} />
      </div>
      <p>{faculty.summary}</p>
      <TagRow values={faculty.specialties} />
      <div className="inline-actions">
        <Link className="button secondary" href={`/faculty/${faculty.slug}`}>
          プロフィール詳細
        </Link>
      </div>
    </article>
  );
}

export function SeedCard({
  seed,
}: {
  seed: {
    slug: string;
    title: string;
    department: string;
    teacherName: string;
    summary: string;
    keywords: string[];
    isPublished: boolean;
  };
}) {
  return (
    <article className="card">
      <div className="card-top">
        <div>
          <h3>{seed.title}</h3>
          <p className="muted small">
            {seed.department} / {seed.teacherName}
          </p>
        </div>
        <StatusBadge label={seed.isPublished ? "公開中" : "非公開"} tone={seed.isPublished ? "published" : "draft"} />
      </div>
      <p>{seed.summary}</p>
      <TagRow values={seed.keywords} />
      <div className="inline-actions">
        <Link className="button secondary" href={`/seeds/${seed.slug}`}>
          技術シーズ詳細
        </Link>
      </div>
    </article>
  );
}

export function NewsCard({
  article,
}: {
  article: {
    slug: string;
    title: string;
    category: string;
    summary: string;
    publishedDate: Date;
    isPublished: boolean;
  };
}) {
  return (
    <article className="card">
      <div className="card-top">
        <div>
          <h3>{article.title}</h3>
          <p className="muted small">
            {article.category} / {formatDate(article.publishedDate)}
          </p>
        </div>
        <StatusBadge label={article.isPublished ? "公開中" : "非公開"} tone={article.isPublished ? "published" : "draft"} />
      </div>
      <p>{article.summary}</p>
      <div className="inline-actions">
        <Link className="button secondary" href={`/news/${article.slug}`}>
          記事詳細
        </Link>
      </div>
    </article>
  );
}

export function EventCard({
  event,
}: {
  event: {
    slug: string;
    title: string;
    eventDate: Date;
    place: string;
    target: string;
    deadline: Date;
    summary: string;
  };
}) {
  return (
    <article className="timeline-card">
      <div className="timeline-date">{formatDate(event.eventDate)}</div>
      <h3>{event.title}</h3>
      <p>{event.summary}</p>
      <div className="meta-row">
        <span className="meta-chip">{event.place}</span>
        <span className="meta-chip">{event.target}</span>
        <span className="meta-chip">申込締切 {formatDate(event.deadline)}</span>
      </div>
      <div className="inline-actions">
        <Link className="button secondary" href={`/events/${event.slug}`}>
          イベント詳細
        </Link>
      </div>
    </article>
  );
}

export function InfoMessage({ children }: { children: React.ReactNode }) {
  return <div className="info-box">{children}</div>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

export function AdminTableRowDate({
  value,
}: {
  value: Date | string | null | undefined;
}) {
  return <>{formatDateTime(value)}</>;
}
