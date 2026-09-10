import type { PolicyDoc } from "@/types/universe";

interface RawDoc {
  id?: unknown;
  title?: unknown;
  content?: unknown;
}

/**
 * Derives a category from the document id's own naming convention
 * (`doc_<section>_<product>_<seq>`) instead of a hardcoded taxonomy — e.g.
 * "doc_checking_accounts_sparrow_reserve_001" -> "checking_accounts". If the id doesn't follow
 * that pattern, no category is assigned rather than guessing one.
 */
function deriveCategory(id: string): string | undefined {
  const withoutPrefix = id.startsWith("doc_") ? id.slice(4) : id;
  const tokens = withoutPrefix.split("_").filter(Boolean);
  // Drop a trailing purely-numeric sequence token, e.g. "..._001".
  if (tokens.length > 1 && /^\d+$/.test(tokens[tokens.length - 1])) {
    tokens.pop();
  }
  if (tokens.length < 2) return undefined;
  return `${tokens[0]}_${tokens[1]}`;
}

export function normalizePolicies(rawDocs: unknown[]): PolicyDoc[] {
  const docs: PolicyDoc[] = [];
  for (const entry of rawDocs) {
    const raw = entry as RawDoc;
    if (typeof raw.id !== "string" || typeof raw.content !== "string") continue;
    const title = typeof raw.title === "string" && raw.title.trim() ? raw.title : raw.id;
    docs.push({
      id: raw.id,
      title,
      content: raw.content,
      category: deriveCategory(raw.id),
      searchText: `${title} ${raw.content}`.toLowerCase(),
    });
  }
  return docs.sort((a, b) => a.title.localeCompare(b.title));
}

export function policyCategories(policies: PolicyDoc[]): string[] {
  const set = new Set<string>();
  for (const doc of policies) if (doc.category) set.add(doc.category);
  return Array.from(set).sort();
}
