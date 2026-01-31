// ============================================================
// BS DETECTOR - SHARED CONTRACTS & MOCK DATA
// ============================================================
// This file is the SINGLE SOURCE OF TRUTH for API shapes.
// Both Person A (backend) and Person B (frontend) import from here.
// If you change a shape, update the types AND the mock data.
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
// /api/chat (BS Detection Agent)
// -----------------------------------------------------------
// Uses Vercel AI SDK useChat - streaming response
// The initial message should include the parsed markdown
// The agent responds with a structured BS report, then
// the user can ask follow-up questions in the same chat.
//
// First message format (sent by frontend):
// "Analyze this for BS:\n\n{markdown}"
//
// The agent's first response will be the full BS report.
// Subsequent messages are conversational follow-ups.
// -----------------------------------------------------------

// This is what the agent's first message looks like (as text content).
// The frontend should parse sections to render them nicely.
export const mockBSReport = `## Overall Assessment

This landing page contains several claims that range from plausible to highly suspicious. The company appears to be real and has raised funding, but multiple key metrics are either significantly inflated or completely unverifiable. The overall picture is of a company stretching the truth to appear 10x bigger than it actually is.

## Claims Analysis

### "$100M ARR as of Q3 2025"
**Verdict: Highly suspicious**
Acme AI raised $105M total. For a company founded in 2022 with a Series B in 2024, $100M ARR would make them one of the fastest-growing enterprise SaaS companies in history. No press coverage, no mention in any "fastest growing" lists, no Glassdoor reviews suggesting a company of that scale. Their LinkedIn shows 47 employees - a company doing $100M ARR typically has 300-500+ employees. This number appears to be fabricated or refers to something other than actual recurring revenue.
**Sources:** [LinkedIn](https://linkedin.com/company/acme-ai), [Crunchbase](https://crunchbase.com/organization/acme-ai)

### "10,000+ enterprise customers"
**Verdict: Almost certainly false**
10,000 enterprise customers would make them larger than most public SaaS companies. Their G2 page shows 12 reviews. Their case studies page lists 3 companies. No job postings for customer success or account management at that scale. This claim contradicts everything else publicly available.
**Sources:** [G2 Reviews](https://g2.com/products/acme-ai), [Careers Page](https://acme-ai.example.com/careers)

### "50M+ API calls per day"
**Verdict: Unverifiable**
No public evidence exists to confirm or deny this. No status page, no public API metrics, no third-party benchmarks. When a company makes a specific technical claim with zero public footprint, treat it with skepticism.

### "CEO: Jane Smith - Former VP of Engineering at Google"
**Verdict: Partially true, inflated**
Jane Smith did work at Google, but as a Senior Software Engineer from 2018-2021, not as VP of Engineering. Her LinkedIn confirms a Stanford CS degree but shows a Master's, not a PhD.
**Sources:** [LinkedIn](https://linkedin.com/in/janesmith)

### "NeuralCore Engine outperforms GPT-4 on all standard benchmarks by 40%"
**Verdict: Almost certainly false**
No published benchmarks, no papers, no third-party evaluations. A 40% improvement over GPT-4 across ALL benchmarks would be front-page news in the AI community. This claim is extraordinary and has zero supporting evidence.

### "Series B: $80M led by Sequoia Capital"
**Verdict: Partially true**
Crunchbase shows a $45M Series B with Sequoia participating but not leading. The round was led by Index Ventures. The amount is inflated by nearly 2x.
**Sources:** [Crunchbase](https://crunchbase.com/organization/acme-ai)

### "Official technology partner of Microsoft, AWS, and Google Cloud"
**Verdict: Misleading**
They appear in the AWS Marketplace as a listed product, which any company can do. No evidence of official partnership programs with Microsoft or Google Cloud. Being listed on a marketplace is not a "technology partnership."
**Sources:** [AWS Marketplace](https://aws.amazon.com/marketplace)

### "Winner of the 2025 Gartner Cool Vendor Award"
**Verdict: False**
The 2025 Gartner Cool Vendor reports are publicly indexed. Acme AI does not appear in any of them. This award appears to be fabricated.
**Sources:** [Gartner](https://gartner.com/en/research/methodologies/cool-vendors)

### "400% YoY growth"
**Verdict: Unverifiable, suspicious in context**
Given that other metrics appear inflated, this growth figure should be treated skeptically. No external data to confirm. Could be technically true if they grew from a very small base, but presented to imply massive scale.

### Testimonials
**Verdict: Unverifiable**
Anonymous testimonials from "Fortune 100 Company" and "Major Bank" with no names attached. These could be real, fabricated, or heavily editorialized. Legitimate companies typically name their reference customers.

## What Checks Out
- The company exists and has raised real funding (though amounts are inflated)
- The founding team has legitimate tech backgrounds (though titles are inflated)
- They have a real product listed on AWS Marketplace

## Top Red Flags
1. Revenue claim ($100M ARR) contradicted by team size (47 people on LinkedIn)
2. Customer count (10,000) contradicted by review count (12 on G2)
3. Fabricated award (Gartner Cool Vendor)
4. Inflated funding numbers (nearly 2x actual)
5. Benchmark claims (40% better than GPT-4) with zero evidence
`;

// -----------------------------------------------------------
// /api/send-report
// -----------------------------------------------------------

export interface SendReportRequest {
  report: string;
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
  report: string;
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
//
// Example transformations:
//   "$100M ARR" → "<span style='background:red;color:white;text-decoration:line-through'>$100M ARR</span> <span style='background:#222;color:#0f0'>(Actually unverifiable - only 47 employees on LinkedIn)</span>"
//   "10,000+ enterprise customers" → same pattern
//   Text that checks out → "<span style='background:#1a4d1a;color:white'>✓ Verified</span>"

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
// MongoDB Report Document (for reference)
// -----------------------------------------------------------

export interface ReportDocument {
  _id?: string;
  url?: string;
  sourceType: "url" | "pdf";
  markdown: string;
  report: string;
  transformedHtml?: string;
  createdAt: Date;
}
