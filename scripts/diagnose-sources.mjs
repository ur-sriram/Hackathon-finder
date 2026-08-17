import fs from "node:fs";

const targets = [
  ["local", "http://127.0.0.1:3000/api/opportunities?diagnostic=source-status"],
  ["public", "https://coimbatoreap-j8kwgsgj.manus.space/api/opportunities?diagnostic=source-status"],
];

for (const [name, url] of targets) {
  const started = Date.now();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(70000) });
    const text = await response.text();
    const output = { name, url, httpStatus: response.status, elapsedMs: Date.now() - started };
    try {
      const payload = JSON.parse(text);
      output.recordCount = payload.records?.length ?? payload.opportunities?.length ?? null;
      output.sources = (payload.sources ?? []).map((source) => ({
        site: source.site,
        status: source.status,
        recordCount: source.recordCount ?? source.records?.length ?? null,
        error: source.error ?? source.message ?? null,
        durationMs: source.durationMs ?? null,
      }));
      output.firstRecords = (payload.records ?? payload.opportunities ?? []).slice(0, 3).map((record) => ({
        id: record.id,
        source: record.source,
        title: record.title,
        url: record.url,
      }));
    } catch {
      output.parseError = text.slice(0, 500);
    }
    fs.writeFileSync(`/tmp/${name}-source-diagnostic.json`, JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    const output = { name, url, error: String(error), elapsedMs: Date.now() - started };
    fs.writeFileSync(`/tmp/${name}-source-diagnostic.json`, JSON.stringify(output, null, 2));
    console.log(JSON.stringify(output, null, 2));
  }
}
