import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rehypeHighlightQuery } from "@/lib/rehype-highlight-query";

/** Shared markdown renderer for policy document content — used by the full document reader and
 *  by the Products view's per-doc sections, so both get identical rendering + search highlight. */
export function MarkdownContent({ content, query }: { content: string; query: string }) {
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none
                 prose-headings:font-semibold prose-headings:tracking-tight
                 prose-table:text-xs prose-th:bg-muted/50"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlightQuery, { query }]]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
