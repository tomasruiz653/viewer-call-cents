import { FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PolicyList } from "@/components/policies/PolicyList";
import { PolicyReader } from "@/components/policies/PolicyReader";
import { SearchBar } from "@/components/search/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { MasterDetailLayout } from "@/components/shared/MasterDetailLayout";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { UniverseGate } from "@/components/shared/UniverseGate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUniverse } from "@/hooks/useUniverse";
import { policyCategories } from "@/lib/normalize-policies";
import { usePagedList } from "@/lib/pagination";
import { matchesQuery, useDebouncedValue } from "@/lib/search";

function PoliciesViewerContent() {
  const { universe } = useUniverse();
  const { docId } = useParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const debouncedQuery = useDebouncedValue(query);

  const docs = universe?.policies ?? [];
  const tools = universe?.tools ?? [];
  const categories = useMemo(() => policyCategories(docs), [docs]);

  const filtered = useMemo(() => {
    return docs.filter((doc) => {
      if (category !== "all" && doc.category !== category) return false;
      if (!debouncedQuery.trim()) return true;
      return matchesQuery(doc.searchText, debouncedQuery);
    });
  }, [docs, category, debouncedQuery]);

  const { page, setPage, totalPages, pageItems } = usePagedList(filtered, 20);

  const selected = docId ? docs.find((d) => d.id === docId) : undefined;
  const relatedTools = selected ? tools.filter((t) => t.relatedDocIds.includes(selected.id)) : [];

  return (
    <MasterDetailLayout
      hasSelection={!!selected}
      list={
        <>
          <div className="space-y-2 border-b p-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search titles & full text…"
              resultCount={filtered.length}
              autoFocus
            />
            {categories.length > 1 && (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {pageItems.length > 0 ? (
              <PolicyList docs={pageItems} />
            ) : (
              <EmptyState icon={FileText} title="No matching documents" description="Try a broader search term." />
            )}
          </div>
          <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      }
      detail={
        selected ? (
          <PolicyReader doc={selected} query={debouncedQuery} relatedTools={relatedTools} />
        ) : (
          <EmptyState
            icon={FileText}
            title="Select a document"
            description="Search the Banking knowledge base and pick a document to read."
          />
        )
      }
    />
  );
}

export function PoliciesViewer() {
  return (
    <UniverseGate>
      <PoliciesViewerContent />
    </UniverseGate>
  );
}
