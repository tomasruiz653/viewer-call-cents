import type { PolicyDoc, ProductGroup } from "@/types/universe";

/** Doc ids follow `doc_<product-slug>_<seq>`; this strips both, leaving a slug that's identical
 *  across every document that belongs to the same product (e.g. every
 *  `doc_buy_now_pay_later_splitwing_apex_0NN` shares `buy_now_pay_later_splitwing_apex`). No
 *  category/product taxonomy is assumed — this is purely a structural id convention. */
function productKey(docId: string): string {
  const withoutPrefix = docId.startsWith("doc_") ? docId.slice(4) : docId;
  return withoutPrefix.replace(/_\d+$/, "");
}

function humanize(slug: string): string {
  return slug
    .split("_")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

const GENERIC_TITLE_PREFIXES = new Set(["faq", "internal", "note"]);

/**
 * Documents about the same product overwhelmingly share a "Product Name: ..." title prefix
 * (verified against the live corpus: ~90% of product groups have one). This picks the most
 * common such prefix per group as the product's display name — derived from the data itself,
 * not a hardcoded product catalog — and falls back to humanizing the id slug for the remaining
 * groups where no title follows that convention.
 */
function deriveProductName(slug: string, titles: string[]): string {
  const counts = new Map<string, number>();
  for (const title of titles) {
    const idx = title.indexOf(":");
    if (idx === -1 || idx > 60) continue;
    const prefix = title.slice(0, idx).trim();
    if (!prefix || GENERIC_TITLE_PREFIXES.has(prefix.toLowerCase())) continue;
    counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [prefix, count] of counts) {
    if (count > bestCount) {
      best = prefix;
      bestCount = count;
    }
  }
  return best ?? humanize(slug);
}

export function deriveProducts(policies: PolicyDoc[]): ProductGroup[] {
  const byKey = new Map<string, PolicyDoc[]>();
  for (const doc of policies) {
    const key = productKey(doc.id);
    const list = byKey.get(key) ?? [];
    list.push(doc);
    byKey.set(key, list);
  }

  const products: ProductGroup[] = [];
  for (const [key, docs] of byKey) {
    const name = deriveProductName(
      key,
      docs.map((d) => d.title),
    );
    products.push({
      key,
      name,
      docIds: docs.map((d) => d.id),
      searchText: `${name} ${docs.map((d) => d.title).join(" ")}`.toLowerCase(),
    });
  }

  return products.sort((a, b) => a.name.localeCompare(b.name));
}
