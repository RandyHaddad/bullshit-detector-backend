// ============================================================
// BS DETECTOR - SHARED CONTRACTS & MOCK DATA
// ============================================================
// This file is the SINGLE SOURCE OF TRUTH for API shapes.
// Both Person A (backend) and Person B (frontend) import from here.
// If you change a shape, update the types AND the mock data.

// ============================================================
// /api/parse - Parse URL or PDF
// ============================================================

export interface ParseURLRequest {
  url: string;
}

// For PDF, frontend sends multipart/form-data with file

export interface ParseResponse {
  markdown: string;
  source: 'url' | 'pdf';
  url?: string; // Only present for URL source
  html?: string; // Original HTML (for URL source, needed for visual mode)
}

export const mockParseResponse: ParseResponse = {
  markdown: `# TechStartup AI - Revolutionizing Enterprise Automation

## About Us
TechStartup AI is the leading enterprise automation platform, trusted by Fortune 500 companies worldwide.

## Key Metrics
- **$80M ARR** growing 3x year-over-year
- **500+ enterprise customers** including Google, Microsoft, and Amazon
- **99.9% uptime** guaranteed
- **50,000+ automations** running daily

## Our Team
Founded by ex-Google and ex-Meta engineers with 50+ years of combined experience in AI/ML.

## Funding
Series C funded with $150M raised from top-tier VCs including Sequoia, a]z, and Founders Fund.

## Testimonials
> "TechStartup AI transformed our operations, saving us $10M annually." - CTO, Fortune 100 Company

## Awards
- Forbes AI 50 2024
- Gartner Magic Quadrant Leader
- Y Combinator Top Company`,
  source: 'url',
  url: 'https://techstartup.ai',
  html: `<!DOCTYPE html><html><head><title>TechStartup AI</title></head><body>
<h1>TechStartup AI - Revolutionizing Enterprise Automation</h1>
<p>$80M ARR growing 3x year-over-year</p>
<p>500+ enterprise customers including Google, Microsoft, and Amazon</p>
<p>Founded by ex-Google and ex-Meta engineers</p>
</body></html>`,
};

// ============================================================
// /api/chat - BS Detection Agent (streaming)
// ============================================================

// Uses Vercel AI SDK useChat - no custom request type needed
// Initial message sent by frontend:
// { role: 'user', content: 'Analyze this for BS:\n\n${markdown}' }

// Response is streaming via toUIMessageStreamResponse()
// First response is the full BS report in markdown format

export const mockBSReport = `## Overall Assessment

**Verdict: Proceed with Extreme Caution** 🚨

This company makes several impressive claims, but many cannot be verified through public sources, and some appear to be significantly inflated.

---

## Claim Analysis

### "$80M ARR growing 3x YoY"

**Verdict: Likely Inflated** 🔴

**What they claim:** $80 million in annual recurring revenue with 300% year-over-year growth.

**What we found:**
- LinkedIn shows only 47 employees. At $80M ARR, that would be ~$1.7M revenue per employee - extremely unusual for an enterprise SaaS.
- Crunchbase lists their last funding as a $12M Series A in 2023. Companies at $80M ARR typically raise much larger rounds.
- No press coverage of this revenue milestone, which would typically be announced.
- Glassdoor reviews mention "startup growing pains" and "still finding product-market fit" - inconsistent with $80M ARR.

**Sources:** [LinkedIn](https://linkedin.com/company/techstartup), [Crunchbase](https://crunchbase.com/techstartup)

---

### "500+ enterprise customers including Google, Microsoft, and Amazon"

**Verdict: Unverifiable / Suspicious** 🟡

**What they claim:** 500+ enterprise customers with major tech giants as clients.

**What we found:**
- No case studies or logos visible on their website from Google, Microsoft, or Amazon.
- G2 shows only 23 reviews total, inconsistent with 500+ enterprise customers.
- Google's vendor directory doesn't list them as an approved vendor.
- The vague "including" language without specifics is a common red flag.

**Sources:** [G2 Reviews](https://g2.com/products/techstartup)

---

### "Founded by ex-Google and ex-Meta engineers with 50+ years combined experience"

**Verdict: Partially Verified** 🟢

**What they claim:** Founding team from Google and Meta with significant experience.

**What we found:**
- CEO's LinkedIn confirms 4 years at Google as a software engineer (not senior/staff level).
- CTO worked at Meta for 2 years as a contractor, not full-time.
- "50+ years combined" appears to count all experience, not just FAANG tenure.
- Technically true but framed to sound more impressive than reality.

**Sources:** [LinkedIn - CEO](https://linkedin.com), [LinkedIn - CTO](https://linkedin.com)

---

### "$150M raised from Sequoia, a]z, and Founders Fund"

**Verdict: False** 🔴

**What they claim:** Series C funding of $150M from top VCs.

**What we found:**
- Crunchbase shows total funding of $15M (Seed + Series A), not $150M.
- Sequoia's portfolio page doesn't list this company.
- No SEC filings for a $150M round.
- This appears to be a 10x exaggeration of actual funding.

**Sources:** [Crunchbase](https://crunchbase.com/techstartup), [SEC EDGAR](https://sec.gov/edgar)

---

### "99.9% uptime guaranteed"

**Verdict: Unverifiable** 🟡

**What they claim:** Enterprise-grade reliability with 99.9% uptime.

**What we found:**
- No public status page to verify historical uptime.
- Terms of service don't include SLA guarantees.
- Common marketing claim that's easy to make, hard to verify.

---

## Red Flags Summary

1. **Revenue claims don't match company size** - 47 employees for $80M ARR is implausible
2. **Funding amount appears fabricated** - 10x discrepancy from public records
3. **Name-dropping without evidence** - Major customers claimed but not verifiable
4. **Vague language throughout** - "including," "combined experience," etc.

## What Checks Out

- Founders do have some FAANG experience (though overstated)
- Company does exist and has real employees
- Product appears to be real based on G2 reviews

## Bottom Line

This company exists and has a real product, but their marketing significantly overstates their traction, funding, and customer base. The $150M funding claim appears to be fabricated. Approach any business relationship with significant due diligence.`;

// ============================================================
// /api/send-report - Email Report
// ============================================================

export interface SendReportRequest {
  report: string;  // Markdown report from chat
  email: string;
  url?: string;
}

export interface SendReportResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const mockSendReportResponse: SendReportResponse = {
  success: true,
  messageId: 'mock-123',
};

// ============================================================
// /api/transform - UI Agent (HTML annotation)
// ============================================================

export interface TransformRequest {
  report: string;
  html: string;
  url: string;
}

export interface TransformResponse {
  html: string;
}

export const mockTransformResponse: TransformResponse = {
  html: `<!DOCTYPE html>
<html>
<head>
  <title>TechStartup AI - BS DETECTED</title>
  <style>
    .bs-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #dc2626;
      color: white;
      padding: 12px 20px;
      font-family: system-ui, sans-serif;
      font-weight: bold;
      z-index: 99999;
      text-align: center;
    }
    .bs-false {
      background: #fecaca;
      text-decoration: line-through;
      padding: 2px 4px;
      border-radius: 2px;
    }
    .bs-correction {
      background: #dcfce7;
      padding: 2px 4px;
      border-radius: 2px;
      font-weight: bold;
    }
    .bs-unverifiable {
      background: #fef3c7;
      padding: 2px 4px;
      border-radius: 2px;
    }
    .bs-verified {
      background: #d1fae5;
      padding: 2px 4px;
      border-radius: 2px;
    }
    body { padding-top: 50px; }
  </style>
</head>
<body>
  <div class="bs-banner">⚠️ BS DETECTED: Multiple claims on this page could not be verified or appear inflated</div>
  <h1>TechStartup AI - Revolutionizing Enterprise Automation</h1>
  <p><span class="bs-false">$80M ARR</span> <span class="bs-correction">(Actually ~$8-10M based on team size)</span> growing 3x year-over-year</p>
  <p><span class="bs-unverifiable">500+ enterprise customers</span> (unverifiable) including Google, Microsoft, and Amazon</p>
  <p><span class="bs-verified">Founded by ex-Google and ex-Meta engineers</span> ✓</p>
</body>
</html>`,
};

// ============================================================
// Verdict types for UI components
// ============================================================

export type VerdictType = 'false' | 'inflated' | 'unverifiable' | 'verified' | 'partial';

export interface Claim {
  id: string;
  text: string;
  verdict: VerdictType;
  summary: string;
  evidence: string[];
  sources: { label: string; url: string }[];
}

// ============================================================
// BS Report Types (for backend integration)
// ============================================================

/** A single claim that was investigated (backend format) */
export interface BackendClaim {
  claim: string;
  verdict: string;
  analysis?: string;
  sources?: string[];
}

/** The full structured BS report (backend format) */
export interface BSReport {
  overallAssessment: string;
  claims: BackendClaim[];
  checksOut: string[];
  redFlags: string[];
  rawMarkdown?: string;
}
