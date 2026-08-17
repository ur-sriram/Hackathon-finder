# Devpost source audit

Official listing: https://devpost.com/hackathons
Official category used for public extraction: https://devpost.com/c/artificial-intelligence
Representative event: https://agentic-cinema.devpost.com/

Direct server-side requests to `https://devpost.com/hackathons` returned HTTP 403 in the sandbox. The read-only public rendering fallback at `https://r.jina.ai/http://devpost.com/c/artificial-intelligence` returned real event-card markdown with actual Devpost subdomain URLs, titles, descriptions, prize pools, participant counts, deadlines, dates, and mode. Examples included `https://youcam-api.devpost.com/`, `https://xprize.devpost.com/`, `https://win4aisafety-sain-utrecht.devpost.com/`, `https://cockroachdb-ai.devpost.com/`, and `https://agentic-cinema.devpost.com/`.

The previous generic fallback incorrectly emitted navigation/product links including `devpost.com/hackathons`, `devpost.com/software`, `devpost.team`, `info.devpost.com`, and `help.devpost.com`. The dedicated adapter now accepts only HTTPS URLs matching `<slug>.devpost.com/`, rejects those non-event domains, parses real event-card fields, and enriches cards through the corresponding public event detail pages. Local verification returned HTTP 200, 40 Devpost records, zero invalid navigation/help/blog links, and real event URLs. Tests cover URL validation, rich card parsing, invalid-link rejection, organizer extraction, and slug-based organizer fallback.

## Permanent-domain verification (2026-08-17)

After cache expiry, `https://coimbatoreap-j8kwgsgj.manus.space/api/opportunities` returned the dedicated Devpost output. A scan found 80 URL occurrences representing 40 unique Devpost records; every URL matched the real-event pattern `https://<event-slug>.devpost.com/`, with zero invalid directory/product/help/blog links. The live homepage showed `Devpost: 40 found`, the Devpost source filter, and source-specific cards. The first card rendered organizer `YouCam`, prize pool `$6,000 in prizes`, participants `1278`, and `Open source https://youcam-api.devpost.com/`. Three live links were opened successfully: `https://youcam-api.devpost.com/` (YouCam API event, Perfect Corp, 1,278 participants), `https://xprize.devpost.com/` (Build with Gemini XPRIZE, $2,000,000), and `https://win4aisafety-sain-utrecht.devpost.com/` (Win4AISafety research challenge, SAIN Utrecht, 61 participants). Each was an event-specific Devpost page, not a directory/help/product page.
