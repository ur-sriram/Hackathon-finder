# Product Review Adoption Notes

The supplied review recommends shifting the product’s center of gravity from a source/API demonstration to a trusted assistant for finding the right hackathon. The adopted first release priorities are a user-outcome hero, freshness and status correctness, clear event-level versus directory link semantics, compact data-quality signals, a less intrusive coverage panel, and a guest-friendly personalization foundation.

## Selected implementation contract

| Review finding | Adopted product behavior |
| --- | --- |
| The hero leads with API building rather than participant outcomes. | The homepage will promise help finding hackathons by skills, goals, and schedule; the API remains a secondary developer link. |
| Cards can show past dates as upcoming. | The default feed will exclude records with a parsed past deadline or completed schedule, and will expose a canonical open/closing-soon/starting-soon/date-unavailable status. |
| Event and source links are conflated. | Public records will expose `eventUrl`, `registrationUrl`, and `sourcePageUrl`; cards will distinguish direct actions from an honest source-directory fallback. |
| Missing metadata carries too much visual weight. | Cards will use a discreet details-incomplete signal rather than filling primary rows with repeated unknown values. |
| Source health is transparent but visually noisy. | A compact freshness summary and expandable data-coverage panel will keep diagnostics available without dominating discovery. |
| There is no returning-user loop. | The first iteration will add guest preference onboarding, transparent weighted match reasons, saved-interest and dismissal controls, and an Explore all escape route. |

## Deferred work

Notification delivery, team matching, learned ranking, source reliability scoring, and cross-device persistence remain follow-on features. They depend on the preference and activity data model established by the initial personalization loop.

## Local verification evidence

On 17 August 2026, the local `/api/opportunities` feed returned 383 active records across 15 source connectors. Thirteen sources reported healthy responses; the expected blocked/credential-limited sources remained visible only inside the compact coverage panel. Sample direct actions resolved to canonical Unstop registration URLs, Devpost event URLs, and source-directory fallbacks only where no event-level link was present.

The reviewed homepage loaded the new document title, participant-focused hero, freshness summary, source coverage disclosure, preference onboarding, local saved/dismissed controls, and direct action labels. Selecting `Python` in the onboarding and applying preferences switched the heading to **Best matches for you**, produced **385 ranked matches**, and added the transparent reason **Matches Python skills** beneath relevant cards while preserving the option to explore all events.
