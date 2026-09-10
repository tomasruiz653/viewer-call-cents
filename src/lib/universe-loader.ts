import { unzip } from "fflate";
import { normalizePersonas } from "@/lib/normalize-persona";
import { normalizePolicies } from "@/lib/normalize-policies";
import { linkToolsToDocs, normalizeTools } from "@/lib/normalize-tools";
import {
  type CachedUniverse,
  readCachedUniverse,
  writeCachedUniverse,
} from "@/lib/universe-cache";
import type { Universe } from "@/types/universe";

export const UNIVERSE_URL =
  import.meta.env.VITE_UNIVERSE_URL ??
  "https://static.remotasks.com/uploads/6a96fa0eeb622ed112e30794/universe.zip";

const decoder = new TextDecoder("utf-8");

/** Only these entries are ever inflated — everything else in the archive (audit HTML reports,
 *  qc/ artifacts, patch files, etc.) is skipped by fflate's filter before decompression even runs. */
function isRelevantEntry(name: string): boolean {
  return (
    /(^|\/)domain\/db\.json$/.test(name) ||
    /(^|\/)domain\/documents\/.+\.json$/.test(name) ||
    /(^|\/)TOOL_RENAME_MAP\.md$/.test(name)
  );
}

function unzipSelective(buffer: Uint8Array): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    unzip(buffer, { filter: (file) => isRelevantEntry(file.name) }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export interface FreshnessSignal {
  lastModified: string | null;
  contentLength: string | null;
}

/**
 * Reads the CORS-safelisted response headers only. ETag is NOT exposed cross-origin by this
 * host (no Access-Control-Expose-Headers), verified against the live endpoint — so freshness
 * detection falls back to Last-Modified / Content-Length, both of which are safelisted and do
 * come through.
 */
export async function fetchFreshnessSignal(url: string = UNIVERSE_URL): Promise<FreshnessSignal> {
  const res = await fetch(url, { method: "HEAD" });
  if (!res.ok) throw new Error(`Universe HEAD request failed: ${res.status}`);
  return {
    lastModified: res.headers.get("last-modified"),
    contentLength: res.headers.get("content-length"),
  };
}

function buildUniverse(files: Record<string, Uint8Array>, sourceUrl: string): Universe {
  const dbEntry = Object.entries(files).find(([name]) => /domain\/db\.json$/.test(name));
  const toolsEntry = Object.entries(files).find(([name]) => /TOOL_RENAME_MAP\.md$/.test(name));
  const docEntries = Object.entries(files).filter(([name]) =>
    /domain\/documents\/.+\.json$/.test(name),
  );

  if (!dbEntry) {
    throw new Error("domain/db.json was not found inside the universe archive.");
  }

  const rawDb = JSON.parse(decoder.decode(dbEntry[1]));
  const rawDocs = docEntries.map(([, bytes]) => JSON.parse(decoder.decode(bytes)));

  const personas = normalizePersonas(rawDb);
  const policies = normalizePolicies(rawDocs);
  const parsedTools = toolsEntry
    ? normalizeTools(decoder.decode(toolsEntry[1]))
    : { core: [], nonCore: [], gaps: [] };
  const tools = linkToolsToDocs(parsedTools.core, policies);
  const nonCoreTools = linkToolsToDocs(parsedTools.nonCore, policies);

  return {
    meta: {
      fetchedAt: new Date().toISOString(),
      etag: null,
      sourceUrl,
      counts: {
        personas: personas.length,
        policies: policies.length,
        tools: tools.length,
        nonCoreTools: nonCoreTools.length,
      },
    },
    personas,
    policies,
    tools,
    nonCoreTools,
    toolMetadataGaps: parsedTools.gaps,
  };
}

/** Appends a one-off query param so the request is a distinct URL from the browser's HTTP
 *  cache's point of view. This is a client-side fetch option plus a URL change — no custom
 *  request header is added, so the request stays a CORS-simple GET (this host 403s any request
 *  that would need a preflight). It's a best-effort bust: whether the CDN edge itself also
 *  treats the query string as part of its cache key is outside our control (see universe
 *  architecture notes) — `cache: "no-store"` at least guarantees the *browser's own* cache is
 *  skipped. */
function withCacheBust(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_refresh=${Date.now()}`;
}

export async function fetchAndParseUniverse(
  url: string = UNIVERSE_URL,
  options: { bustCache?: boolean } = {},
): Promise<{
  universe: Universe;
  freshness: FreshnessSignal;
}> {
  const requestUrl = options.bustCache ? withCacheBust(url) : url;
  const res = await fetch(requestUrl, options.bustCache ? { cache: "no-store" } : undefined);
  if (!res.ok) {
    throw new Error(`Failed to fetch universe archive: ${res.status} ${res.statusText}`);
  }
  const freshness: FreshnessSignal = {
    lastModified: res.headers.get("last-modified"),
    contentLength: res.headers.get("content-length"),
  };
  const buffer = new Uint8Array(await res.arrayBuffer());
  const files = await unzipSelective(buffer);
  const universe = buildUniverse(files, url);
  return { universe, freshness };
}

export interface LoadResult {
  universe: Universe;
  fromCache: boolean;
  /** True when a cached universe was served and a background revalidation found it stale
   *  (the caller should treat the returned universe as provisional). */
  possiblyStale: boolean;
}

/**
 * Cache-first load: returns whatever is in IndexedDB immediately when present, then callers
 * are expected to also call `checkForUpdates` to decide whether to refetch. `force` always
 * bypasses the cache and re-downloads.
 */
export async function loadUniverse(options: { force?: boolean } = {}): Promise<LoadResult> {
  if (!options.force) {
    const cached = await readCachedUniverse();
    if (cached) {
      return { universe: cached.universe, fromCache: true, possiblyStale: false };
    }
  }
  // A forced (manual "Refresh universe") load must not silently hand back the same bytes the
  // browser's HTTP cache already has for this exact URL — bust it explicitly.
  const { universe, freshness } = await fetchAndParseUniverse(UNIVERSE_URL, {
    bustCache: options.force,
  });
  const entry: CachedUniverse = {
    universe,
    lastModified: freshness.lastModified,
    contentLength: freshness.contentLength,
  };
  await writeCachedUniverse(entry);
  return { universe, fromCache: false, possiblyStale: false };
}

export async function checkForUpdate(): Promise<boolean> {
  const cached = await readCachedUniverse();
  if (!cached) return true;
  try {
    const fresh = await fetchFreshnessSignal();
    if (fresh.lastModified && cached.lastModified) {
      return fresh.lastModified !== cached.lastModified;
    }
    if (fresh.contentLength && cached.contentLength) {
      return fresh.contentLength !== cached.contentLength;
    }
    // Neither signal is available/comparable — can't safely claim freshness either way.
    return false;
  } catch {
    return false;
  }
}
