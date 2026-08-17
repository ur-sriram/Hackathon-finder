# Project TODO

- [x] Define the events data model and database migration
- [x] Implement the KnowAFest Coimbatore scraper with server-side browser-compatible parsing
- [x] Add database-backed event upsert and freshness tracking
- [x] Add the public `GET /api/events` endpoint with structured event JSON
- [x] Add the six-hour scheduled refresh callback using the platform Heartbeat system
- [x] Build the premium events listing page
- [x] Add event type filtering with Hackathon, Workshop, and FDP values
- [x] Add search by event name and organiser
- [x] Add event count badge and last-updated timestamp
- [x] Add Vitest coverage for parsing, API output, and refresh behavior
- [x] Run type checks, tests, and visual verification
- [x] Save the final checkpoint and provide publish instructions
- [x] Create and bind the real project Heartbeat cron after deployment with cron `0 0 */6 * * *`, persist its task UID, and verify one callback run

## URL-to-API Builder

- [x] Add saved URL-source and extraction configuration data models
- [x] Add SSRF-safe public URL validation and bounded server-side fetching
- [x] Add extraction preview from arbitrary public HTML pages
- [x] Add reusable generated JSON API routes for saved sources
- [x] Add URL input, field mapping, preview, save, and API test UI
- [x] Add tests for URL validation, extraction, saved API output, and failure states
- [x] Verify the deployed URL-to-API workflow on the public domain

## Release verification follow-up

- [x] Add an editable field-mapping panel before saving a generated API
- [x] Add saved-source and generated-endpoint route tests, including failure cases
- [x] Verify the complete preview, save, and generated API flow on the deployed public domain
- [x] Configure and inspect one production Heartbeat refresh window; the job is enabled at six hours, but the platform returned no execution record during observation

## Unstop Compatibility

- [x] Inspect the public Unstop hackathons page and document its access and rendering behavior
- [x] Add rendered-page extraction fallback for JavaScript-driven public pages
- [x] Preserve SSRF, size, timeout, and access-control protections
- [x] Add Unstop extraction tests and verify a generated API response
- [x] Save and publish the Unstop-compatible update

## Rich Unstop Hackathon Details

- [x] Define the rich hackathon JSON contract for descriptions, dates, eligibility, deadlines, locations, team size, skills, prizes, tags, media, and links
- [x] Normalize rich details from Unstop's public opportunity listing response
- [x] Add a detailed hackathon listing/detail experience to the UI
- [x] Preserve rich details in saved generated API output and field mapping
- [x] Add tests for rich detail normalization and generated JSON output
- [x] Verify and publish the rich Unstop experience on the public domain

## Unstop Main Feed Expansion

- [x] Inspect and document the Unstop listing pagination and current feed limit
- [x] Retrieve all available public Unstop hackathons across pagination within safe bounds
- [x] Add Unstop hackathons to the main feed with source labels and rich fields
- [x] Add feed tabs, filters, pagination or load-more behavior, and accurate counts
- [x] Add tests for pagination, deduplication, merged feed output, and refresh behavior
- [x] Verify and publish the expanded main feed

## Expanded Feed Verification Gaps

- [x] Add explicit source labels and feed tabs for All, KnowAFest, and Unstop
- [x] Add a unified feed view combining normalized KnowAFest and Unstop items
- [x] Add merged-feed and refresh behavior tests
- [x] Save a new checkpoint and verify the expanded feed on the public domain

## Supported Hackathon Sites

- [x] Research official API availability and public access for Devpost, Major League Hacking, HackerEarth Challenges, Kaggle Competitions, Topcoder Challenges, Unstop Hackathons, DoraHacks, TAIKAI, Hack Club, and ChallengeRocket
- [x] Define a source adapter registry with API-versus-public-page status and safe fallback rules
- [x] Implement source-specific normalization adapters using official public APIs where available
- [x] Implement safe public-page adapters for sources without suitable official APIs
- [x] Add supported-site selection and status messaging to the builder UI
- [x] Add tests and representative preview/API verification for the supported-site adapters
- [x] Save and publish the supported-sites release

## Upcoming-only Source Verification

- [x] Verify each requested site has a current upcoming-hackathons or upcoming-competition listing
- [x] Record verification URLs, access mode, and whether the listing is actually upcoming
- [x] Remove or label sources that do not pass the upcoming-listing check
- [x] Add upcoming-date filtering to normalized adapters and supported-site status
- [x] Add tests for upcoming-only classification and filtering
- [x] Save and publish the corrected source catalog

## Verification Gap Corrections

- [x] Add representative adapter-level verification for Hack Club and active public-page sources
- [x] Add a supported-sites endpoint contract test for active and excluded sources
- [x] Add regression tests proving past and undated records are excluded from confirmed feeds
- [x] Clarify that inactive sources are intentionally disabled until their upcoming listing is verifiable

## All-source Unified Feed Expansion

- [x] Audit why non-Unstop sources are not currently fetching and document each source response shape
- [x] Fetch all ten requested platforms with source status and graceful empty/error states
- [x] Normalize all source records into a shared opportunity schema with cost, geography, mode, domain, dates, prizes, and links
- [x] Add source-specific rich cards that safely handle missing fields and unique schemas
- [x] Add top-of-feed filters for free/paid, country, state, district, online/offline, domain, and source
- [x] Add sorting by deadline, start date, newest, and relevance
- [x] Add tests for all-source merging, normalization, filtering, sorting, and empty/error states
- [x] Verify the public feed and save a new checkpoint

## All-source Verification Corrections

- [x] Commit a durable per-source response-shape and failure-mode audit
- [x] Add named source-specific card rendering branches for rich fields
- [x] Add relevance sorting and tests
- [x] Add feed filtering, sorting, merge, and explicit empty/error-state tests

## Production API and E-commerce Filter Fix

- [x] Diagnose why the public `/api/opportunities` route returns the SPA fallback or source errors
- [x] Fix production API routing and make per-source failures non-blocking with useful error metadata
- [x] Replace the compact filter row with an e-commerce-style filter panel or drawer
- [x] Add applied-filter chips, clear-all, source/category facets, cost, mode, geography, domain, date, and sort controls
- [x] Add responsive e-commerce-style filter panel and mobile drawer behavior
- [x] Add tests for production route output, non-blocking source errors, filter state, and reset behavior
- [x] Verify the public domain and publish the fix

## Filter Fidelity and Release Verification

- [x] Add category/type facet and date-window filter to the e-commerce filter panel
- [x] Implement a responsive e-commerce-style filter panel with mobile drawer presentation
- [x] Add executed tests for blocked/unavailable status mapping and clear-all filter behavior
- [x] Verify the updated UI and API on the permanent public domain after the new checkpoint

## Duplicate React Key Fix

- [x] Trace duplicate opportunity IDs produced by repeated source URLs
- [x] Generate deterministic unique IDs for duplicate normalized records without hiding records
- [x] Add regression tests for duplicate Devpost-style URLs and rendered list identity
- [x] Verify the live page has no duplicate-key console warnings and publish the fix

## Live Verification Loop

- [x] Smoke-test the permanent homepage, all-source API, events API, hackathons API, and supported-sites API
- [x] Verify the loaded feed, source statuses, filters, sorting, load-more, and refresh behavior
- [x] Inspect live browser console and network failures
- [x] Fix every reproducible application failure found during verification
- [x] Repeat the live checks after each fix and publish the final verified state

## Live Verification Finding

- [x] Sanitize object-shaped location fields so country/state/district filters never display `[object Object]`
- [x] Add a normalization regression test for object-shaped geography fields
- [x] Re-run live feed, filter, API, and console checks after the sanitization fix

## Remaining Live Interaction Checks

- [x] Verify the live Load 24 more control increases the rendered card count
- [x] Verify the live Refresh control reloads the feed successfully
- [x] Inspect live browser network requests after loading and interactions

## Source-specific Opportunity Cards

- [x] Audit every normalized source field and the current shared card body
- [x] Create dedicated card renderers for Unstop, Hack Club, KnowAFest, Devpost/MLH, competitions, and generic sources
- [x] Render source-specific metadata sections only when fields are present
- [x] Parse and format structured prizes, tags, skills, eligibility, organizers, schedules, and registration details
- [x] Prevent raw JSON, `[object Object]`, and overlong unbroken metadata from appearing in cards
- [x] Add responsive card layout and source-card regression tests
- [x] Verify each card family on the live feed and publish the update

## Source-card Verification Corrections

- [x] Add dedicated Devpost and Major League Hacking card detail branches or explicitly model their shared listing family
- [x] Extend the opportunity model with eligibility and tags where source data provides them
- [x] Add render-level card-family tests for Unstop, Hack Club, KnowAFest, Devpost/MLH, competitions, and generic listings
- [x] Add responsive card regression coverage for long and missing source fields
- [x] Verify the updated source cards on the permanent public domain and publish a checkpoint

## Responsive Card Verification

- [x] Add narrow-viewport source-card layout assertions or a documented mobile visual verification
- [x] Re-run permanent-domain source-card checks after responsive verification and publish the final checkpoint

## Devpost Real Hackathon Feed Fix

- [x] Audit current Devpost source extraction and identify navigation/help/blog links being treated as events
- [x] Discover and normalize actual Devpost hackathon event URLs and Devpost-style details
- [x] Reject directory, product, help, blog, and generic navigation URLs from event records
- [x] Add Devpost-specific fields for dates, prize pool, participants, organizer, tags, mode, and featured status
- [x] Update Devpost cards and Open source links to use the actual event URL
- [x] Add regression tests for real event URLs, invalid links, and rich Devpost detail normalization
- [x] Verify Devpost cards and links on the public domain and publish the correction

## Kaggle Competition Feed

- [x] Discover a current official Kaggle competition listing or public API response that is accessible without interactive login
- [x] Evaluate Maxun as a rendered-page fallback, including deployment requirements, access constraints, and a safe failure policy
- [x] Implement a resilient Kaggle competition adapter with normalized deadlines, prizes, teams, tags, and event URLs
- [x] Add regression tests for Kaggle parsing, future/open filtering, and source status output
- [x] Verify Kaggle records in the permanent public feed and publish the update

## Kaggle Card Redesign

- [x] Remove Kaggle cost, mode, and location fields from the card presentation and use price instead
- [x] Exclude expired Kaggle competitions from the normalized feed and add readable deadline/countdown formatting
- [x] Add a Kaggle-style overview card layout with summary, price, teams, tags, and source link
- [x] Add regression tests for expired-record filtering, price output, deadline formatting, and card content
- [x] Verify the redesigned Kaggle feed on the permanent domain and publish the update


## Taste and Impeccable Design Skills

- [x] Inspect the requested GitHub repositories and verify their official installation instructions
- [x] Install or vendor compatible skill guidance without executing untrusted repository scripts
- [x] Apply the relevant design-system and UI-polish guidance to the Kaggle card and feed controls
- [x] Add or update UI regression coverage and verify the refined design visually
- [x] Publish the refined UI and document the installed skill sources

- [x] Apply Taste/Impeccable-guided refinements to feed-control hierarchy, labels, and Kaggle relevance
- [x] Verify the refined feed controls on the live page and document the before/after outcome
- [x] Save and publish a checkpoint containing the Kaggle card and contextual feed-control refinements, then verify the permanent domain
- [x] Document the feed-control before/after outcome and permanent-domain evidence

## Live UI and Source Reliability Fix

- [x] Test the local and permanent opportunity APIs and record each source status, record count, latency, and failure reason
- [x] Diagnose why the visible permanent UI differs from the current refined local UI
- [x] Repair reproducible connector failures without hiding publisher-blocked sources or fabricating records
- [x] Add regression coverage for source status handling and the corrected UI/source behavior
- [x] Re-run browser, API, TypeScript, and Vitest checks and publish the verified fix


## Hack2Skill Source and Homepage Simplification

- [x] Verify Hack2Skill listing access, card fields, and official detail URLs
- [x] Add Hack2Skill to the supported source registry and normalized opportunity feed
- [x] Remove the top URL-to-API tester/builder section from the homepage
- [x] Add a dedicated Hack2Skill card showing only image, title, price/mode, registration deadline, and Register Now link
- [x] Add parser, source-status, filter, and card regression coverage
- [x] Verify the source and redesigned homepage on the permanent domain and publish the update



## Hack2Skill implementation follow-up
- [x] Verify Hack2Skill listing access, card fields, and official detail URLs
- [x] Add Hack2Skill to the supported source registry and normalized opportunity feed
- [x] Remove the rendered top URL-to-API tester/builder section from the homepage
- [x] Add a dedicated Hack2Skill card showing only image, title, price/mode, registration deadline, and Register Now link
- [x] Add parser, source-status, filter, and card regression coverage
- [x] Verify the source and redesigned homepage on the permanent domain and publish the update

## Reskill Source and Card

- [x] Discover a stable public Reskill listing endpoint and official event-detail URLs
- [x] Add Reskill to the supported-source registry and normalized public opportunities API
- [x] Create a Reskill card with image, organizer, title, mode/status/domain/location chips, event dates/registration state, prize amount, and Register link
- [x] Exclude closed or expired Reskill opportunities from the feed
- [x] Add Reskill parser, filtering, source-status, and card-render regression coverage
- [x] Verify Reskill records and the dedicated card locally and on the permanent domain
- [x] Save and publish the Reskill release checkpoint

## Devfolio and Internshala Hackathons

- [x] Inspect Devfolio’s current public listing, data route, event URLs, and card hierarchy
- [x] Inspect Internshala Hackathons’ current public listing, data route, event URLs, and card hierarchy
- [x] Add active-only Devfolio and Internshala adapters to the public opportunities API and source registry
- [x] Build independent Devfolio and Internshala cards reflecting each publisher’s current visual hierarchy and available metadata
- [x] Exclude expired, closed, duplicate, and non-event records for both sources
- [x] Add parser, source-status, source-filtering, and source-card regression coverage for both sources
- [x] Deduplicate Internshala records by canonical detail URL across paginated listing pages
- [x] Add explicit Devfolio and Internshala runtime source-status assertions to the public opportunities endpoint tests
- [x] Replace the Devfolio rate-limited rendered-page reader with its verified official structured upcoming-search endpoint
- [ ] Verify both sources and their dedicated cards locally and on the permanent domain
- [ ] Save and publish the verified Devfolio and Internshala release

## Connected GitHub Export

- [x] Inspect the user’s connected GitHub account and select the export repository: ur-sriram/Hackathon-finder
- [ ] Verify connected GitHub write access to ur-sriram/Hackathon-finder
- [ ] Export the current verified project release to ur-sriram/Hackathon-finder
- [ ] Confirm ur-sriram/Hackathon-finder contains the exported release

## Product Review Adoption — Trust and Personalization

- [x] Reposition the hero, title, and primary navigation around finding the right hackathon rather than building a generic API
- [x] Add a visible freshness summary and move source diagnostics into a compact data-coverage disclosure
- [x] Harden default feed filtering so expired deadlines and finished schedules never appear as open opportunities
- [x] Separate event, registration, and source-directory links in normalized public API records and cards
- [x] De-emphasize unknown metadata while retaining transparent data-quality signals
- [x] Add a guest-friendly preference onboarding flow for skills, domains, mode, cost, location, and goals
- [x] Add transparent weighted recommendation ranking with “Why this matches” explanations and an Explore all escape route
- [x] Add saved-interest and dismissal actions as the initial returning-user feedback loop
- [x] Add tests covering freshness status, link semantics, preference scoring, and reviewed homepage behavior
- [ ] Verify the reviewed experience locally and on the permanent domain
- [ ] Save and publish the product-review implementation

## Brutal UI/UX Review — Decision-Focused Corrections

- [x] Exclude entries with a passed registration deadline from the default participant feed, even when their event start date is future
- [x] Replace raw timestamps with short human-readable deadline states such as Closes today, Closes in 3 days, Closes 18 Aug, or Deadline passed
- [x] Reduce default cards to a compact decision summary with title, source, deadline, mode, location, cost, relevance, data quality, and direct CTA
- [x] Move long descriptions, schedules, eligibility, and prize detail into a progressive expanded-details experience
- [x] Strip HTML entities and source boilerplate from displayed descriptions and produce readable short summaries
- [x] Use only action-accurate CTAs: Register now, View event, or Open publisher page
- [x] Add a Report incorrect information action to partially parsed cards
- [x] Promote Deadline, Mode, and Domain as primary controls and move secondary filters into a More filters panel
- [x] Add compact active-filter chips with individual removal and a concise results-state summary
- [x] Verify a reliable mobile filter drawer at a narrow viewport, with Apply filters and result count
- [x] Add tests for registration-deadline exclusion, concise timing, compact-card field policy, CTA semantics, and mobile filter interactions
- [ ] Verify and publish the brutal-review corrections on the permanent domain
