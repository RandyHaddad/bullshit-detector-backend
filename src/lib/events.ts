export interface AgentEvent {
  type: "search" | "search-result" | "scrape" | "scrape-result" | "writing" | "done" | "connected";
  message: string;
  timestamp: number;
}

interface SessionEvents {
  events: AgentEvent[];
  startCursor: number;
}

const g = globalThis as unknown as {
  __agentEvents: AgentEvent[];
  __sessions: Map<string, SessionEvents>;
};
if (!g.__agentEvents) g.__agentEvents = [];
if (!g.__sessions) g.__sessions = new Map();

export const agentEvents = {
  push(type: AgentEvent["type"], message: string, sessionId?: string) {
    const event: AgentEvent = { type, message, timestamp: Date.now() };
    g.__agentEvents.push(event);

    // Also track per-session
    if (sessionId) {
      const session = g.__sessions.get(sessionId);
      if (session) session.events.push(event);
    }

    // Keep only last 500 global events
    if (g.__agentEvents.length > 500) {
      g.__agentEvents.splice(0, g.__agentEvents.length - 500);
    }
  },

  startSession(sessionId: string) {
    g.__sessions.set(sessionId, { events: [], startCursor: g.__agentEvents.length });
  },

  getSessionEvents(sessionId: string): AgentEvent[] {
    return g.__sessions.get(sessionId)?.events ?? [];
  },

  endSession(sessionId: string) {
    // Keep it around briefly for the save, then clean up
    setTimeout(() => g.__sessions.delete(sessionId), 10000);
  },

  /** Read all events after the given index. Returns [events, newCursor]. */
  readFrom(cursor: number): [AgentEvent[], number] {
    const events = g.__agentEvents.slice(cursor);
    return [events, g.__agentEvents.length];
  },
};
