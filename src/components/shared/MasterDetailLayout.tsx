import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * Shared responsive list+detail split used by all three viewers. Below `md`, only one pane is
 * visible at a time (list when nothing is selected, detail once something is) instead of
 * squeezing both side by side — each detail view pairs this with a `BackButton` to return to
 * the list.
 */
export function MasterDetailLayout({
  hasSelection,
  list,
  detail,
}: {
  hasSelection: boolean;
  list: ReactNode;
  detail: ReactNode;
}) {
  return (
    <div className="flex h-full">
      <div
        className={cn(
          "flex w-full shrink-0 flex-col border-r md:max-w-sm",
          hasSelection && "hidden md:flex",
        )}
      >
        {list}
      </div>
      <div className={cn("min-w-0 flex-1", !hasSelection && "hidden md:block")}>{detail}</div>
    </div>
  );
}
