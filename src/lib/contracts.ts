// ============================================================
// BS DETECTOR - SHARED CONTRACTS & MOCK DATA
// ============================================================
// This file is the SINGLE SOURCE OF TRUTH for API shapes.
// Both Person A (backend) and Person B (frontend) import from here.
// If you change a shape, update the types AND the mock data.
//
// PERSON B / CLAUDE: The backend uses Claude via OpenRouter to
// analyze claims. The chat stream (/api/chat) is the live
// investigation. The structured report below is saved to MongoDB
// and returned via /api/report. Render REQUIRED fields always.
// Render OPTIONAL fields if present (they may be added over time).
// ============================================================

// -----------------------------------------------------------
// /api/parse
// -----------------------------------------------------------

export interface ParseRequest {
  url?: string;
  // OR multipart form with `file` field for PDF
}

export interface ParseResponse {
  markdown: string;
  source: "url" | "pdf";
  url?: string;
}

export const mockParseResponse: ParseResponse = {
  markdown: `# Acme AI - The Future of Enterprise Intelligence

## About Us
Acme AI is the **world's leading enterprise AI platform**, trusted by over 10,000 companies worldwide. Founded in 2022, we've grown to serve Fortune 500 clients across 45 countries.

## Traction
- **$100M ARR** as of Q3 2025
- **10,000+ enterprise customers**
- **50M+ API calls per day**
- Processing over **1 billion documents monthly**
- **400% YoY growth** since launch

## Team
- **CEO: Jane Smith** - Former VP of Engineering at Google, Stanford CS PhD
- **CTO: John Doe** - Former Principal Engineer at Meta, 15 years in distributed systems
- **Head of AI: Sarah Chen** - Published 200+ papers in NLP, former OpenAI researcher

## Product
Our proprietary **NeuralCore Engine** outperforms GPT-4 on all standard benchmarks by 40%. We've built the industry's most advanced retrieval system with **99.9% accuracy** on enterprise document understanding.

## Funding
- **Series B: $80M** led by Sequoia Capital (2024)
- **Series A: $20M** led by a16z (2023)
- **Total raised: $105M**

## Partners & Clients
- Official technology partner of **Microsoft, AWS, and Google Cloud**
- Trusted by **Goldman Sachs, JPMorgan, and 8 of the top 10 banks**
- Winner of the **2025 Gartner Cool Vendor Award**

## Testimonials
> "Acme AI transformed our entire document workflow. We saved $10M in the first year alone." - CTO, Fortune 100 Company

> "The most accurate AI platform we've ever tested. Nothing else comes close." - Head of AI, Major Bank
`,
  source: "url",
  url: "https://acme-ai.example.com",
};

// -----------------------------------------------------------
// /api/chat (BS Detection Agent - Streaming)
// -----------------------------------------------------------
// Uses Vercel AI SDK useChat - streaming response.
// The initial message should include the parsed markdown.
// The agent responds with its investigation in real time,
// then the user can ask follow-up questions.
//
// PERSON B: The chat stream is for the LIVE investigation view.
// Show the agent thinking/searching as it happens. The final
// structured report is a SEPARATE thing - see BSReport below.
//
// First message format (sent by frontend):
// "Analyze this for BS:\n\n{markdown}"
//
// POST body also accepts optional fields:
// { messages, url?, sourceType?, inputMarkdown? }
// These get saved to MongoDB alongside the report.
// -----------------------------------------------------------

// -----------------------------------------------------------
// /api/report?url=... (Cached Report Lookup)
// -----------------------------------------------------------
// GET endpoint. Returns { found: false } or { found: true, report: BSReport }
// Use this to check if a URL has already been analyzed.
// -----------------------------------------------------------

// -----------------------------------------------------------
// STRUCTURED REPORT
// -----------------------------------------------------------
// PERSON B / CLAUDE: This is the structured report that the
// backend parses from the agent's output and saves to MongoDB.
//
// REQUIRED fields are ALWAYS present. Build your UI around these.
// OPTIONAL fields may or may not be present - render them if
// they exist, skip gracefully if they don't. Person A will be
// experimenting with adding more optional fields over time.
// -----------------------------------------------------------

/** A single claim that was investigated */
export interface Claim {
  // --- REQUIRED: Always present, build your UI around these ---
  claim: string;              // The original claim text (e.g. "$100M ARR")
  verdict: string;            // Plain English verdict (e.g. "Highly suspicious", "Checks out", "False")

  // --- OPTIONAL: Render if present, skip if not ---
  analysis?: string;          // Detailed explanation of what was found
  sources?: string[];         // URLs of evidence used
}

/** The full structured BS report */
export interface BSReport {
  // --- REQUIRED: Always present ---
  overallAssessment: string;  // 2-3 paragraph natural language summary
  claims: Claim[];            // Array of investigated claims with verdicts
  checksOut: string[];        // Bullet list of things that appear legitimate
  redFlags: string[];         // Ordered list of most concerning findings

  // --- OPTIONAL: May be added later ---
  rawMarkdown?: string;       // The full agent output as raw markdown (fallback rendering)
}

export const mockBSReport: BSReport = {
  overallAssessment:
    "This landing page contains several claims that range from plausible to highly suspicious. The company appears to be real and has raised funding, but multiple key metrics are either significantly inflated or completely unverifiable. The overall picture is of a company stretching the truth to appear 10x bigger than it actually is.",
  claims: [
    {
      claim: "$100M ARR as of Q3 2025",
      verdict: "Highly suspicious",
      analysis:
        "Acme AI raised $105M total. For a company founded in 2022 with a Series B in 2024, $100M ARR would make them one of the fastest-growing enterprise SaaS companies in history. Their LinkedIn shows 47 employees — a company doing $100M ARR typically has 300-500+.",
      sources: [
        "https://linkedin.com/company/acme-ai",
        "https://crunchbase.com/organization/acme-ai",
      ],
    },
    {
      claim: "10,000+ enterprise customers",
      verdict: "Almost certainly false",
      analysis:
        "10,000 enterprise customers would make them larger than most public SaaS companies. Their G2 page shows 12 reviews. Their case studies page lists 3 companies.",
      sources: [
        "https://g2.com/products/acme-ai",
        "https://acme-ai.example.com/careers",
      ],
    },
    {
      claim: "50M+ API calls per day",
      verdict: "Unverifiable",
      analysis:
        "No public evidence exists to confirm or deny this. No status page, no public API metrics, no third-party benchmarks.",
    },
    {
      claim: "CEO: Jane Smith - Former VP of Engineering at Google, Stanford CS PhD",
      verdict: "Partially true, inflated",
      analysis:
        "Jane Smith did work at Google, but as a Senior Software Engineer from 2018-2021, not as VP of Engineering. Her LinkedIn confirms a Stanford CS degree but shows a Master's, not a PhD.",
      sources: ["https://linkedin.com/in/janesmith"],
    },
    {
      claim: "NeuralCore Engine outperforms GPT-4 on all standard benchmarks by 40%",
      verdict: "Almost certainly false",
      analysis:
        "No published benchmarks, no papers, no third-party evaluations. A 40% improvement over GPT-4 across ALL benchmarks would be front-page news in the AI community.",
    },
    {
      claim: "Series B: $80M led by Sequoia Capital",
      verdict: "Partially true",
      analysis:
        "Crunchbase shows a $45M Series B with Sequoia participating but not leading. The round was led by Index Ventures. The amount is inflated by nearly 2x.",
      sources: ["https://crunchbase.com/organization/acme-ai"],
    },
    {
      claim: "Official technology partner of Microsoft, AWS, and Google Cloud",
      verdict: "Misleading",
      analysis:
        "They appear in the AWS Marketplace as a listed product, which any company can do. No evidence of official partnership programs with Microsoft or Google Cloud.",
      sources: ["https://aws.amazon.com/marketplace"],
    },
    {
      claim: "Winner of the 2025 Gartner Cool Vendor Award",
      verdict: "False",
      analysis:
        "The 2025 Gartner Cool Vendor reports are publicly indexed. Acme AI does not appear in any of them. This award appears to be fabricated.",
      sources: [
        "https://gartner.com/en/research/methodologies/cool-vendors",
      ],
    },
    {
      claim: "400% YoY growth",
      verdict: "Unverifiable, suspicious in context",
      analysis:
        "Given that other metrics appear inflated, this growth figure should be treated skeptically. Could be technically true if they grew from a very small base.",
    },
    {
      claim: "Testimonials from Fortune 100 Company and Major Bank",
      verdict: "Unverifiable",
      analysis:
        "Anonymous testimonials with no names attached. These could be real, fabricated, or heavily editorialized. Legitimate companies typically name their reference customers.",
    },
  ],
  checksOut: [
    "The company exists and has raised real funding (though amounts are inflated)",
    "The founding team has legitimate tech backgrounds (though titles are inflated)",
    "They have a real product listed on AWS Marketplace",
  ],
  redFlags: [
    "Revenue claim ($100M ARR) contradicted by team size (47 people on LinkedIn)",
    "Customer count (10,000) contradicted by review count (12 on G2)",
    "Fabricated award (Gartner Cool Vendor)",
    "Inflated funding numbers (nearly 2x actual)",
    "Benchmark claims (40% better than GPT-4) with zero evidence",
  ],
};

// -----------------------------------------------------------
// /api/send-report
// -----------------------------------------------------------

export interface SendReportRequest {
  report: BSReport;
  email: string;
  url?: string;
}

export interface SendReportResponse {
  success: boolean;
  messageId?: string;
}

export const mockSendReportResponse: SendReportResponse = {
  success: true,
  messageId: "mock-message-id-123",
};

// -----------------------------------------------------------
// /api/transform (UI Agent - Visual Mode)
// -----------------------------------------------------------

export interface TransformRequest {
  report: BSReport;
  html: string;
  url: string;
}

export interface TransformResponse {
  html: string; // Full modified HTML page
}

// The UI Agent rewrites claim text inline in the HTML.
// It can:
// - Strike through false claims and add corrections
// - Highlight suspicious claims in red/yellow
// - Add a banner at the top with overall assessment
// - Add parenthetical annotations like "(not really)" or "(actually $45M)"
// - Keep the rest of the page intact

export const mockTransformResponse: TransformResponse = {
  html: `<!DOCTYPE html>
<html>
<head><title>Acme AI (BS Detected)</title></head>
<body>
<div style="position:fixed;top:0;left:0;right:0;background:#1a1a2e;color:white;padding:16px;z-index:99999;font-family:system-ui;border-bottom:3px solid #e74c3c;">
  <strong>BS Detector Report:</strong> Multiple claims on this page appear inflated or fabricated.
  Revenue inflated, customer count unverifiable, fabricated awards detected.
</div>
<div style="margin-top:80px;">
  <p>This is a mock transformed page. The real UI Agent will take the actual page HTML and modify it inline.</p>
</div>
</body>
</html>`,
};

// -----------------------------------------------------------
// /api/events (SSE - Agent Activity Stream)
// -----------------------------------------------------------
// PERSON B / CLAUDE: This is a Server-Sent Events endpoint.
// Connect with EventSource("/api/events") to get real-time
// agent activity. Use this to show a live feed while the
// agent investigates (e.g. "Searching for funding data...",
// "Scraping crunchbase.com...").
//
// Event shape:
// { type: string, message: string, timestamp: number }
//
// Types: "search" | "search-result" | "scrape" | "scrape-result"
//        | "writing" | "done" | "connected"
// -----------------------------------------------------------

export interface AgentEventRecord {
  type: string;
  message: string;
  timestamp: number;
}

// -----------------------------------------------------------
// MongoDB Report Document (internal - not needed by frontend)
// -----------------------------------------------------------

export interface ReportDocument {
  _id?: string;
  url: string | null;
  sourceType: "url" | "pdf";
  inputMarkdown: string | null;
  events: AgentEventRecord[];
  report: BSReport;
  rawChatOutput: string;
  createdAt: Date;
  completedAt: Date;
}
