import {
  streamText,
  UIMessage,
  stepCountIs,
  convertToModelMessages,
} from "ai";
import { scrapeTool, searchTool } from "@/lib/tools";
import { openrouter } from "@/lib/openrouter";
import { BS_DETECTION_SYSTEM_PROMPT } from "@/lib/prompts";

export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter.chat("anthropic/claude-sonnet-4"),
    messages: await convertToModelMessages(messages),
    system: BS_DETECTION_SYSTEM_PROMPT,
    tools: {
      scrape: scrapeTool,
      search: searchTool,
    },
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
