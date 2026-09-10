import { NavLink } from "react-router-dom";
import { cn } from "cn";
import type { PolicyDoc } from "@/types/universe";

export function PolicyList({ docs }: { docs: PolicyDoc[] }) {
  return (
    <div className="flex flex-col">
      {docs.map((doc) => (
        <NavLink
          key={doc.id}
          to={`/policies/${encodeURIComponent(doc.id)}`}
          className={({ isActive }) =>
            cn(
              "flex items-center justify-between gap-2 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0",
              isActive ? "bg-accent" : "hover:bg-accent/60",
            )
          }
        >
          <span className="truncate font-medium leading-tight">{doc.title}</span>
          {doc.category && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {doc.category.replace(/_/g, " ")}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  );
}
