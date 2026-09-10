import type {
  PolicyDoc,
  ToolAvailability,
  ToolOwnership,
  ToolRecord,
  ToolStatus,
} from "@/types/universe";

const BACKTICK_NAME = /`([a-zA-Z0-9_]+)`/g;

interface SectionRow {
  cells: string[];
}

/** Splits TOOL_RENAME_MAP.md into its numbered `## N. Title` sections. */
function splitSections(markdown: string): { title: string; body: string }[] {
  const lines = markdown.split("\n");
  const sections: { title: string; body: string[] }[] = [];
  let current: { title: string; body: string[] } | null = null;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      if (current) sections.push(current);
      current = { title: heading[1].trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.map((s) => ({ title: s.title, body: s.body.join("\n") }));
}

/** Parses a GitHub-flavored markdown table into rows of trimmed cell strings, skipping the
 *  header and separator rows. */
function parseTableRows(body: string): SectionRow[] {
  const rows: SectionRow[] = [];
  const lines = body.split("\n").filter((l) => l.trim().startsWith("|"));
  for (const line of lines.slice(2)) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length) rows.push({ cells });
  }
  return rows;
}

function extractBacktickNames(text: string): string[] {
  return Array.from(text.matchAll(BACKTICK_NAME)).map((m) => m[1]);
}

function pushTool(
  tools: Map<string, ToolRecord>,
  name: string,
  fields: Partial<ToolRecord>,
  source: string,
) {
  const existing = tools.get(name);
  const record: ToolRecord = {
    name,
    ownership: existing?.ownership ?? fields.ownership ?? "unspecified",
    availability: existing?.availability ?? fields.availability ?? "unspecified",
    status: existing?.status ?? fields.status ?? "unspecified",
    notes: fields.notes ?? existing?.notes,
    source: existing ? `${existing.source}; ${source}` : source,
    relatedDocIds: existing?.relatedDocIds ?? [],
  };
  tools.set(name, record);
}

/**
 * Parses TOOL_RENAME_MAP.md — the one structured, in-universe source of tool ownership /
 * availability metadata — instead of any hardcoded tool list. Section headings determine
 * ownership/availability/status; nothing here is a fixed enum of Vireo tool names.
 */
export function normalizeTools(markdown: string): ToolRecord[] {
  const tools = new Map<string, ToolRecord>();
  const sections = splitSections(markdown);

  for (const section of sections) {
    const num = section.title.match(/^(\d+)\./)?.[1];
    const source = `TOOL_RENAME_MAP.md § ${section.title}`;

    if (num === "1" || num === "2") {
      const ownership: ToolOwnership = num === "1" ? "agent" : "user";
      for (const row of parseTableRows(section.body)) {
        const vireoName = extractBacktickNames(row.cells[1] ?? "")[0];
        if (!vireoName) continue;
        const note = row.cells[2]?.trim();
        pushTool(
          tools,
          vireoName,
          {
            ownership,
            availability: "discoverable",
            status: "core",
            notes: note || undefined,
          },
          source,
        );
      }
    } else if (num === "3") {
      const names = extractBacktickNames(section.body);
      for (const name of names) {
        pushTool(
          tools,
          name,
          { ownership: "unspecified", availability: "always-available", status: "core" },
          source,
        );
      }
      // Any name explicitly called out in this section's own prose (e.g. a "Note:" aside)
      // gets that sentence attached as its note, still lifted verbatim from the source.
      const sentences = section.body.split(/\n\n+/);
      for (const sentence of sentences) {
        const mentioned = extractBacktickNames(sentence);
        if (mentioned.length < 2) continue;
        for (const name of mentioned) {
          const tool = tools.get(name);
          if (tool && !tool.notes) tool.notes = sentence.replace(/\s+/g, " ").trim();
        }
      }
    } else if (num === "4") {
      for (const row of parseTableRows(section.body)) {
        const description = `${row.cells[1] ?? ""} ${row.cells[2] ?? ""}`;
        if (/literal|not a tool/i.test(description)) continue;
        for (const name of extractBacktickNames(row.cells[0] ?? "")) {
          pushTool(
            tools,
            name,
            {
              ownership: "unspecified",
              availability: "unspecified",
              status: "phantom",
              notes: description.trim(),
            },
            source,
          );
        }
      }
    } else if (num === "5") {
      const bulletLines = section.body.split("\n").filter((l) => l.trim().startsWith("-"));
      for (const line of bulletLines) {
        const name = extractBacktickNames(line)[0];
        if (!name) continue;
        const annotation = line.match(/\(([^)]+)\)/)?.[1] ?? "";
        const ownership: ToolOwnership = /agent/i.test(annotation)
          ? "agent"
          : /user/i.test(annotation)
            ? "user"
            : "unspecified";
        const availability: ToolAvailability = /always-available/i.test(annotation)
          ? "always-available"
          : /discoverable/i.test(annotation)
            ? "discoverable"
            : "unspecified";
        pushTool(
          tools,
          name,
          { ownership, availability, status: "rich-sku-only" as ToolStatus },
          source,
        );
      }
    }
  }

  return Array.from(tools.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Cross-links tools to policy docs whose content mentions the exact tool name — computed live
 *  from the current universe rather than a precomputed/hardcoded mapping. */
export function linkToolsToDocs(tools: ToolRecord[], policies: PolicyDoc[]): ToolRecord[] {
  return tools.map((tool) => {
    const relatedDocIds = policies
      .filter((doc) => doc.content.includes(tool.name))
      .map((doc) => doc.id);
    return { ...tool, relatedDocIds };
  });
}
