export function compactText(value: unknown, max = 420) {
  if (value == null) return "";
  if (typeof value === "object") return compactText(JSON.stringify(value), max);
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text || text === "[object Object]" || text === "null" || text === "[]" || text === "{}") return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export function structuredItems(value: string, max = 5): string[] {
  const text = compactText(value, 2600);
  if (!text) return [];
  const candidates = [text, text.replace(/\\"/g, '"'), text.replace(/\\\\/g, "\\")];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (Array.isArray(parsed)) return parsed.slice(0, max).map(item => typeof item === "object" && item ? compactText((item as Record<string, unknown>).name ?? (item as Record<string, unknown>).title ?? (item as Record<string, unknown>).rank ?? item, 180) : compactText(item, 180)).filter(Boolean);
      if (typeof parsed === "object" && parsed) return Object.entries(parsed as Record<string, unknown>).slice(0, max).map(([key, item]) => key + ": " + compactText(item, 180)).filter(Boolean);
    } catch { /* try the next JSON representation */ }
  }
  const normalized = text.replace(/\\+/g, "");
  const prizeRanks = Array.from(normalized.matchAll(/["']?rank["']?\s*:\s*["']([^"']+)/gi)).map(match => match[1]).filter(Boolean).slice(0, max);
  if (prizeRanks.length) return prizeRanks;
  return text.split(/[,;|\n]+/).map(item => item.trim()).filter(Boolean).slice(0, max);
}
