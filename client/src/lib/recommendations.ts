export type FinderPreferences = {
  skills: string[];
  domains: string[];
  mode: "All" | "online" | "offline" | "hybrid";
  cost: "All" | "free" | "paid";
  location: string;
  goals: string[];
};

export type RecommendationOpportunity = {
  title: string;
  description: string;
  skills: string;
  domain: string;
  tags: string;
  mode: string;
  cost: string;
  location: string;
  country: string;
  state: string;
  district: string;
  deadline: string;
  startDate: string;
  prizes: string;
  prizePool: string;
  type: string;
};

export type Recommendation = { score: number; reasons: string[] };

export const DEFAULT_FINDER_PREFERENCES: FinderPreferences = { skills: [], domains: [], mode: "All", cost: "All", location: "", goals: [] };

const goalTerms: Record<string, string[]> = {
  learn: ["learn", "beginner", "workshop", "training", "student"],
  portfolio: ["hackathon", "build", "project", "prototype"],
  prizes: ["prize", "award", "cash", "reward"],
  network: ["network", "community", "meet", "collaborat"],
  internships: ["intern", "career", "hiring", "job"],
};

function words(value: string) { return value.toLowerCase(); }
function matchesAny(haystack: string, needles: string[]) { return needles.filter(needle => haystack.includes(needle.toLowerCase())); }
function hasPreference(preferences: FinderPreferences) { return preferences.skills.length + preferences.domains.length + preferences.goals.length > 0 || preferences.mode !== "All" || preferences.cost !== "All" || Boolean(preferences.location.trim()); }

export function recommendOpportunity(item: RecommendationOpportunity, preferences: FinderPreferences, now = Date.now()): Recommendation {
  const text = words([item.title, item.description, item.skills, item.domain, item.tags, item.type].join(" "));
  const location = words([item.location, item.country, item.state, item.district].join(" "));
  const skillMatches = matchesAny(text, preferences.skills);
  const domainMatches = matchesAny(text, preferences.domains);
  const goalMatches = preferences.goals.filter(goal => matchesAny(text, goalTerms[goal] ?? []).length > 0);
  const modeMatch = preferences.mode === "All" || item.mode === preferences.mode;
  const costMatch = preferences.cost === "All" || item.cost === preferences.cost;
  const locationMatch = !preferences.location.trim() || location.includes(preferences.location.trim().toLowerCase());
  const deadline = Date.parse(item.deadline || item.startDate);
  const freshness = Number.isFinite(deadline) ? Math.max(0, Math.min(1, (deadline - now) / (45 * 24 * 60 * 60 * 1000))) : 0.25;
  const score = 0.25 * Number(skillMatches.length > 0) + 0.20 * Number(domainMatches.length > 0) + 0.15 * Number(modeMatch) + 0.15 * Number(locationMatch) + 0.10 * Number(costMatch) + 0.10 * Number(goalMatches.length > 0) + 0.05 * freshness;
  const reasons: string[] = [];
  if (skillMatches.length) reasons.push(`Matches ${skillMatches.slice(0, 2).join(" + ")} skills`);
  if (domainMatches.length) reasons.push(`Matches ${domainMatches.slice(0, 2).join(" + ")} interests`);
  if (modeMatch && preferences.mode !== "All") reasons.push(`${item.mode === "online" ? "Online" : item.mode === "offline" ? "In person" : "Hybrid"} fits your format`);
  if (costMatch && preferences.cost !== "All") reasons.push(item.cost === "free" ? "Free to enter" : "Matches your cost setting");
  if (locationMatch && preferences.location.trim()) reasons.push(`Matches ${preferences.location.trim()}`);
  if (goalMatches.length) reasons.push(`Supports your ${goalMatches[0]} goal`);
  if (!reasons.length && hasPreference(preferences)) reasons.push("Open opportunity with a current date");
  return { score, reasons: reasons.slice(0, 2) };
}

export function rankRecommendations<T extends RecommendationOpportunity>(rows: T[], preferences: FinderPreferences, now = Date.now()) {
  return rows.map(item => ({ item, ...recommendOpportunity(item, preferences, now) })).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
}
