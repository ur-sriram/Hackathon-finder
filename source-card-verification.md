# Source-specific card verification

The development feed loaded 261 matching records across 11 connectors after the source-card renderer update. The Unstop card now renders source-specific sections for registration, team-size guidance, schedule, and structured prize ranks (`Rank 1`, `Rank 2`, `Rank 3`, `Rank 4–10`, `Rank 11 or more`) instead of displaying the raw prize JSON payload. The card layout remains readable with long titles, descriptions, locations, and missing fields. Source statuses remain explicit, including found, no-records, blocked, and temporary issue states.

The source renderer families are implemented for Unstop, Hack Club, KnowAFest, Kaggle/Topcoder competitions, and public generic listings. Formatting tests cover escaped JSON, object-string suppression, and plain metadata chips. TypeScript and 45 tests pass.
