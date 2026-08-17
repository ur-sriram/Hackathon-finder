# Kaggle Card and Feed-Control Verification

## Before

The shared opportunity card displayed generic `Cost`, `Mode`, `Deadline`, and `Location` rows for Kaggle competitions. Kaggle records also exposed raw ISO timestamps and the global filter panel always showed mode and geography facets even though Kaggle competitions are online and location-independent.

## After

The dedicated Kaggle card presents the competition title, overview, organizer, team count, tags, eligibility/rules guidance, prize details, a readable UTC deadline with countdown, and a direct `View competition` link. The generic Kaggle cost, mode, and location rows are no longer rendered. Expired Kaggle records are excluded by the source adapter.

When the source filter is set to Kaggle, the refined filter panel shows only Source, Category, Price, Sort by, Date window, and Domain. Mode, Country, State, and District controls are hidden and any previously selected values are reset. The panel subtitle changes to `Kaggle view · price, deadline, domain`.

## Permanent-domain evidence

Verified on `https://coimbatoreap-j8kwgsgj.manus.space/?live-ui=0244d090-verified-2` after deployment propagation. The live Kaggle filter showed **21 of 21** matching records, the contextual filter subtitle, only the relevant six controls, direct Kaggle competition URLs, `Prize details`, and readable deadline text such as `Aug 31, 2026 · 15 days to go`. No generic Mode, Country, State, District, Cost, or Location fields appeared in the Kaggle card view.

## Validation

The final local validation completed with TypeScript passing, **63 Vitest tests passing**, and the Impeccable detector reporting no findings for `client/src/pages/Home.tsx`.
