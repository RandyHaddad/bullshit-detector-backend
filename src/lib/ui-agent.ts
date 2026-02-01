import { generateObject } from "ai";
import { z } from "zod";
import { anthropic } from "./anthropic";
import type { BSReport } from "./contracts";

const UI_AGENT_PROMPT = `You are given a BS detection analysis. Generate annotations for claims on the page.

For each claim, provide:
- "find": the EXACT short text from the website to match
- "annotation": a short, punchy counter-fact (NOT "unverifiable claim" — give the actual counter-evidence)
- "type": one of "false", "suspicious", "verified", "fluff"
- "details": optional array of specific counter-evidence items (tools, facts, links)

BE SPECIFIC with counter-evidence. Don't say "unverifiable" — say what you actually found or didn't find.

Examples:
- Claim: "completely undetectable" → annotation: "Detectable by multiple tools", details: ["Zoom AI Companion flags it", "Otter.ai detects overlay apps", "IT admins can see the process"]
- Claim: "fastest transcription" → annotation: "Slower than competitors in tests", details: ["Reddit users report 2-3s latency", "Whisper benchmarks show faster alternatives"]
- Claim: "$100M ARR" → annotation: "Only 47 employees on LinkedIn", details: ["Crunchbase shows $45M raised", "G2 has 12 reviews"]
- Claim: "world-class AI platform" → annotation: "Standard SaaS dashboard with API wrapper", details: []
- Claim: "99.9% accuracy" → annotation: "No published benchmarks", details: ["No third-party evaluation found", "No methodology disclosed"]`;

const replacementsSchema = z.object({
  replacements: z.array(
    z.object({
      find: z.string().describe("Exact short text from the original website"),
      annotation: z.string().describe("Short punchy counter-fact, not 'unverifiable'"),
      type: z.enum(["false", "suspicious", "verified", "fluff"]).describe("Severity"),
      details: z.array(z.string()).describe("Specific counter-evidence items").optional(),
    })
  ),
});

export interface RichReplacement {
  find: string;
  annotation: string;
  type: "false" | "suspicious" | "verified" | "fluff";
  details?: string[];
}

export async function generateReplacements(report: BSReport, modelId?: string): Promise<RichReplacement[]> {
  if (!report.claims || report.claims.length === 0) {
    return [];
  }

  const claimsSummary = report.claims
    .map((c) => `Claim: "${c.claim}"\nVerdict: ${c.verdict}\nAnalysis: ${c.analysis || "N/A"}`)
    .join("\n\n");

  return callUIAgent(claimsSummary, modelId);
}

export async function generateReplacementsFromRaw(rawAnalysis: string, modelId?: string): Promise<RichReplacement[]> {
  if (!rawAnalysis || rawAnalysis.trim().length === 0) {
    return [];
  }

  return callUIAgent(rawAnalysis, modelId);
}

async function callUIAgent(prompt: string, modelId?: string): Promise<RichReplacement[]> {
  try {
    const { object } = await generateObject({
      model: anthropic(modelId || "claude-sonnet-4-20250514"),
      system: UI_AGENT_PROMPT,
      prompt,
      schema: replacementsSchema,
    });

    return object.replacements as RichReplacement[];
  } catch (err) {
    console.error("UI agent error:", err);
    return [];
  }
}
