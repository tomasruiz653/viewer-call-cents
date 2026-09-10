import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
      <Icon className="size-8 opacity-50" />
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description && <div className="max-w-sm text-xs">{description}</div>}
    </div>
  );
}
