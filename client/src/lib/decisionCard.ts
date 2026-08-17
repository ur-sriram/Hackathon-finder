const ENTITY_MAP: Record<string, string> = { "&amp;": "&", "&mdash;": "—", "&ndash;": "–", "&nbsp;": " ", "&#39;": "'", "&apos;": "'", "&rsquo;": "'", "&lsquo;": "'", "&quot;": '"', "&ldquo;": '“', "&rdquo;": '”' };

export function cleanOpportunitySummary(value: string, max = 180) {
  const decoded = value.replace(/&(amp|mdash|ndash|nbsp|#39|apos|rsquo|lsquo|quot|ldquo|rdquo);/g, token => ENTITY_MAP[token] ?? token).replace(/<[^>]*>/g, " ").replace(/(?:Registration Period|Registration deadline|Build Sprint|Results|About(?: the)? (?:Event|Hackathon|Opportunity|Competition)|About)\s*:?[\s-]*/gi, "").replace(/\s+/g, " ").trim();
  if (!decoded || /^(?:no description|not listed|unknown)/i.test(decoded)) return "";
  const firstSentence = decoded.match(/^(.{40,240}?[.!?])(?:\s|$)/)?.[1] || decoded;
  return firstSentence.length > max ? `${firstSentence.slice(0, max - 1).trim()}…` : firstSentence;
}

export function conciseDeadline(value: string, status: string, now = Date.now()) {
  const deadline = Date.parse(value);
  if (!Number.isFinite(deadline)) return status === "date-unavailable" ? "Date unavailable" : "Check event page";
  if (new Date(deadline).toDateString() === new Date(now).toDateString() && deadline >= now && status !== "closed") return "Closes today";
  const days = Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));
  if (days < 0 || status === "closed") return "Deadline passed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  if (days <= 3) return `Closes in ${days} days`;
  return `Closes ${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(deadline))}`;
}

function shortDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(timestamp)) : "";
}

export function decisionTiming(item: { deadline: string; startDate: string; endDate: string; status: string }, now = Date.now()) {
  if (item.deadline) return conciseDeadline(item.deadline, item.status, now);
  const end = Date.parse(item.endDate);
  if (Number.isFinite(end) && end >= now) return `Ends ${shortDate(item.endDate)}`;
  const start = Date.parse(item.startDate);
  if (Number.isFinite(start) && start >= now) return `Starts ${shortDate(item.startDate)}`;
  return "Check event page";
}

export function readableDetail(value: string, fallback = "See event page") {
  if (/^\s*[\[{]/.test(value)) return fallback;
  const date = shortDate(value);
  if (date && /^\d{4}-\d{2}-\d{2}/.test(value)) return date;
  const compact = cleanOpportunitySummary(value, 180);
  return compact || fallback;
}

export function decisionMeta(item: { mode: string; location: string; cost: string; domain: string; dataQuality?: string }) {
  const values: Array<{ label: string; value: string }> = [];
  if (item.mode && item.mode !== "unknown") values.push({ label: "Format", value: item.mode === "offline" ? "In person" : item.mode });
  if (item.location) values.push({ label: "Location", value: item.location });
  if (item.cost && item.cost !== "unknown") values.push({ label: "Cost", value: item.cost === "free" ? "Free" : "Paid" });
  if (item.domain && item.domain !== "General") values.push({ label: "Focus", value: item.domain.split(",")[0] });
  return values.slice(0, 3);
}
