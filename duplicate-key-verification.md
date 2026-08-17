# Duplicate-key verification — 2026-08-17

The duplicate React key reports were caused by repeated normalized records whose identity was derived only from `sourceId + url`. The fix adds `ensureUniqueOpportunityIds`, which preserves the first ID and suffixes repeated IDs deterministically (`#2`, `#3`, and so on). The helper is applied to generic source records, Unstop, Hack Club, and KnowAFest records before they reach the feed.

Post-fix checks: TypeScript passed; the full Vitest suite passed with 40 tests; the development feed rendered 24 records after loading; the current browser console session returned no output. Existing `.manus-logs/browserConsole.log` entries with duplicate-key warnings are historical entries from 10:25:58 before the fix.
