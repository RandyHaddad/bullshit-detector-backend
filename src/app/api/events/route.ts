import { agentEvents } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  let pollInterval: ReturnType<typeof setInterval>;
  let heartbeatInterval: ReturnType<typeof setInterval>;

  function cleanup() {
    clearInterval(pollInterval);
    clearInterval(heartbeatInterval);
  }

  const stream = new ReadableStream({
    start(controller) {
      // Send connected message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "connected", message: "Dashboard connected", timestamp: Date.now() })}\n\n`
        )
      );

      let cursor = agentEvents.readFrom(0)[1];

      pollInterval = setInterval(() => {
        try {
          const [events, newCursor] = agentEvents.readFrom(cursor);
          cursor = newCursor;
          for (const event of events) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          }
        } catch {
          cleanup();
        }
      }, 300);

      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          cleanup();
        }
      }, 15000);
    },
    cancel() {
      cleanup();
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
