# All-source feed audit

The unified endpoint is `GET /api/opportunities`. It checks the ten requested platforms concurrently and also includes KnowAFest Coimbatore as the eleventh source. Every result uses the shared opportunity fields while preserving `sources[].status`, `sources[].error`, and `sources[].records` so an empty or blocked source is visible rather than silently omitted.

| Source | Fetch path | Observed response shape | Current behavior |
|---|---|---|---|
| Devpost | Public HTML listing | Anchor/listing cards; no stable public JSON contract assumed | Generic safe HTML extraction, normalized as public-page listing. |
| Major League Hacking | Official season/events HTML | Event cards with title, date, location, and mode text | Generic safe HTML extraction; records remain tagged with conditional upcoming status. |
| HackerEarth Challenges | Public challenges HTML | Challenge listing and status/filter text | Generic safe HTML extraction; source status is retained. |
| Kaggle | Competitions HTML/API-capable platform | Dynamic competition cards; API authentication may be required | Generic extraction returns `no-records` when the public response has no parseable listing rows; no fabricated records are inserted. |
| Topcoder | Active challenges HTML/API-capable platform | Dynamic challenge cards and registration state | Generic extraction returns `no-records` when no parseable public rows are returned; official credentials can later improve coverage. |
| Unstop | Public JSON opportunity search endpoint | Rich records with title, details, organizer, dates, registration, location, team size, skills, prizes, and links | Dedicated rich adapter and normalized cards. |
| DoraHacks | Public directory/detail pages | Directory is dynamic; individual hackathon pages may expose richer fields | Safe public fetch with explicit `error` or `no-records` status when the page cannot be parsed. |
| TAIKAI | Public hackathons directory HTML | Listing cards and platform metadata; dynamic content may vary | Generic safe HTML extraction, normalized as a challenge listing. |
| Hack Club | Official public JSON endpoint | Event objects with name, dates, URL, location, mode, images, and tags | Dedicated official API adapter with upcoming-date filtering. |
| ChallengeRocket | Public platform/listing pages | Platform pages may not contain a discoverable current listing | Safe public fetch; status is returned explicitly and records are not invented. |
| KnowAFest Coimbatore | Existing database-backed scraper | Structured event records with event name, type, organizer, dates, and links | Existing database feed merged into the normalized opportunity response. |

The source-specific card branches distinguish Unstop registration feeds, Hack Club event listings, KnowAFest campus events, Kaggle/Topcoder competition or challenge records, and generic public listings. All cards expose common cost, mode, deadline, location, domain, skills, prizes, date, organizer, and source-link areas with safe fallbacks for missing fields.
