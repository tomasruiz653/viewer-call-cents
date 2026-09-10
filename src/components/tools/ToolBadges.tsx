import { Badge } from "@/components/ui/badge";
import type { ToolAvailability, ToolOwnership, ToolStatus } from "@/types/universe";

const OWNERSHIP_LABEL: Record<ToolOwnership, string> = {
  agent: "Agent",
  user: "User",
  unspecified: "Ownership not specified",
};

const AVAILABILITY_LABEL: Record<ToolAvailability, string> = {
  "always-available": "Always available",
  discoverable: "Discoverable",
  unspecified: "Availability not specified",
};

const STATUS_VARIANT: Record<ToolStatus, string> = {
  core: "border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
  "rich-sku-only": "border-purple-500/40 text-purple-700 dark:text-purple-400",
  phantom: "border-amber-500/40 text-amber-700 dark:text-amber-400",
  unspecified: "",
};

export function OwnershipBadge({ value }: { value: ToolOwnership }) {
  return (
    <Badge variant={value === "unspecified" ? "outline" : "secondary"} className="text-[11px]">
      {OWNERSHIP_LABEL[value]}
    </Badge>
  );
}

export function AvailabilityBadge({ value }: { value: ToolAvailability }) {
  return (
    <Badge variant={value === "unspecified" ? "outline" : "secondary"} className="text-[11px]">
      {AVAILABILITY_LABEL[value]}
    </Badge>
  );
}

export function StatusBadge({ value }: { value: ToolStatus }) {
  if (value === "unspecified") return null;
  const labels: Record<ToolStatus, string> = {
    core: "Core",
    "rich-sku-only": "Rich SKU only",
    phantom: "Phantom (doc-only)",
    unspecified: "",
  };
  return (
    <Badge variant="outline" className={`text-[11px] ${STATUS_VARIANT[value]}`}>
      {labels[value]}
    </Badge>
  );
}
