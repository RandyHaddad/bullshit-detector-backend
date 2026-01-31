"use client";

import { useEffect, useRef, useState } from "react";

interface LogEntry {
  type: string;
  message: string;
  timestamp: number;
}

const ICONS: Record<string, string> = {
  search: "\u{1F50D}",
  "search-result": "\u2705",
  scrape: "\u{1F310}",
  "scrape-result": "\u2705",
  writing: "\u270F\uFE0F",
  done: "\u{1F3C1}",
  connected: "\u{1F4E1}",
};

const TEST_CLAIMS = `Analyze this for BS:

# Acme AI - The Future of Enterprise Intelligence

## About Us
Acme AI is the world's leading enterprise AI platform, trusted by over 10,000 companies worldwide. Founded in 2022, we've grown to serve Fortune 500 clients across 45 countries.

## Traction
- $100M ARR as of Q3 2025
- 10,000+ enterprise customers
- 50M+ API calls per day
- 400% YoY growth since launch

## Team
- CEO: Jane Smith - Former VP of Engineering at Google, Stanford CS PhD
- CTO: John Doe - Former Principal Engineer at Meta

## Funding
- Series B: $80M led by Sequoia Capital (2024)
- Series A: $20M led by a16z (2023)
- Total raised: $105M

## Partners
- Official technology partner of Microsoft, AWS, and Google Cloud
- Winner of the 2025 Gartner Cool Vendor Award`;

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState("");
  const [showReport, setShowReport] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/events");

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (e) => {
      try {
        const data: LogEntry = JSON.parse(e.data);
        setLogs((prev) => [...prev, data]);
        if (data.type === "done") setRunning(false);
      } catch {
        // ignore heartbeats / malformed
      }
    };

    return () => es.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  async function runTest() {
    setRunning(true);
    setLogs([]);
    setReport("");
    setShowReport(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: "test-" + Date.now(),
              role: "user",
              parts: [{ type: "text", text: TEST_CLAIMS }],
            },
          ],
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buf.split("\n");
        buf = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          try {
            const msg = JSON.parse(raw);
            if (msg.type === "text-delta" && msg.delta) {
              setReport((prev) => prev + msg.delta);
            }
          } catch {
            // skip non-JSON
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#e0e0e0",
        fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: 14,
        minHeight: "100vh",
        padding: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          borderBottom: "1px solid #222",
          paddingBottom: 16,
        }}
      >
        <span style={{ fontSize: 20 }}>{"\u{1F9E0}"}</span>
        <h1
          style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#fff" }}
        >
          BS Detector — Agent Dashboard
        </h1>

        <button
          onClick={runTest}
          disabled={running}
          style={{
            marginLeft: 24,
            padding: "6px 16px",
            background: running ? "#333" : "#4ade80",
            color: running ? "#666" : "#000",
            border: "none",
            borderRadius: 6,
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
            cursor: running ? "not-allowed" : "pointer",
          }}
        >
          {running ? "Running..." : "\u25B6 Run Test"}
        </button>

        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            color: connected ? "#4ade80" : "#f87171",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#4ade80" : "#f87171",
              display: "inline-block",
            }}
          />
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {/* Activity Log */}
      {logs.length === 0 && (
        <p style={{ color: "#555", fontStyle: "italic" }}>
          Waiting for agent activity... Click &quot;Run Test&quot; or trigger
          from the frontend.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {logs.map((entry, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "4px 0",
              color:
                entry.type === "done"
                  ? "#4ade80"
                  : entry.type.includes("result")
                    ? "#a3a3a3"
                    : "#e0e0e0",
            }}
          >
            <span style={{ color: "#555", flexShrink: 0 }}>
              [{formatTime(entry.timestamp)}]
            </span>
            <span style={{ flexShrink: 0 }}>
              {ICONS[entry.type] || "\u25CF"}
            </span>
            <span>{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Report Output */}
      {report && (
        <div style={{ marginTop: 24, borderTop: "1px solid #222", paddingTop: 16 }}>
          <button
            onClick={() => setShowReport((v) => !v)}
            style={{
              background: "none",
              border: "1px solid #333",
              color: "#aaa",
              padding: "4px 12px",
              borderRadius: 4,
              fontFamily: "inherit",
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            {showReport ? "\u25BC Hide Report" : "\u25B6 Show Report"}
          </button>

          {showReport && (
            <pre
              style={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: 8,
                padding: 16,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.6,
                color: "#d4d4d4",
                maxHeight: "60vh",
                overflow: "auto",
                fontSize: 13,
              }}
            >
              {report}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
