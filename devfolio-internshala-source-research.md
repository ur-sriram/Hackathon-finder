# Devfolio and Internshala Source Research

## Devfolio upcoming directory

The verified public listing is `https://devfolio.co/hackathons/upcoming`. It renders a two-column grid of compact white cards on a bright blue directory header. Each card contains an event-title link to a real `{slug}.devfolio.co` event site, an optional pair of organizer/social icon links, an explicit `Hackathon` type, a `Theme` label with a pill value, `Offline` and `Upcoming` status pills, an `Opens DD/MM/YY` date label, and a blue `Remind me` action.

The current source cards include Hackify 3.0, Innohacks 4.0, Hacknauts 2.0, Convergence, and HackTopus'FE. The adapter should treat the `Opens` date as the event availability date and preserve the real event-subdomain URL. The visual renderer should preserve Devfolio’s lightweight typographic card structure rather than adopting an image-led generic card.

Devfolio’s client loads `https://api.devfolio.co/api/search/hackathons`, but an unauthenticated direct `GET` returned a 404; the endpoint is therefore not used as the production connector. The official server-rendered upcoming directory remains the stable public extraction surface.

## Internshala Hackathons directory

The verified public listing is `https://internshala.com/competitions/hackathons/`. It is a server-rendered WordPress catalogue with numbered pagination and no separate listing API request required for basic aggregation. Each desktop card is an image-led white tile in a three-column grid. It contains a banner, a small `Hackathons` category label, a prize or award label, a prominent title, a muted organizer line, a compact footer with date, online/offline state, and free/paid label, then a green `Know more >` action.

The current list includes AVISHKARA'26 National-Level Hackathon, CYBER KUSHTI 2026, IEEE CEDA SWEAT 2026 – Hackathon Build Sprint, Financial Services Innovation Challenge 2026, Chandigarh Police National Hackathon 2026, iQOO Hackathon 2026, and Odoo × NMIT Bangalore Hackathon 2026. Detail links use `https://internshala.com/competitions/{slug}/`. The adapter should parse every paginated public list page within a bounded limit, deduplicate by canonical detail URL, and retain only future-dated entries.

## Local adapter verification

After the live reader spacing correction, the local public API reported 15 source connectors, 5 active Devfolio records, and 61 active Internshala records. Every date-bearing record from both sources had a future deadline. Devfolio records resolve to official event subdomains; Internshala records resolve to official competition detail URLs and preserve their title, banner, organizer, prize or award label, date, and available mode.

Filtering the local site to Devfolio rendered five compact typography-led cards. Each retained the publisher’s hierarchy of `Hackathon`, event title, `Theme` / `No Restrictions`, Offline and Upcoming pills, `Opens` date, and blue `Remind me` action. The verified action URLs resolve to the respective Devfolio event subdomains.

Filtering the local site to Internshala Hackathons rendered the image-led catalogue treatment requested from the publisher study. The visible cards retained their banner, `Hackathons` category, prize or award label, title, organizer, date, Online or Offline state, Free or detail indicator, and green `Know more >` detail action. The source filter returned 61 active records, with the initial local view loading 24 cards.

## Devfolio structured fallback

The public Devfolio page bundle confirms that the directory calls `POST https://api.devfolio.co/api/search/hackathons` with `{ "type": "upcoming", "from": 0, "size": 50 }`. The verified response returned five upcoming records and exposes UUID, name, `hackathon_setting.subdomain`, registration opening and closing timestamps, event start timestamp, online state, themes, and logo. This first-party structured endpoint replaces the reader request as the primary adapter because the rendered-page reader can return HTTP 429 in the public deployment.

After restarting the local service, the structured endpoint returned five active Devfolio records with official subdomain URLs and image assets; all had future registration-opening deadlines and no duplicate URLs. The same local verification reported 61 active, canonical Internshala records with no expired dated entries or duplicate detail URLs.
