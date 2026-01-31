import { NextResponse } from "next/server";
import { reportsCollection } from "@/lib/mongodb";
import { firecrawl } from "@/lib/firecrawl";
import { generateText, stepCountIs } from "ai";
import { openrouter } from "@/lib/openrouter";
import { BS_DETECTION_SYSTEM_PROMPT } from "@/lib/prompts";
import { parseReport } from "@/lib/report-parser";
import { generateReplacements } from "@/lib/ui-agent";
import { agentEvents } from "@/lib/events";
import { scrapeTool, searchTool, setActiveSession } from "@/lib/tools";
import crypto from "crypto";

export const maxDuration = 300;

export async function POST(req: Request) {
  const { url }: { url: string } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "Missing 'url'" }, { status: 400 });
  }

  // 1. Check cache — do we already have replacements for this URL?
  const cached = await reportsCollection.findOne(
    { url, replacements: { $exists: true, $ne: null } },
    { sort: { createdAt: -1 } }
  );

  if (cached) {
    return NextResponse.json({
      replacements: cached.replacements,
      cached: true,
    });
  }

  // 2. Check if we have a report but no replacements yet
  const existingReport = await reportsCollection.findOne(
    { url, report: { $exists: true } },
    { sort: { createdAt: -1 } }
  );

  if (existingReport && existingReport.report?.claims?.length > 0) {
    // Generate replacements from existing report
    const replacements = await generateReplacements(existingReport.report);

    // Cache the replacements
    await reportsCollection.updateOne(
      { _id: existingReport._id },
      { $set: { replacements } }
    );

    return NextResponse.json({ replacements, cached: false });
  }

  // 3. Full pipeline: scrape → BS agent → parse → UI agent → cache
  // Scrape the URL
  const scrapeResult = await firecrawl.scrape(url, {
    formats: ["markdown"],
    onlyMainContent: true,
    timeout: 30000,
  });
  const markdown = scrapeResult.markdown ?? "";

  // Run BS agent (non-streaming since extension just waits)
  const sessionId = crypto.randomUUID();
  agentEvents.startSession(sessionId);
  setActiveSession(sessionId);
  agentEvents.push("writing", "Agent started — analyzing claims...", sessionId);

  const agentResult = await generateText({
    model: openrouter.chat("anthropic/claude-sonnet-4"),
    system: BS_DETECTION_SYSTEM_PROMPT,
    prompt: `Analyze this for BS:\n\n${markdown}`,
    tools: {
      scrape: scrapeTool,
      search: searchTool,
    },
    stopWhen: stepCountIs(10),
  });

  agentEvents.push("done", "Report complete", sessionId);

  const fullText = agentResult.steps.map((s) => s.text).join("");
  const structuredReport = parseReport(fullText);

  // Generate replacements
  const replacements = await generateReplacements(structuredReport);

  // Save everything to MongoDB
  await reportsCollection.insertOne({
    url,
    sourceType: "url",
    inputMarkdown: markdown,
    events: agentEvents.getSessionEvents(sessionId),
    report: structuredReport,
    rawChatOutput: fullText,
    replacements,
    createdAt: new Date(),
    completedAt: new Date(),
  });

  agentEvents.endSession(sessionId);
  setActiveSession(undefined);

  return NextResponse.json({ replacements, cached: false });
}
