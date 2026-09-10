import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

/** Visible only below `md`, where the list and detail panes aren't shown side by side. */
export function BackButton({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:hidden"
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}
