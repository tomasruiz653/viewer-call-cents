import { highlightSegments } from "@/lib/search";

/**
 * A rehype plugin (for react-markdown's `rehypePlugins`) that wraps every case-insensitive match
 * of `query` in the rendered markdown's text nodes with a <mark>, so search highlighting keeps
 * working on top of fully rendered markdown instead of only on raw/pre-wrapped text.
 *
 * Deliberately untyped against `hast`'s own node types: react-markdown's pipeline can emit
 * Raw/Doctype/Comment node variants that don't line up 1:1 across versions of those types, and
 * this plugin only ever touches two shapes ("text" nodes and anything with a `children` array),
 * so a structural `any` walk is both simpler and more robust than fighting that union.
 */
export function rehypeHighlightQuery(options: { query?: string } = {}) {
  return (tree: unknown) => {
    const query = options.query?.trim();
    if (!query) return;
    walk(tree, query);
  };
}

function highlightTextNode(node: { type: "text"; value: string }, query: string): unknown[] {
  const segments = highlightSegments(node.value, query);
  if (segments.length === 1 && !segments[0].match) return [node];
  return segments.map((seg) =>
    seg.match
      ? {
          type: "element",
          tagName: "mark",
          properties: { className: ["search-highlight"] },
          children: [{ type: "text", value: seg.text }],
        }
      : { type: "text", value: seg.text },
  );
}

function walk(node: any, query: string) {
  if (!node || !Array.isArray(node.children)) return;
  const nextChildren: unknown[] = [];
  for (const child of node.children) {
    if (child?.type === "text") {
      nextChildren.push(...highlightTextNode(child, query));
    } else {
      walk(child, query);
      nextChildren.push(child);
    }
  }
  node.children = nextChildren;
}
