# Upcoming-source verification

Verification date: 2026-08-17 (user timezone context). The catalog should expose only sources that publish current upcoming or open listings. A platform may remain listed when it publishes upcoming competitions rather than events explicitly labeled hackathons, but its adapter must preserve the source type and filter out closed/past records when dates are available.

| Platform | Official verification URL | Result | Access / implementation decision |
|---|---|---|---|
| Devpost | https://devpost.com/hackathons | Confirmed. The official page is titled “New & upcoming hackathons” and current indexed listings include events with future end dates. | Public-page adapter; keep upcoming records only when dates are parseable. |
| Major League Hacking | https://mlh.io/seasons/2026/events | Conditional. The official season page publishes event cards and dates, but the extracted page currently labels the visible 2026 section “Past Events”; therefore it must not be treated as an upcoming feed without a current-date filter and a live upcoming section. | Keep as a verified platform catalog entry only if the adapter returns future-dated events; otherwise hide from the active upcoming feed. |
| HackerEarth Challenges | https://www.hackerearth.com/challenges/ | Confirmed. The official listing exposes an explicit “Status: Upcoming” filter. | Public-page adapter; query/filter for Upcoming and exclude Live/ended unless requested separately. |
| Kaggle Competitions | https://www.kaggle.com/competitions | Confirmed for upcoming competitions, not exclusively hackathons. The official page shows featured competitions with “3 months to go”, “23 days to go”, and “A month to go”, plus a community-hackathons section. | Official/public listing adapter; include future/open competitions and label source type as competition or community hackathon. |
| Topcoder Challenges | https://www.topcoder.com/challenges/ | Confirmed. The official page exposes “Active Challenges” and “Open for Registration”. | Public-page adapter; use Open for Registration/active records only. |
| Unstop Hackathons | https://unstop.com/hackathons | Confirmed. The official page presents a large current hackathon listing with active opportunity cards and registration-oriented fields. | Existing official public API adapter; retain upcoming/open filtering. |
| DoraHacks | https://dorahacks.io/hackathon/ | Platform confirmed, but the directory extraction is sparse and individual pages must be checked for dates/status. | Public-page adapter only when future dates or open-registration status are present; do not populate feed from undated records. |
| TAIKAI | https://taikai.network/en/hackathons | Platform confirmed and official hackathons directory exists, but the extracted directory does not expose event dates/status in static text. | Public-page/JS adapter only when records include future dates or open status; otherwise keep catalog inactive. |
| Hack Club | https://hackathons.hackclub.com/ | Confirmed. Official page describes a curated list with 116 events and upcoming date cards; an official public JSON endpoint is used by the adapter. | Official public API adapter; filter to future start/end dates and preserve source attribution. |
| ChallengeRocket | https://challengerocket.com/ | Not confirmed as an upcoming public listing. The official result is a platform/organizer page rather than a discoverable upcoming-events directory. | Do not include in the active upcoming feed until a public listing endpoint/page with future records is verified. Keep only as a disabled catalog candidate if needed. |

## Rule to implement

The active supported-sites response should expose `upcomingStatus: "confirmed"` only for sources with a current official upcoming/open listing. Sources that are platform-valid but have no currently verifiable future records should be marked `upcomingStatus: "conditional"` or omitted from the active list. Normalized records must be filtered by parsed end/start dates when present, and undated records from conditional sources must not enter the unified upcoming feed.

## References

[1]: https://devpost.com/hackathons "Devpost — New & upcoming hackathons"
[2]: https://mlh.io/seasons/2026/events "Major League Hacking — 2026 events"
[3]: https://www.hackerearth.com/challenges/ "HackerEarth — Challenges"
[4]: https://www.kaggle.com/competitions "Kaggle — Competitions and Hackathons"
[5]: https://www.topcoder.com/challenges/ "Topcoder — Challenge Listings"
[6]: https://unstop.com/hackathons "Unstop — Hackathons"
[7]: https://dorahacks.io/hackathon/ "DoraHacks — Hackathon directory"
[8]: https://taikai.network/en/hackathons "TAIKAI — Hackathons"
[9]: https://hackathons.hackclub.com/ "Hack Club — High School Hackathons"
[10]: https://challengerocket.com/run-outstanding-hackathons "ChallengeRocket — hackathon platform page"
