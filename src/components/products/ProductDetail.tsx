import { ExternalLink, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { MarkdownContent } from "@/components/policies/MarkdownContent";
import { BackButton } from "@/components/shared/BackButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PolicyDoc, ProductGroup } from "@/types/universe";

export function ProductDetail({ product, docs }: { product: ProductGroup; docs: PolicyDoc[] }) {
  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <BackButton to="/products" label="Back to products" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything the knowledge base says about {product.name}, across {docs.length}{" "}
            {docs.length === 1 ? "document" : "documents"}.
          </p>
        </div>

        <div className="space-y-2">
          {docs.map((doc, i) => (
            <details key={doc.id} className="group rounded-md border" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium">
                <span className="flex items-center gap-2 truncate">
                  <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{doc.title}</span>
                </span>
                <Link
                  to={`/policies/${encodeURIComponent(doc.id)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                >
                  Open <ExternalLink className="size-3" />
                </Link>
              </summary>
              <div className="border-t px-3 py-3">
                <MarkdownContent content={doc.content} query="" />
              </div>
            </details>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
