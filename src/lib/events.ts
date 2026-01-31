export interface AgentEvent {
  type: "search" | "search-result" | "scrape" | "scrape-result" | "writing" | "done" | "connected";
  message: string;
  timestamp: number;
}

// Use a plain global array + cursor approach so it works across Next.js route modules
const g = globalThis as unknown as { __agentEvents: AgentEvent[] };
if (!g.__agentEvents) g.__agentEvents = [];

export const agentEvents = {
  push(type: AgentEvent["type"], message: string) {
    g.__agentEvents.push({ type, message, timestamp: Date.now() });
    // Keep only last 500 events
    if (g.__agentEvents.length > 500) {
      g.__agentEvents.splice(0, g.__agentEvents.length - 500);
    }
  },

  /** Read all events after the given index. Returns [events, newCursor]. */
  readFrom(cursor: number): [AgentEvent[], number] {
    const events = g.__agentEvents.slice(cursor);
    return [events, g.__agentEvents.length];
  },
};
