# Supported Hackathon Sites Research

| Site | Confirmed public/API status | Planned adapter |
|---|---|---|
| Devpost | Public hackathon directory is accessible and lists thousands of entries. Search did not reveal a verified official directory API; an unofficial API project exists. | Safe public-page adapter first; do not depend on unofficial endpoints unless explicitly approved.
| Major League Hacking | Official public events directory is accessible and exposes event names, dates, locations, modality, logos, and links in the rendered page. | Safe public-page adapter for the official events directory.
| HackerEarth Challenges | Official API documentation found, but it is for code evaluation and requires a registered client secret; it is not a public challenge-directory API. | Safe public-page adapter for public challenge listings; no credentials assumed.
| Kaggle Competitions | Official Kaggle API/CLI exists and supports competitions, but authentication uses OAuth or an API token and dynamic rate limits apply. | Optional official API adapter behind user-provided credentials; public-page fallback for discoverable competitions.
| Topcoder Challenges | Public challenge API documentation and an official `topcoder-platform/challenge-api` repository were found. | Official public challenge API adapter where endpoint access is available; page fallback otherwise.
| Unstop Hackathons | Public listing API was previously verified in this project and supports normalized rich records and pagination. | Existing official/public Unstop adapter.
| DoraHacks | Public hackathon directory is accessible; no verified public official API was found in the initial research. | Safe public-page adapter.
| TAIKAI | Public platform and hackathon pages are accessible; no verified public listing API was found. | Safe public-page adapter.
| Hack Club | Official public JSON API documented at `https://hackathons.hackclub.com/api/events/upcoming` and `/api/events/all`; source requires attribution. | Official API adapter with required source credit.
| ChallengeRocket | No verified official API found in the initial research. | Safe public-page adapter, subject to public accessibility and rate limits.

## Guardrails

The application will only retrieve publicly accessible content and documented public APIs. It will not bypass login pages, CAPTCHAs, paywalls, robots restrictions, rate limits, or other access controls. API keys or OAuth credentials will not be invented; connectors requiring credentials will be clearly marked and disabled until supplied.

## References

[1]: https://devpost.com/hackathons "Devpost hackathon directory"
[2]: https://www.mlh.com/events "Major League Hacking events directory"
[3]: https://www.hackerearth.com/docs/wiki/developers/v4/ "HackerEarth API V4 documentation"
[4]: https://www.kaggle.com/docs/api "Kaggle API documentation"
[5]: https://tcapi.docs.apiary.io/ "Topcoder API documentation"
[6]: https://github.com/topcoder-platform/challenge-api "Topcoder challenge API repository"
[7]: https://unstop.com/hackathons "Unstop hackathon directory"
[8]: https://dorahacks.io/hackathon "DoraHacks hackathon directory"
[9]: https://taikai.network/en "TAIKAI public platform"
[10]: https://hackathons.hackclub.com/data/ "Hack Club Events API documentation"
[11]: https://hackathons.hackclub.com/api/events/upcoming "Hack Club upcoming events API"
[12]: https://hackathons.hackclub.com/api/events/all "Hack Club all events API"
[13]: https://challengerocket.com/ "ChallengeRocket public site"
