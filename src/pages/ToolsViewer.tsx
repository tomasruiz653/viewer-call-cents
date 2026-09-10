import { Info, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { SearchBar } from "@/components/search/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { MasterDetailLayout } from "@/components/shared/MasterDetailLayout";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { UniverseGate } from "@/components/shared/UniverseGate";
import { ToolDetail } from "@/components/tools/ToolDetail";
import { ToolList } from "@/components/tools/ToolList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUniverse } from "@/hooks/useUniverse";
import { usePagedList } from "@/lib/pagination";
import { useDebouncedValue } from "@/lib/search";

const OWNERSHIP_OPTIONS = [
  { value: "all", label: "All ownership" },
  { value: "agent", label: "Agent" },
  { value: "user", label: "User" },
  { value: "unspecified", label: "Unspecified" },
];

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All availability" },
  { value: "always-available", label: "Always available" },
  { value: "discoverable", label: "Discoverable" },
  { value: "unspecified", label: "Unspecified" },
];

function ToolsViewerContent() {
  const { universe } = useUniverse();
  const { toolName } = useParams();
  const [query, setQuery] = useState("");
  const [ownership, setOwnership] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [includeNonCore, setIncludeNonCore] = useState(false);
  const debouncedQuery = useDebouncedValue(query);

  const coreTools = universe?.tools ?? [];
  const nonCoreTools = universe?.nonCoreTools ?? [];
  const gaps = universe?.toolMetadataGaps ?? [];
  const policies = universe?.policies ?? [];

  const tools = useMemo(
    () => (includeNonCore ? [...coreTools, ...nonCoreTools] : coreTools),
    [coreTools, nonCoreTools, includeNonCore],
  );

  const filtered = useMemo(() => {
    return tools.filter((tool) => {
      if (ownership !== "all" && tool.ownership !== ownership) return false;
      if (availability !== "all" && tool.availability !== availability) return false;
      if (!debouncedQuery.trim()) return true;
      const haystack = `${tool.name} ${tool.notes ?? ""}`.toLowerCase();
      return haystack.includes(debouncedQuery.toLowerCase());
    });
  }, [tools, ownership, availability, debouncedQuery]);

  const { page, setPage, totalPages, pageItems } = usePagedList(filtered, 20);

  // Look up the selected tool across core + non-core regardless of the toggle, so a direct
  // link (e.g. from a Policies cross-reference) always resolves.
  const selected = toolName
    ? [...coreTools, ...nonCoreTools].find((t) => t.name === toolName)
    : undefined;
  const relatedDocs = selected
    ? policies.filter((doc) => selected.relatedDocIds.includes(doc.id))
    : [];

  return (
    <MasterDetailLayout
      hasSelection={!!selected}
      list={
        <>
          <div className="space-y-2 border-b p-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search tool names & notes…"
              resultCount={filtered.length}
              autoFocus
            />
            <div className="flex gap-2">
              <Select value={ownership} onValueChange={setOwnership}>
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OWNERSHIP_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-3.5 accent-primary"
                checked={includeNonCore}
                onChange={(e) => setIncludeNonCore(e.target.checked)}
              />
              Include non-core ({nonCoreTools.length} doc-only / RICH-SKU-only)
            </label>
          </div>
          {gaps.length > 0 && (
            <div className="flex items-start gap-2 border-b bg-amber-500/10 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>{gaps[0]}</span>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {pageItems.length > 0 ? (
              <ToolList tools={pageItems} />
            ) : (
              <EmptyState icon={Wrench} title="No matching tools" description="Adjust your search or filters." />
            )}
          </div>
          <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      }
      detail={
        selected ? (
          <ToolDetail tool={selected} relatedDocs={relatedDocs} />
        ) : (
          <EmptyState
            icon={Wrench}
            title="Select a tool"
            description="Browse agent/user tools discovered from the current universe metadata."
          />
        )
      }
    />
  );
}

export function ToolsViewer() {
  return (
    <UniverseGate>
      <ToolsViewerContent />
    </UniverseGate>
  );
}
