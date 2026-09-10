import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUniverse } from "@/hooks/useUniverse";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

export function UniverseStatusBar() {
  const { status, universe, error, updateAvailable, refresh } = useUniverse();

  return (
    <div className="flex items-center gap-3 text-sm">
      {status === "loading" && (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Loading universe…
        </span>
      )}

      {status === "error" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="size-3.5" />
              Failed to load
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{error}</TooltipContent>
        </Tooltip>
      )}

      {status === "ready" && universe && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-500" />
              Runtime universe · refreshed {relativeTime(universe.meta.fetchedAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            {universe.meta.counts.personas} personas · {universe.meta.counts.policies} policies ·{" "}
            {universe.meta.counts.tools} tools
            <br />
            Source: {universe.meta.sourceUrl}
          </TooltipContent>
        </Tooltip>
      )}

      {updateAvailable && (
        <span className="text-amber-600 dark:text-amber-500">A newer universe may be available</span>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={refresh}
        disabled={status === "loading"}
        className="h-7 gap-1.5"
      >
        <RefreshCw className={status === "loading" ? "size-3.5 animate-spin" : "size-3.5"} />
        Refresh universe
      </Button>
    </div>
  );
}
