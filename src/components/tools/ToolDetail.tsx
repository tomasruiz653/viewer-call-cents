import { FileText, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { AvailabilityBadge, OwnershipBadge, StatusBadge } from "@/components/tools/ToolBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/CopyButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PolicyDoc, ToolRecord } from "@/types/universe";

export function ToolDetail({
  tool,
  relatedDocs,
}: {
  tool: ToolRecord;
  relatedDocs: PolicyDoc[];
}) {
  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-mono text-lg font-semibold tracking-tight">{tool.name}</h1>
            <CopyButton value={tool.name} label="Copy tool name" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <OwnershipBadge value={tool.ownership} />
            <AvailabilityBadge value={tool.availability} />
            <StatusBadge value={tool.status} />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Behavior & notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {tool.notes ? (
              <p className="leading-relaxed">{tool.notes}</p>
            ) : (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Info className="size-3.5" />
                No behavior notes available from the current universe metadata.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Arguments and structured prerequisites are not present as machine-readable metadata
              in the current universe. Consult the linked policy documents below, where available.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Related policy documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relatedDocs.length > 0 ? (
              <ul className="space-y-1.5">
                {relatedDocs.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      to={`/policies/${encodeURIComponent(doc.id)}`}
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <FileText className="size-3.5 shrink-0" />
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No policy document in the current knowledge base mentions this tool name.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground">Source: {tool.source}</div>
      </div>
    </ScrollArea>
  );
}
