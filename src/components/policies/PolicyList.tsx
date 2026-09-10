import { NavLink } from "react-router-dom";
import { cn } from "cn";
import { excerptAround } from "@/lib/search";
import type { PolicyDoc } from "@/types/universe";

export function PolicyList({ docs, query }: { docs: PolicyDoc[]; query: string }) {
  return (
    <div className="flex flex-col">
      {docs.map((doc) => (
        <NavLink
          key={doc.id}
          to={`/policies/${encodeURIComponent(doc.id)}`}
          className={({ isActive }) =>
            cn(
              "flex flex-col gap-0.5 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0",
              isActive ? "bg-accent" : "hover:bg-accent/60",
            )
          }
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium leading-tight">{doc.title}</span>
            {doc.category && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {doc.category.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <span className="truncate text-xs text-muted-foreground">
            {excerptAround(doc.content, query, 50)}
          </span>
        </NavLink>
      ))}
    </div>
  );
}
