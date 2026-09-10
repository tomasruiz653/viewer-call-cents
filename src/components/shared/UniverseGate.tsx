import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUniverse } from "@/hooks/useUniverse";

/**
 * Gates a viewer page on the shared runtime universe. Never falls back to bundled sample data:
 * loading shows a skeleton, failure shows an explicit error with retry.
 */
export function UniverseGate({ children }: { children: ReactNode }) {
  const { status, error, refresh } = useUniverse();

  if (status === "loading" || status === "idle") {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertTriangle className="size-8 text-destructive" />
        <div className="text-sm font-medium">Could not load the runtime universe</div>
        <div className="max-w-md text-xs text-muted-foreground">{error}</div>
        <Button size="sm" onClick={refresh}>
          Try again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
