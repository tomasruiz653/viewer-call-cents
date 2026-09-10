import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 150): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/** All space-separated terms must appear somewhere in the haystack (case-insensitive). */
export function matchesQuery(haystackLower: string, query: string): boolean {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  return terms.every((term) => haystackLower.includes(term));
}

export interface TextSegment {
  text: string;
  match: boolean;
}

/** Splits `text` into segments so callers can render matches with a highlight, without pulling
 *  in a markdown/HTML templating dependency. */
export function highlightSegments(text: string, query: string): TextSegment[] {
  const term = query.trim();
  if (!term) return [{ text, match: false }];
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(regex);
  return parts
    .filter((p) => p.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === term.toLowerCase() }));
}

/** Finds a short window of `content` around the first query match, for search-result previews. */
export function excerptAround(content: string, query: string, radius = 80): string {
  const term = query.trim().toLowerCase();
  if (!term) return content.slice(0, radius * 2);
  const idx = content.toLowerCase().indexOf(term);
  if (idx === -1) return content.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + term.length + radius);
  return `${start > 0 ? "…" : ""}${content.slice(start, end)}${end < content.length ? "…" : ""}`;
}
