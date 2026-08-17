# Reskilll Discover Source Notes

## Verified public source

The current Reskilll catalogue is available at `https://reskilll.com/discover`. It is server-rendered by a Next.js application and exposes card anchors for live and upcoming opportunities. The legacy `/allevents` page is an archive containing historical, closed event records and is not appropriate for the active feed.

## Card data observed

The live Discover cards expose a stable anchor structure containing the following public fields:

| Field | Source location | Example |
|---|---|---|
| Destination | Card anchor `href` | `https://iqoo.reskilll.com/` |
| Banner image | First card image | iQOO City Battles banner |
| Mode | Card overlay | `In person` or `Hybrid` |
| Organizer | Small organizer row | `iQOO` |
| Title | Card heading | `iQOO Hackathon 2026 - City Battles` |
| Chips | Card tag row | `Live`, `AI`, `4 Cities` |
| Dates and registration state | Calendar line | `29 Aug – 27 Sep 2026 · Registrations open` |
| Location | Map line | `Bengaluru · Pune · Chennai · Hyderabad` |
| Prize | Card footer | `₹40,00,000` |
| Action | Card footer | `Register` |

## Extraction policy

Only the primary Discover cards are eligible. Lower-page generic `/hack/...` links are duplicate summaries and must be excluded. The adapter must retain only cards whose visible state indicates an active registration or live/ongoing opportunity, and it must reject `Closed` or `Ended` cards. Event destinations are publisher-controlled detail or registration pages, including Reskilll campaign subdomains and partner URLs.

## Local adapter verification

The local public opportunities endpoint returned four eligible Reskilll records after parsing the current catalogue: iQOO Hackathon 2026 - City Battles, Health-a-thon 2026, Build with AI: Vibe with X × Google Cloud, and NIRMAAN 2026. The parser excluded closed cards and dated cards whose visible ranges had already ended. The iQOO record retained its banner, organizer, `Live`, `AI`, and `4 Cities` chips, its 29 August–27 September schedule with registration state, multi-city location, ₹40,00,000 prize, and official `https://iqoo.reskilll.com/` registration target.

The local Reskilll-filtered feed rendered four source-specific cards. The iQOO City Battles card visibly used the supplied reference hierarchy: banner with an In person badge, iQOO organizer row, title, `Live`/`AI`/`4 Cities` chips, schedule and location rows, ₹40,00,000 prize, and a Register action. The NIRMAAN, Health-a-thon, and Build with AI cards followed the same layout with their available fields.

## Permanent-domain verification note

The first permanent-domain API and homepage requests still returned the previous twelve-source deployment during propagation. The deployment status subsequently reported success; the published API must be rechecked with a fresh request before the release is marked verified.

The follow-up permanent API returned thirteen source connectors and four Reskilll records with no expired deadline-bearing record. The permanent homepage likewise rendered Reskilll in the source selector and reported `Reskilll: 4 found`.

Filtering the permanent homepage to Reskilll displayed four published cards. The iQOO card showed its source banner, In person badge, iQOO organizer, title, `Live`/`AI`/`4 Cities` chips, 29 August–27 September registration schedule, multi-city location, ₹40,00,000 prize, and Register action. The same source-specific hierarchy rendered for NIRMAAN, Health-a-thon, and Build with AI.
