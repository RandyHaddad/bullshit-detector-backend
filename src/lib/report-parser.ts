import type { BSReport, Claim } from "./contracts";

/**
 * Parses the agent's raw markdown output into a structured BSReport.
 * The agent outputs markdown with specific headers we can parse:
 * - ## Overall Assessment
 * - ## Claims Analysis (with ### per claim)
 * - ## What Checks Out
 * - ## Top Red Flags
 */
export function parseReport(raw: string): BSReport {
  const sections = splitSections(raw);

  return {
    overallAssessment: sections["overall assessment"] || sections["overall"] || "",
    claims: parseClaims(sections["claims analysis"] || sections["claims"] || ""),
    checksOut: parseBulletList(sections["what checks out"] || ""),
    redFlags: parseBulletList(sections["top red flags"] || sections["red flags"] || ""),
    rawMarkdown: raw,
  };
}

/** Split markdown into sections by h2 headers */
function splitSections(md: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = md.split(/^## /m);

  for (const part of parts) {
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    const title = part.slice(0, newline).trim().toLowerCase();
    const body = part.slice(newline + 1).trim();
    if (title) sections[title] = body;
  }

  return sections;
}

/** Parse claims from the Claims Analysis section */
function parseClaims(section: string): Claim[] {
  const claims: Claim[] = [];
  // Split by h3 headers (### "claim text" or ### claim text)
  const parts = section.split(/^### /m).filter((p) => p.trim());

  for (const part of parts) {
    const lines = part.split("\n");
    const claimText = lines[0]
      .replace(/^[""]|[""]$/g, "") // remove quotes
      .replace(/^"|"$/g, "")
      .trim();

    if (!claimText) continue;

    const body = lines.slice(1).join("\n");

    // Extract verdict
    const verdictMatch = body.match(/\*\*Verdict:\s*(.+?)\*\*/);
    const verdict = verdictMatch ? verdictMatch[1].trim() : "";

    // Extract sources
    const sourcesMatch = body.match(/\*\*Sources?:\*\*\s*(.+)/);
    let sources: string[] | undefined;
    if (sourcesMatch) {
      const urlRegex = /https?:\/\/[^\s),\]]+/g;
      const urls = sourcesMatch[1].match(urlRegex);
      if (urls && urls.length > 0) sources = urls;
    }

    // Analysis is everything that's not the verdict line or sources line
    const analysisLines = body
      .split("\n")
      .filter(
        (l) =>
          !l.includes("**Verdict:") &&
          !l.includes("**Sources:") &&
          !l.includes("**Source:") &&
          l.trim()
      )
      .join("\n")
      .trim();

    claims.push({
      claim: claimText,
      verdict,
      analysis: analysisLines || undefined,
      sources,
    });
  }

  return claims;
}

/** Parse a bullet or numbered list into string array */
function parseBulletList(section: string): string[] {
  return section
    .split("\n")
    .map((l) => l.replace(/^[\s]*[-*\d.]+\s*/, "").trim())
    .filter((l) => l.length > 0);
}
