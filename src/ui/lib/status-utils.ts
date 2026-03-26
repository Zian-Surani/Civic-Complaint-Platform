export type NormalizedStatus = "Raised" | "Assigned" | "In_Progress" | "Resolved" | "Closed";

const LOWER_TO_NORMALIZED: Record<string, NormalizedStatus> = {
  pending: "Raised",
  assigned: "Assigned",
  in_progress: "In_Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const NORMALIZED_TO_LOWER: Record<NormalizedStatus, string> = {
  Raised: "pending",
  Assigned: "assigned",
  In_Progress: "in_progress",
  Resolved: "resolved",
  Closed: "closed",
};

export const ACTIVE_STATUSES = ["pending", "assigned", "in_progress"] as const;
export const RESOLVED_STATUSES = ["resolved", "closed"] as const;
export const ALL_STATUSES = ["pending", "assigned", "in_progress", "resolved", "closed"] as const;

export function normalizeStatus(status: string | null | undefined): NormalizedStatus {
  if (!status) return "Raised";
  if (status in LOWER_TO_NORMALIZED) {
    return LOWER_TO_NORMALIZED[status as keyof typeof LOWER_TO_NORMALIZED];
  }
  if (status === "Raised" || status === "Assigned" || status === "In_Progress" || status === "Resolved" || status === "Closed") {
    return status;
  }
  const lowered = status.toLowerCase();
  if (lowered in LOWER_TO_NORMALIZED) {
    return LOWER_TO_NORMALIZED[lowered as keyof typeof LOWER_TO_NORMALIZED];
  }
  return "Raised";
}

export function isActiveStatus(status: string | null | undefined): boolean {
  const normalized = normalizeStatus(status);
  return normalized === "Raised" || normalized === "Assigned" || normalized === "In_Progress";
}

export function isResolvedStatus(status: string | null | undefined): boolean {
  const normalized = normalizeStatus(status);
  return normalized === "Resolved" || normalized === "Closed";
}

export function toDbStatus(nextStatus: string, currentStatus?: string | null): string {
  const normalized = normalizeStatus(nextStatus);
  const lowered = nextStatus.toLowerCase();
  if (lowered === "pending") return "pending";
  if (lowered === "assigned") return "assigned";
  if (lowered === "in_progress" || lowered === "in progress") return "in_progress";
  if (lowered === "resolved") return "resolved";
  if (lowered === "closed") return "closed";
  if (!currentStatus) return normalized;
  const isLower = currentStatus === currentStatus.toLowerCase();
  return isLower ? NORMALIZED_TO_LOWER[normalized] : normalized;
}
