import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductDetail } from "@/components/products/ProductDetail";
import { ProductList } from "@/components/products/ProductList";
import { SearchBar } from "@/components/search/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { MasterDetailLayout } from "@/components/shared/MasterDetailLayout";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { UniverseGate } from "@/components/shared/UniverseGate";
import { useUniverse } from "@/hooks/useUniverse";
import { usePagedList } from "@/lib/pagination";
import { matchesQuery, useDebouncedValue } from "@/lib/search";

function ProductsViewerContent() {
  const { universe } = useUniverse();
  const { productKey } = useParams();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const products = universe?.products ?? [];
  const policies = universe?.policies ?? [];

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return products;
    return products.filter((p) => matchesQuery(p.searchText, debouncedQuery));
  }, [products, debouncedQuery]);

  const { page, setPage, totalPages, pageItems } = usePagedList(filtered, 20);

  const selected = productKey ? products.find((p) => p.key === productKey) : undefined;
  const selectedDocs = selected
    ? selected.docIds
        .map((id) => policies.find((d) => d.id === id))
        .filter((d): d is NonNullable<typeof d> => !!d)
    : [];

  return (
    <MasterDetailLayout
      hasSelection={!!selected}
      list={
        <>
          <div className="border-b p-3">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search products…"
              resultCount={filtered.length}
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {pageItems.length > 0 ? (
              <ProductList products={pageItems} />
            ) : (
              <EmptyState icon={Package} title="No matching products" description="Try a different name." />
            )}
          </div>
          <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      }
      detail={
        selected ? (
          <ProductDetail product={selected} docs={selectedDocs} />
        ) : (
          <EmptyState
            icon={Package}
            title="Select a product"
            description="Search a product name (e.g. a card or account) to see everything the knowledge base says about it."
          />
        )
      }
    />
  );
}

export function ProductsViewer() {
  return (
    <UniverseGate>
      <ProductsViewerContent />
    </UniverseGate>
  );
}
