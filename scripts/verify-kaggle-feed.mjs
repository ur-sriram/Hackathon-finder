import { readFileSync } from "node:fs";

const payload = JSON.parse(readFileSync("/tmp/local-opportunities.json", "utf8"));
const source = payload.sources.find((item) => item.siteId === "kaggle");
const now = Date.now();
const invalidUrls = source.records.filter((record) => !/^https:\/\/www\.kaggle\.com\/competitions\/[a-z0-9-]+$/.test(record.url));
const nonFutureDeadlines = source.records.filter((record) => !Number.isFinite(Date.parse(record.deadline)) || Date.parse(record.deadline) <= now);

console.log(JSON.stringify({
  status: source.status,
  recordCount: source.records.length,
  invalidUrlCount: invalidUrls.length,
  nonFutureDeadlineCount: nonFutureDeadlines.length,
  sample: source.records.slice(0, 5).map(({ title, organizer, deadline, prizePool, participants, url }) => ({ title, organizer, deadline, prizePool, participants, url })),
}, null, 2));
