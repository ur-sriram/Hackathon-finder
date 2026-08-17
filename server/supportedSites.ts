export type SupportedSite = {
  id: string;
  name: string;
  category: "hackathon" | "competition" | "challenge";
  access: "official-public-api" | "official-api-with-credentials" | "public-page-adapter";
  supported: boolean;
  upcomingStatus: "confirmed" | "conditional" | "unverified";
  listingUrl: string;
  apiUrl?: string;
  attribution?: string;
  note: string;
};

export const SUPPORTED_SITES: SupportedSite[] = [
  { id: "devpost", name: "Devpost", category: "hackathon", access: "public-page-adapter", supported: true, upcomingStatus: "confirmed", listingUrl: "https://devpost.com/hackathons", note: "Official New & upcoming hackathons directory; future-dated records only." },
  { id: "mlh", name: "Major League Hacking", category: "hackathon", access: "public-page-adapter", supported: false, upcomingStatus: "conditional", listingUrl: "https://mlh.io/seasons/2026/events", note: "The current official page exposes a past-events section; inactive until future events are returned." },
  { id: "hackerearth", name: "HackerEarth Challenges", category: "challenge", access: "public-page-adapter", supported: true, upcomingStatus: "confirmed", listingUrl: "https://www.hackerearth.com/challenges/", note: "Official challenges page exposes an Upcoming status filter." },
  { id: "kaggle", name: "Kaggle Competitions", category: "competition", access: "official-public-api", supported: true, upcomingStatus: "confirmed", listingUrl: "https://www.kaggle.com/competitions", apiUrl: "https://www.kaggle.com/api/i/competitions.CompetitionService/ListCompetitions?pageSize=1000&pageToken=", note: "Official public listing service; the adapter keeps only competitions with future deadlines and preserves prizes, teams, categories, host, and event links." },
  { id: "topcoder", name: "Topcoder Challenges", category: "challenge", access: "official-api-with-credentials", supported: true, upcomingStatus: "confirmed", listingUrl: "https://www.topcoder.com/challenges", apiUrl: "https://tcapi.docs.apiary.io/", note: "Official page exposes Active Challenges and Open for Registration; this is a challenge feed." },
  { id: "unstop", name: "Unstop Hackathons", category: "hackathon", access: "official-public-api", supported: true, upcomingStatus: "confirmed", listingUrl: "https://unstop.com/hackathons", apiUrl: "https://unstop.com/hackathons", note: "Public listing and API adapter with pagination, open-status checks, and rich normalization." },
  { id: "dorahacks", name: "DoraHacks", category: "hackathon", access: "public-page-adapter", supported: false, upcomingStatus: "conditional", listingUrl: "https://dorahacks.io/hackathon/", note: "Directory is public, but current future/open status was not reliably exposed in the listing response." },
  { id: "taikai", name: "TAIKAI", category: "challenge", access: "public-page-adapter", supported: false, upcomingStatus: "conditional", listingUrl: "https://taikai.network/en/hackathons", note: "Official directory exists, but dates/status were not reliably exposed in the current listing response." },
  { id: "hack-club", name: "Hack Club", category: "hackathon", access: "official-public-api", supported: true, upcomingStatus: "confirmed", listingUrl: "https://hackathons.hackclub.com/", apiUrl: "https://hackathons.hackclub.com/api/events/upcoming", attribution: "Credit Hack Club Hackathons with a link to hackathons.hackclub.com.", note: "Official public JSON API for upcoming hackathons; future-date filter applied." },
  { id: "challengerocket", name: "ChallengeRocket", category: "challenge", access: "public-page-adapter", supported: false, upcomingStatus: "unverified", listingUrl: "https://challengerocket.com/", note: "No current public upcoming-challenges directory was verified; excluded from the active catalog." },
  { id: "hack2skill", name: "Hack2Skill", category: "hackathon", access: "official-public-api", supported: true, upcomingStatus: "confirmed", listingUrl: "https://hack2skill.com/hackathons-listing", apiUrl: "https://hack2skill.com/api/v1/innovator/public/event/public-list", note: "Official public listing API exposes upcoming hackathons with thumbnail, title, ticket, mode, registration end, and event slug." },
  { id: "reskill", name: "Reskilll", category: "hackathon", access: "public-page-adapter", supported: true, upcomingStatus: "confirmed", listingUrl: "https://reskilll.com/discover", note: "Official Discover catalogue uses server-rendered primary cards with banner, organizer, tags, schedule, registration state, location, prize, and publisher registration links." },
  { id: "devfolio", name: "Devfolio", category: "hackathon", access: "public-page-adapter", supported: true, upcomingStatus: "confirmed", listingUrl: "https://devfolio.co/hackathons/upcoming", note: "Official Upcoming Hackathons directory exposes real Devfolio event-subdomain URLs, theme, format, upcoming state, and opening date; rendered-page reader fallback is used because the directory hydrates client-side." },
  { id: "internshala", name: "Internshala Hackathons", category: "hackathon", access: "public-page-adapter", supported: true, upcomingStatus: "confirmed", listingUrl: "https://internshala.com/competitions/hackathons/", note: "Official server-rendered Hackathons catalogue with bounded pagination, banners, organizer, prize or award label, event date, mode, and cost." },
];

export function supportedSitesHandler(_req: import("express").Request, res: import("express").Response) {
  const activeSites = SUPPORTED_SITES.filter(site => site.supported && site.upcomingStatus === "confirmed");
  return res.json({ sites: activeSites, count: activeSites.length, excluded: SUPPORTED_SITES.filter(site => !site.supported).map(site => ({ id: site.id, name: site.name, upcomingStatus: site.upcomingStatus, reason: site.note })), generatedAt: new Date().toISOString() });
}
