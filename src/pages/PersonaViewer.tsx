import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PersonaDetail } from "@/components/persona/PersonaDetail";
import { PersonaList } from "@/components/persona/PersonaList";
import { SearchBar } from "@/components/search/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { UniverseGate } from "@/components/shared/UniverseGate";
import { useUniverse } from "@/hooks/useUniverse";
import { usePagedList } from "@/lib/pagination";
import { matchesQuery, useDebouncedValue } from "@/lib/search";

function PersonaViewerContent() {
  const { universe } = useUniverse();
  const { personaId } = useParams();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const personas = universe?.personas ?? [];

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return personas;
    return personas.filter((p) => matchesQuery(p.searchText, debouncedQuery));
  }, [personas, debouncedQuery]);

  const { page, setPage, totalPages, pageItems } = usePagedList(filtered, 20);

  const selected = personaId ? personas.find((p) => p.id === personaId) : undefined;

  return (
    <div className="flex h-full">
      <div className="flex w-full max-w-sm shrink-0 flex-col border-r">
        <div className="border-b p-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by name, email, or user ID…"
            resultCount={filtered.length}
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {pageItems.length > 0 ? (
            <PersonaList personas={pageItems} />
          ) : (
            <EmptyState icon={Users} title="No matching personas" description="Try a different name, email, or ID." />
          )}
        </div>
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      <div className="min-w-0 flex-1">
        {selected ? (
          <PersonaDetail persona={selected} />
        ) : (
          <EmptyState
            icon={Users}
            title="Select a persona"
            description="Search and pick a customer to see their accounts, cards, transactions, and more."
          />
        )}
      </div>
    </div>
  );
}

export function PersonaViewer() {
  return (
    <UniverseGate>
      <PersonaViewerContent />
    </UniverseGate>
  );
}
