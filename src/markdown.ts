/** Limits result-table rows under a named heading; other sections stay unchanged. */

function normalizeHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesHeading(value: string, expected: string): boolean {
  const normalized = normalizeHeading(value);
  const want = normalizeHeading(expected);
  if (normalized === want || normalized.startsWith(`${want} `)) {
    return true;
  }
  // "News Results (5)" normalizes to "news results 5".
  const rest = normalized.startsWith(want) ? normalized.slice(want.length) : undefined;
  return rest !== undefined && /^\s*\d/.test(rest);
}

function atxHeadingText(line: string): { level: number; text: string } | undefined {
  const m = /^(#{1,6})\s+(.*)$/.exec(line);
  if (!m || m[1] === undefined || m[2] === undefined) return undefined;
  return { level: m[1].length, text: m[2].replace(/#+\s*$/, "").trim() };
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|");
}

function isTableSeparator(line: string): boolean {
  return /^\|?[\s:|-]+\|[\s:|-]*$/.test(line.trim()) && line.includes("-");
}

export function limitResultTable(markdown: string, opts: { heading: string; limit: number }): string {
  const { heading, limit } = opts;
  const lines = markdown.split("\n");

  let sectionLevel: number | undefined;
  let sectionStart = -1;
  let sectionEnd = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    const h = atxHeadingText(line);
    if (!h) continue;
    if (sectionLevel === undefined) {
      if (matchesHeading(h.text, heading)) {
        sectionLevel = h.level;
        sectionStart = i;
      }
      continue;
    }
    if (h.level <= sectionLevel) {
      sectionEnd = i;
      break;
    }
  }

  if (sectionLevel === undefined || sectionStart < 0) {
    return markdown;
  }

  let headerSeen = false;
  let separatorSeen = false;
  let rowCount = 0;
  const removed = new Set<number>();

  for (let i = sectionStart + 1; i < sectionEnd; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    if (!isTableRow(line)) {
      if (separatorSeen && line.trim() === "") break;
      continue;
    }
    if (!headerSeen) {
      headerSeen = true;
      continue;
    }
    if (!separatorSeen) {
      if (isTableSeparator(line)) {
        separatorSeen = true;
      }
      continue;
    }
    rowCount++;
    if (rowCount > limit) {
      removed.add(i);
    }
  }

  if (removed.size === 0) {
    return markdown;
  }

  return lines.filter((_, i) => !removed.has(i)).join("\n");
}
