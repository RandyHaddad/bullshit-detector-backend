import {
  streamText,
  UIMessage,
  stepCountIs,
  convertToModelMessages,
} from "ai";
import { scrapeTool, searchTool } from "@/lib/tools";
import { openrouter } from "@/lib/openrouter";
import { BS_DETECTION_SYSTEM_PROMPT } from "@/lib/prompts";
import { agentEvents } from "@/lib/events";
import { reportsCollection } from "@/lib/mongodb";

export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages, url }: { messages: UIMessage[]; url?: string } =
    await req.json();

  agentEvents.push("writing", "Agent started — analyzing claims...");

  const result = streamText({
    model: openrouter.chat("anthropic/claude-sonnet-4"),
    messages: await convertToModelMessages(messages),
    system: BS_DETECTION_SYSTEM_PROMPT,
    tools: {
      scrape: scrapeTool,
      search: searchTool,
    },
    stopWhen: stepCountIs(10),
    onFinish: async ({ text }) => {
      agentEvents.push("done", "Report complete");

      // Save to MongoDB
      try {
        await reportsCollection.insertOne({
          url: url || null,
          report: text,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error("Failed to save report to MongoDB:", e);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
