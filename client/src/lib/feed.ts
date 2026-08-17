export type FeedRecord = Record<string, string>;
export type KnowAFestRecord = { id: number; eventName: string; eventType: string; organizer: string; startDate: string; endDate: string; eventUrl: string | null };
export type CombinedFeedItem = { source: "Unstop" | "KnowAFest"; id: string; title: string; organizer: string; type: string; startDate: string; endDate: string; url: string };

export function mergeFeedRecords(unstop: FeedRecord[], knowafest: KnowAFestRecord[]): CombinedFeedItem[] {
  return [
    ...unstop.map((record, index) => ({ source: "Unstop" as const, id: record.id || record.detailUrl || `unstop-${index}`, title: record.title || "Untitled hackathon", organizer: record.organizer || "Organizer not listed", type: record.type || "Hackathon", startDate: record.startDate || "", endDate: record.endDate || "", url: record.detailUrl || record.registrationUrl || "" })),
    ...knowafest.map(event => ({ source: "KnowAFest" as const, id: `knowafest-${event.id}`, title: event.eventName, organizer: event.organizer, type: event.eventType, startDate: event.startDate, endDate: event.endDate, url: event.eventUrl || "" })),
  ];
}

export function filterFeedRecords(items: CombinedFeedItem[], source: "All" | "Unstop" | "KnowAFest", query: string) {
  const needle = query.trim().toLowerCase();
  return items.filter(item => (source === "All" || item.source === source) && (!needle || `${item.title} ${item.organizer} ${item.type}`.toLowerCase().includes(needle)));
}
