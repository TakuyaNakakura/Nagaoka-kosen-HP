import type { InquiryStatus, MembershipStatus, WorkflowStatus } from "@prisma/client";
import {
  INQUIRY_STATUS_LABELS,
  MEMBERSHIP_STATUS_LABELS,
  WORKFLOW_LABELS,
} from "@/lib/constants";

export function slugify(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9ぁ-んァ-ヶ一-龠ー\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function readSearchParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function buildNoticePath(
  pathname: string,
  notice: string,
  kind: "success" | "error" = "success",
) {
  const params = new URLSearchParams({
    notice,
    kind,
  });
  return `${pathname}?${params.toString()}`;
}

export function workflowLabel(status: WorkflowStatus) {
  return WORKFLOW_LABELS[status];
}

export function inquiryStatusLabel(status: InquiryStatus) {
  return INQUIRY_STATUS_LABELS[status];
}

export function membershipStatusLabel(status: MembershipStatus) {
  return MEMBERSHIP_STATUS_LABELS[status];
}

export function parseLines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCommaList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}
