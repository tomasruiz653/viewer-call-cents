import { NavLink } from "react-router-dom";
import { cn } from "cn";
import type { ProductGroup } from "@/types/universe";

export function ProductList({ products }: { products: ProductGroup[] }) {
  return (
    <div className="flex flex-col">
      {products.map((product) => (
        <NavLink
          key={product.key}
          to={`/products/${encodeURIComponent(product.key)}`}
          className={({ isActive }) =>
            cn(
              "flex items-center justify-between gap-2 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0",
              isActive ? "bg-accent" : "hover:bg-accent/60",
            )
          }
        >
          <span className="truncate font-medium leading-tight">{product.name}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {product.docIds.length} {product.docIds.length === 1 ? "doc" : "docs"}
          </span>
        </NavLink>
      ))}
    </div>
  );
}
