import { NavLink } from "react-router-dom";
import { cn } from "cn";
import { AvailabilityBadge, OwnershipBadge } from "@/components/tools/ToolBadges";
import type { ToolRecord } from "@/types/universe";

export function ToolList({ tools }: { tools: ToolRecord[] }) {
  return (
    <div className="flex flex-col">
      {tools.map((tool) => (
        <NavLink
          key={tool.name}
          to={`/tools/${encodeURIComponent(tool.name)}`}
          className={({ isActive }) =>
            cn(
              "flex flex-col gap-1 border-b px-3 py-2.5 text-sm transition-colors last:border-b-0",
              isActive ? "bg-accent" : "hover:bg-accent/60",
            )
          }
        >
          <span className="truncate font-mono text-xs font-medium">{tool.name}</span>
          <span className="flex flex-wrap gap-1">
            <OwnershipBadge value={tool.ownership} />
            <AvailabilityBadge value={tool.availability} />
          </span>
        </NavLink>
      ))}
    </div>
  );
}
