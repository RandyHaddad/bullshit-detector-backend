import { agentEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send connected message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "connected", message: "Dashboard connected", timestamp: Date.now() })}\n\n`
        )
      );

      let cursor = agentEvents.readFrom(0)[1]; // start at current end

      // Poll for new events every 300ms
      const interval = setInterval(() => {
        try {
          const [events, newCursor] = agentEvents.readFrom(cursor);
          cursor = newCursor;
          for (const event of events) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          }
        } catch {
          clearInterval(interval);
        }
      }, 300);

      // Heartbeat every 15s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
