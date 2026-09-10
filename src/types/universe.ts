/** Generic JSON value — the universe schema is not fixed, so records stay loosely typed
 *  and viewers derive fields at runtime instead of assuming a hardcoded shape. */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type UniverseRecord = Record<string, JsonValue>;

export interface PersonaRecord {
  id: string;
  displayName: string;
  raw: UniverseRecord;
  /** Every other table's records that resolve (directly or transitively) to this persona,
   *  keyed by the source table name. Populated purely from FK-shaped fields in the live data. */
  related: Record<string, UniverseRecord[]>;
  /** Lowercased blob of the persona's own scalar fields, for fast substring search. */
  searchText: string;
}

export interface PolicyDoc {
  id: string;
  title: string;
  content: string;
  /** Derived from the document id's naming convention, not a hardcoded taxonomy. Absent if it
   *  can't be derived. */
  category?: string;
  searchText: string;
}

export type ToolOwnership = "agent" | "user" | "unspecified";
export type ToolAvailability = "always-available" | "discoverable" | "unspecified";
export type ToolStatus = "core" | "rich-sku-only" | "phantom" | "unspecified";

export interface ToolRecord {
  name: string;
  ownership: ToolOwnership;
  availability: ToolAvailability;
  status: ToolStatus;
  /** Free-text notes lifted verbatim from the source metadata (e.g. behavior deltas). */
  notes?: string;
  /** Where this classification came from, so the UI can show its provenance. */
  source: string;
  /** IDs of policy documents whose content mentions this tool name. Computed at runtime. */
  relatedDocIds: string[];
}

export interface UniverseMeta {
  fetchedAt: string;
  etag: string | null;
  sourceUrl: string;
  counts: {
    personas: number;
    policies: number;
    /** CORE tool surface only (TOOL_RENAME_MAP.md §§ 1-3). */
    tools: number;
    /** Explicitly non-core: doc-only phantoms (§4) and RICH-SKU-only tools (§5). */
    nonCoreTools: number;
  };
}

export interface Universe {
  meta: UniverseMeta;
  personas: PersonaRecord[];
  policies: PolicyDoc[];
  /** The CORE tool surface — what's actually deployed/available. */
  tools: ToolRecord[];
  /** Tools TOOL_RENAME_MAP.md explicitly marks as not part of the core deployment (doc-only
   *  phantoms, RICH-SKU-only). Kept separate so they never inflate core counts/filters. */
  nonCoreTools: ToolRecord[];
  /** Known, explicit gaps in the source metadata (e.g. an aggregate-only count with no
   *  per-tool breakdown) — surfaced instead of silently guessed around. */
  toolMetadataGaps: string[];
}

export type LoadStatus = "idle" | "loading" | "ready" | "stale" | "error";
