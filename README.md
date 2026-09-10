# Money Heist Contributor Viewers

Three contributor-facing viewers over the live banking universe:

- **`/persona`** — search customers and inspect their related banking state (accounts, cards,
  transactions, disputes, referrals, etc.)
- **`/policies`** — full-text search and read the Banking knowledge base documents
- **`/tools`** — browse agent/user tool metadata (ownership, availability, notes, linked policies)

## No hardcoded universe data

Every customer, account, policy document, and tool shown in the app is fetched **at runtime**
from the universe archive configured by `VITE_UNIVERSE_URL` (see `.env`). Nothing about the
underlying dataset — names, IDs, balances, policy text, tool names — is baked into the frontend
bundle. If the archive at that URL is replaced, reopening/refreshing the app picks up the new
data with no rebuild.

- Persona data is derived from `domain/db.json` inside the archive, with relationships between
  tables resolved generically via `*_id` foreign-key matching (see `src/lib/normalize-persona.ts`)
  — not a hardcoded list of record IDs.
- Policy documents come from `domain/documents/*.json`.
- Tool metadata (ownership, availability, behavior notes) is parsed from `TOOL_RENAME_MAP.md`,
  the one structured tool-metadata source present inside the archive. Where the archive doesn't
  specify a field (e.g. structured arguments/prerequisites), the UI says so explicitly instead of
  inventing it.

The archive is fetched once, selectively unzipped (`fflate`, skipping irrelevant entries),
normalized, and cached in IndexedDB — shared across all three routes. A visible "Refresh
universe" control forces a re-fetch; a background check using CORS-safelisted headers
(`Last-Modified`/`Content-Length` — this host doesn't expose `ETag` cross-origin) flags when a
newer archive is likely available.

## Development

```bash
npm install
npm run dev
```

Configure the source archive via `.env`:

```
VITE_UNIVERSE_URL=https://static.remotasks.com/uploads/6a96fa0eeb622ed112e30794/universe.zip
```

## Build

```bash
npm run build
```

Static output in `dist/`, deployable to Vercel with no backend (`vercel.json` adds the SPA
rewrite needed for client-side routes like `/persona/:id`).
