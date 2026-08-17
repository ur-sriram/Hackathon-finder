export type OpportunityFilter = { query: string; source: string; category: string; cost: string; mode: string; country: string; state: string; district: string; domain: string; dateWindow: string };
export type OpportunitySort = "deadline" | "start" | "newest" | "source" | "relevance";
export type OpportunityLike = { title: string; organizer: string; description: string; domain: string; skills: string; location: string; sourceId: string; type: string; cost: string; mode: string; country: string; state: string; district: string; deadline: string; startDate: string; fetchedAt: string };
export const DEFAULT_OPPORTUNITY_FILTER: OpportunityFilter = { query: "", source: "All", category: "All", cost: "All", mode: "All", country: "All", state: "All", district: "All", domain: "All", dateWindow: "All" };
export function resetOpportunityFilter(): OpportunityFilter { return { ...DEFAULT_OPPORTUNITY_FILTER }; }

export function filterOpportunities<T extends OpportunityLike>(rows: T[], filter: OpportunityFilter) {
  const needle = filter.query.trim().toLowerCase();
  const windowDays = filter.dateWindow === "week" ? 7 : filter.dateWindow === "month" ? 30 : 0;
  const now = Date.now();
  return rows.filter(row => {
    const dateValue = Date.parse(row.deadline || row.startDate);
    const withinWindow = !windowDays || (dateValue >= now && dateValue <= now + windowDays * 86400000);
    const searchable = [row.title, row.organizer, row.description, row.domain, row.skills, row.location].join(" ").toLowerCase();
    return (!needle || searchable.includes(needle)) &&
      (filter.source === "All" || row.sourceId === filter.source) &&
      (filter.category === "All" || row.type.toLowerCase().includes(filter.category.toLowerCase())) &&
      (filter.cost === "All" || row.cost === filter.cost) &&
      (filter.dateWindow === "All" || withinWindow) &&
      (filter.mode === "All" || row.mode === filter.mode) &&
      (filter.country === "All" || row.country === filter.country) &&
      (filter.state === "All" || row.state === filter.state) &&
      (filter.district === "All" || row.district === filter.district) &&
      (filter.domain === "All" || row.domain.split(", ").includes(filter.domain));
  });
}

export function opportunityRelevance(row: OpportunityLike, query: string) {
  const needle = query.trim().toLowerCase(); if (!needle) return 0;
  return (row.title.toLowerCase().includes(needle) ? 8 : 0) + (row.domain.toLowerCase().includes(needle) ? 5 : 0) + (row.skills.toLowerCase().includes(needle) ? 4 : 0) + (row.description.toLowerCase().includes(needle) ? 2 : 0) + (row.organizer.toLowerCase().includes(needle) ? 1 : 0);
}

export function sortOpportunities<T extends OpportunityLike>(rows: T[], sort: OpportunitySort, query: string) {
  return [...rows].sort((a, b) => { if (sort === "source") return a.sourceId.localeCompare(b.sourceId); if (sort === "newest") return b.fetchedAt.localeCompare(a.fetchedAt); if (sort === "relevance") return opportunityRelevance(b, query) - opportunityRelevance(a, query); const aDate = Date.parse(sort === "start" ? a.startDate : a.deadline || a.startDate) || Number.MAX_SAFE_INTEGER; const bDate = Date.parse(sort === "start" ? b.startDate : b.deadline || b.startDate) || Number.MAX_SAFE_INTEGER; return aDate - bDate; });
}
