import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { CopyButton } from "@/components/shared/CopyButton";
import { highlightSegments } from "@/lib/search";
import type { PolicyDoc, ToolRecord } from "@/types/universe";

function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = highlightSegments(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.match ? (
          <mark key={i} className="search-highlight">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

export function PolicyReader({
  doc,
  query,
  relatedTools,
}: {
  doc: PolicyDoc;
  query: string;
  relatedTools: ToolRecord[];
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b bg-background/95 px-6 py-3 backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight">{doc.title}</h1>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <code className="rounded bg-muted px-1.5 py-0.5">{doc.id}</code>
            <CopyButton value={doc.id} label="Copy document ID" />
          </div>
        </div>
        {doc.category && (
          <span className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">
            {doc.category.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <div className="mx-auto max-w-2xl px-6 py-6">
        {relatedTools.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-md border bg-muted/30 p-2.5 text-xs">
            <Wrench className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Referenced by:</span>
            {relatedTools.map((tool) => (
              <Link
                key={tool.name}
                to={`/tools/${encodeURIComponent(tool.name)}`}
                className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px] hover:underline"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          <HighlightedText text={doc.content} query={query} />
        </div>
      </div>
    </div>
  );
}
