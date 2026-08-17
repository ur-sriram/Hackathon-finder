export type OpportunityTrustInput = {
  registrationUrl?: string;
  eventUrl?: string;
  sourcePageUrl?: string;
  deadline?: string;
  startDate?: string;
  endDate?: string;
  mode?: string;
  location?: string;
  eligibility?: string;
};

export type OpportunityStatus = "open" | "closing-soon" | "starting-soon" | "closed" | "date-unavailable";
export type OpportunityDataQuality = "verified" | "partial" | "directory-only";

const DAY_MS = 24 * 60 * 60 * 1000;

function timestamp(value?: string) {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : null;
}

export function deriveOpportunityStatus(input: OpportunityTrustInput, now = Date.now()): OpportunityStatus {
  const deadline = timestamp(input.deadline);
  const start = timestamp(input.startDate);
  const end = timestamp(input.endDate);

  if ((end !== null && end < now) || (deadline !== null && deadline < now)) return "closed";
  if (deadline !== null && deadline <= now + 3 * DAY_MS) return "closing-soon";
  if (start !== null && start >= now && start <= now + 7 * DAY_MS) return "starting-soon";
  if (deadline !== null || start !== null || end !== null) return "open";
  return "date-unavailable";
}

export function isDefaultUpcoming(input: OpportunityTrustInput, now = Date.now()) {
  return deriveOpportunityStatus(input, now) !== "closed";
}

export function opportunityDataQuality(input: OpportunityTrustInput): OpportunityDataQuality {
  const directUrl = Boolean(input.registrationUrl || input.eventUrl);
  const hasSchedule = Boolean(timestamp(input.deadline) ?? timestamp(input.startDate) ?? timestamp(input.endDate));
  const knownMode = Boolean(input.mode && input.mode !== "unknown");
  const knownLocation = Boolean(input.location);
  const knownEligibility = Boolean(input.eligibility && !/^see eligibility/i.test(input.eligibility));

  if (!directUrl && input.sourcePageUrl) return "directory-only";
  if (directUrl && hasSchedule && (knownMode || knownLocation || knownEligibility)) return "verified";
  return "partial";
}

export function primaryOpportunityLink(input: OpportunityTrustInput) {
  if (input.registrationUrl) return { href: input.registrationUrl, label: "Register", kind: "registration" as const };
  if (input.eventUrl) return { href: input.eventUrl, label: "View event", kind: "event" as const };
  if (input.sourcePageUrl) return { href: input.sourcePageUrl, label: "Open publisher page", kind: "directory" as const };
  return null;
}
