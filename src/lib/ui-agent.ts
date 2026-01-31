import { generateText } from "ai";
import { openrouter } from "./openrouter";
import type { BSReport, Replacement } from "./contracts";

const UI_AGENT_PROMPT = `You are a UI annotation agent. Given a BS detection report with claims and verdicts, generate a JSON array of find/replace pairs.

Rules:
- "find" is the EXACT text as it appears on the original website (keep it short - just the claim phrase)
- "replace" is the original text followed by a short inline annotation in parentheses
- Use these prefixes in annotations:
  - ❌ for false/fabricated claims
  - ⚠️ for suspicious/unverifiable claims
  - ✅ for verified claims
- Keep annotations SHORT (under 15 words)
- Only include claims where you can identify a specific findable string
- Output ONLY valid JSON array, no markdown fences, no explanation

Example output:
[
  { "find": "$100M ARR", "replace": "$100M ARR (❌ Unverifiable — only 47 employees on LinkedIn)" },
  { "find": "Former VP of Engineering at Google", "replace": "Former VP of Engineering at Google (❌ Was actually Senior SWE)" },
  { "find": "10,000+ enterprise customers", "replace": "10,000+ enterprise customers (❌ G2 shows only 12 reviews)" }
]`;

export async function generateReplacements(report: BSReport): Promise<Replacement[]> {
  const claimsSummary = report.claims
    .map((c) => `Claim: "${c.claim}"\nVerdict: ${c.verdict}\nAnalysis: ${c.analysis || "N/A"}`)
    .join("\n\n");

  const { text } = await generateText({
    model: openrouter.chat("anthropic/claude-sonnet-4"),
    system: UI_AGENT_PROMPT,
    prompt: claimsSummary,
  });

  try {
    // Strip markdown fences if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse UI agent output:", text);
    return [];
  }
}
