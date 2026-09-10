import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({
  value,
  onChange,
  placeholder,
  resultCount,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  resultCount?: number;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-8 pr-8"
        />
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 size-6 -translate-y-1/2"
            onClick={() => onChange("")}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      {resultCount !== undefined && (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </span>
      )}
    </div>
  );
}
