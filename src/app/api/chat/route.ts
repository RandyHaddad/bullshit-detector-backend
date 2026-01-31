import {
  streamText,
  UIMessage,
  stepCountIs,
  convertToModelMessages,
} from "ai";
import { scrapeTool, searchTool, setActiveSession } from "@/lib/tools";
import { openrouter } from "@/lib/openrouter";
import { BS_DETECTION_SYSTEM_PROMPT } from "@/lib/prompts";
import { agentEvents } from "@/lib/events";
import { reportsCollection } from "@/lib/mongodb";
import { parseReport } from "@/lib/report-parser";
import crypto from "crypto";

export const maxDuration = 300;

export async function POST(req: Request) {
  const {
    messages,
    url,
    sourceType,
    inputMarkdown,
  }: {
    messages: UIMessage[];
    url?: string;
    sourceType?: "url" | "pdf";
    inputMarkdown?: string;
  } = await req.json();

  const sessionId = crypto.randomUUID();
  agentEvents.startSession(sessionId);
  setActiveSession(sessionId);

  agentEvents.push("writing", "Agent started — analyzing claims...", sessionId);

  const result = streamText({
    model: openrouter.chat("anthropic/claude-sonnet-4"),
    messages: await convertToModelMessages(messages),
    system: BS_DETECTION_SYSTEM_PROMPT,
    tools: {
      scrape: scrapeTool,
      search: searchTool,
    },
    stopWhen: stepCountIs(10),
    onFinish: async ({ steps }) => {
      // Combine text from all steps into one report
      const fullReport = steps.map((s) => s.text).join("");

      agentEvents.push("done", "Report complete", sessionId);

      // Parse raw markdown into structured report
      const structuredReport = parseReport(fullReport);

      // Save full structured document to MongoDB
      try {
        await reportsCollection.insertOne({
          url: url || null,
          sourceType: sourceType || "url",
          inputMarkdown: inputMarkdown || null,
          events: agentEvents.getSessionEvents(sessionId),
          report: structuredReport,
          rawChatOutput: fullReport,
          createdAt: new Date(),
          completedAt: new Date(),
        });
      } catch (e) {
        console.error("Failed to save report to MongoDB:", e);
      }

      agentEvents.endSession(sessionId);
      setActiveSession(undefined);
    },
  });

  return result.toUIMessageStreamResponse();
}
