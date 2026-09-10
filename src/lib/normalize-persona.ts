import type { JsonValue, PersonaRecord, UniverseRecord } from "@/types/universe";

/** Shape of domain/db.json: { [tableName]: { data: { [recordId]: record }, notes?: string } }.
 *  We don't assume which tables exist or what their fields are called beyond the generic
 *  "*_id" foreign-key convention used consistently across the dataset. */
type RawDb = Record<string, { data?: Record<string, UniverseRecord>; notes?: unknown }>;

const USERS_TABLE_CANDIDATES = ["users", "customers", "personas"];

function isPlainRecord(value: unknown): value is UniverseRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scalarSearchText(record: UniverseRecord): string {
  const parts: string[] = [];
  for (const value of Object.values(record)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      parts.push(String(value));
    }
  }
  return parts.join(" ").toLowerCase();
}

function pickDisplayName(record: UniverseRecord, fallbackId: string): string {
  const nameLike = ["name", "full_name", "display_name", "customer_name"];
  for (const key of nameLike) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallbackId;
}

/**
 * Builds an id -> owning table index across every table in the DB, then resolves each
 * non-user record to the persona it belongs to by walking "*_id" fields: a field is followed
 * if its value is itself a known record id in some table, recursing (bounded) until a users-table
 * id is reached. This avoids hardcoding which field names ("user_id" vs "referrer_id" vs
 * "account_id" -> account -> user, etc.) link which tables — it's derived from the live data.
 */
export function normalizePersonas(rawDb: unknown): PersonaRecord[] {
  if (!isPlainRecord(rawDb)) return [];
  const db = rawDb as unknown as RawDb;

  const usersTableName = Object.keys(db).find((name) =>
    USERS_TABLE_CANDIDATES.includes(name.toLowerCase()),
  );
  if (!usersTableName || !isPlainRecord(db[usersTableName]?.data)) return [];

  const usersData = db[usersTableName]!.data as Record<string, UniverseRecord>;

  // id -> table name, across ALL tables (including users), for FK resolution.
  const idOwner = new Map<string, string>();
  for (const [tableName, table] of Object.entries(db)) {
    if (!isPlainRecord(table?.data)) continue;
    for (const id of Object.keys(table.data)) {
      idOwner.set(id, tableName);
    }
  }

  const personaByUserId = new Map<string, PersonaRecord>();
  for (const [userId, record] of Object.entries(usersData)) {
    personaByUserId.set(userId, {
      id: userId,
      displayName: pickDisplayName(record, userId),
      raw: record,
      related: {},
      searchText: scalarSearchText(record),
    });
  }

  const MAX_HOPS = 4;

  function resolveOwningUser(record: UniverseRecord, depth: number): string | undefined {
    if (depth > MAX_HOPS) return undefined;
    for (const [key, value] of Object.entries(record)) {
      if (!key.toLowerCase().endsWith("_id") || typeof value !== "string") continue;
      const owner = idOwner.get(value);
      if (!owner) continue;
      if (owner === usersTableName) return value;
      const ownerTable = db[owner]?.data;
      const ownerRecord = ownerTable?.[value];
      if (ownerRecord) {
        const resolved = resolveOwningUser(ownerRecord, depth + 1);
        if (resolved) return resolved;
      }
    }
    return undefined;
  }

  for (const [tableName, table] of Object.entries(db)) {
    if (tableName === usersTableName || !isPlainRecord(table?.data)) continue;
    for (const record of Object.values(table.data)) {
      const ownerId = resolveOwningUser(record, 0);
      if (!ownerId) continue;
      const persona = personaByUserId.get(ownerId);
      if (!persona) continue;
      (persona.related[tableName] ??= []).push(record);
    }
  }

  return Array.from(personaByUserId.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
}

export function personaSearchFields(personas: PersonaRecord[]): string[] {
  const fields = new Set<string>();
  for (const persona of personas) {
    for (const key of Object.keys(persona.raw)) {
      const value: JsonValue = persona.raw[key];
      if (typeof value === "string" || typeof value === "number") fields.add(key);
    }
  }
  return Array.from(fields);
}
