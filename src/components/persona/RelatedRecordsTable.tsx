import { CopyButton } from "@/components/shared/CopyButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UniverseRecord } from "@/types/universe";

function humanizeKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const MAX_COLUMNS = 7;

/** Renders an arbitrary list of related records as a compact table. Columns are derived from
 *  whichever scalar fields are actually present on the records — nothing about the schema is
 *  assumed ahead of time. */
export function RelatedRecordsTable({ records }: { records: UniverseRecord[] }) {
  if (records.length === 0) return null;

  const columns: string[] = [];
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (columns.includes(key)) continue;
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        columns.push(key);
      }
    }
    if (columns.length >= MAX_COLUMNS) break;
  }
  const visibleColumns = columns.slice(0, MAX_COLUMNS);
  const idColumn = visibleColumns.find((c) => c.toLowerCase().endsWith("_id"));

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((col) => (
              <TableHead key={col} className="whitespace-nowrap text-xs">
                {humanizeKey(col)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, i) => (
            <TableRow key={(record[idColumn ?? ""] as string) ?? i}>
              {visibleColumns.map((col) => (
                <TableCell key={col} className="whitespace-nowrap text-xs">
                  <span className="inline-flex items-center gap-1">
                    {formatValue(record[col])}
                    {col === idColumn && typeof record[col] === "string" && (
                      <CopyButton value={record[col] as string} label="Copy ID" />
                    )}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
