# Kaggle competition source audit

## Primary source: official public listing service

Verified endpoint:

```text
GET https://www.kaggle.com/api/i/competitions.CompetitionService/ListCompetitions?pageSize=1000&pageToken=
```

This unauthenticated first-party endpoint returned HTTP 200 in the server environment, with 750 competition records and associated thumbnail/header mappings. The response exposes `id`, `competitionName`, `title`, `briefDescription`, `dateEnabled`, `deadline`, `reward`, `numPrizes`, `totalTeams`, `totalCompetitors`, `categories`, `organization`, `hostName`, `hackathon`, and image maps. Local verification found 21 records whose deadlines were in the future.

The endpoint is the public service used by Kaggle's own competition UI. Kaggle’s published CLI documentation also confirms that competitions can be listed programmatically, although its authenticated CLI is not necessary for this read-only public listing path.

## Maxun assessment

Maxun is suitable as an optional rendered-page fallback rather than the primary source. Its official documentation describes a self-hosted platform with reusable recorder workflows and SDK/CLI controls, but its Docker setup requires multiple containers, persistent secrets, and browser automation runtime. That exceeds the managed web application's deployment model. Operating it durably would require a separate persistent server with Docker; it should not be introduced while the direct official Kaggle service is live and sufficient.

If the public endpoint later becomes unavailable, a separately hosted Maxun robot can capture Kaggle's rendered list with an explicit record limit and return no records rather than replaying stale data. The adapter must retain source-status metadata and never substitute unrelated page links.
