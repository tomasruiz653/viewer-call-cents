import { NavLink } from "react-router-dom";
import { cn } from "cn";
import type { PersonaRecord } from "@/types/universe";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function PersonaList({ personas }: { personas: PersonaRecord[] }) {
  return (
    <div className="flex flex-col">
      {personas.map((persona) => {
        const relatedCount = Object.values(persona.related).reduce((n, r) => n + r.length, 0);
        return (
          <NavLink
            key={persona.id}
            to={`/persona/${encodeURIComponent(persona.id)}`}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0",
                isActive ? "bg-accent" : "hover:bg-accent/60",
              )
            }
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials(persona.displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium leading-tight">{persona.displayName}</div>
              <div className="truncate text-xs text-muted-foreground">
                {typeof persona.raw.email === "string" ? persona.raw.email : persona.id}
              </div>
            </div>
            <div className="shrink-0 text-[11px] text-muted-foreground">{relatedCount} records</div>
          </NavLink>
        );
      })}
    </div>
  );
}
