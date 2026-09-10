import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/shared/BackButton";
import { CopyButton } from "@/components/shared/CopyButton";
import { RelatedRecordsTable } from "@/components/persona/RelatedRecordsTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PersonaRecord } from "@/types/universe";

function humanizeTable(name: string): string {
  return name
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function PersonaDetail({ persona }: { persona: PersonaRecord }) {
  const relatedTables = Object.entries(persona.related).filter(([, records]) => records.length > 0);

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <BackButton to="/persona" label="Back to personas" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{persona.displayName}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{persona.id}</code>
              <CopyButton value={persona.id} label="Copy user ID" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {Object.entries(persona.raw).map(([key, value]) => {
                if (typeof value === "object" && value !== null) return null;
                return (
                  <div key={key} className="flex items-center justify-between gap-2 border-b py-1 text-sm last:border-b-0">
                    <dt className="text-muted-foreground">{humanizeTable(key)}</dt>
                    <dd className="flex items-center gap-1 truncate font-medium">
                      {String(value ?? "—")}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>

        {relatedTables.length > 0 ? (
          <Tabs defaultValue={relatedTables[0][0]}>
            <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
              {relatedTables.map(([table, records]) => (
                <TabsTrigger key={table} value={table} className="text-xs">
                  {humanizeTable(table)}
                  <span className="ml-1 text-muted-foreground">{records.length}</span>
                </TabsTrigger>
              ))}
              <TabsTrigger value="__raw" className="text-xs">
                Raw
              </TabsTrigger>
            </TabsList>
            {relatedTables.map(([table, records]) => (
              <TabsContent key={table} value={table} className="mt-3">
                <RelatedRecordsTable records={records} />
              </TabsContent>
            ))}
            <TabsContent value="__raw" className="mt-3">
              <pre className="max-h-[480px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
                {JSON.stringify({ profile: persona.raw, related: persona.related }, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No related records found for this persona in the current universe.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
