# Live Source Reliability Audit

## Confirmed root causes

The stale-looking UI was caused by the permanent domain serving a cached application response while a newly published bundle was propagating. A cache-busting reload after deployment and cache expiry showed the current UI bundle and source summary. The public API itself also maintains a short in-memory response cache, so immediate post-deployment checks can temporarily show the previous source payload.

Local source failures were caused by multiple nested, overly short upstream bounds: the generic adapter used a hard-coded 15-second fetch limit, the public-page helper used a 15-second limit, and the Kaggle full listing could take more than 35 seconds to transfer. These limits were increased while remaining bounded. Kaggle now uses the official full-list request with a 45-second upstream bound and 50-second source bound, preserving 21 active future records. Generic public pages use a 45-second fetch bound and the aggregator remains non-blocking through per-source promises.

## Final clean diagnostic

The final local and permanent diagnostic both returned HTTP 200 and 306 records. Both now agree on Devpost 40, Major League Hacking 40, Kaggle 21, Unstop 107, TAIKAI 26, Hack Club 8, ChallengeRocket 40, and KnowAFest Coimbatore 24. HackerEarth and DoraHacks are explicitly blocked by publisher responses in production; Topcoder requires credentials and is treated as a non-record/blocked source rather than fabricated. Local and public record counts are otherwise identical.

## Application changes

Devpost tracking-query links normalize to real event roots. Kaggle uses a bounded full public listing with future-deadline filtering. Generic pages no longer fail solely because a valid listing needs more than 15 seconds. Requests remain SSRF-protected, size-bounded, and timeout-bounded. No records are fabricated for blocked sources.

## Regression and validation

The Devpost query-string parser test and Kaggle pagination configuration test are present. TypeScript validation passes and all 64 Vitest tests pass. The live homepage renders successfully. The permanent UI reports 306 matching records and the source summary reflects the final public API results.

## UI status-summary coverage

The live source-summary formatter is now a pure client helper used by the hydrated feed: healthy sources show `N found`, publisher blocks show `blocked by publisher`, transient failures show `temporary issue`, and empty adapters show `no records`. Client regression coverage asserts all four labels, preventing a stale or ambiguous summary during hydration. The final validation suite passes with 66 tests.
