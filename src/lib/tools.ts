import { tool } from "ai";
import { z } from "zod";
import { firecrawl } from "./firecrawl";
import { agentEvents } from "./events";

// Session ID is set per-request so events get tracked to the right investigation
let activeSessionId: string | undefined;
export function setActiveSession(id: string | undefined) {
  activeSessionId = id;
}

export const scrapeTool = tool({
  description:
    "Scrape content from a URL and return it as markdown. Use this to check specific pages like LinkedIn, Crunchbase, company websites, app stores, review sites, etc.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to scrape"),
  }),
  execute: async ({ url }) => {
    agentEvents.push("scrape", `Scraping: ${url}`, activeSessionId);
    const result = await firecrawl.scrape(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 30000,
    });
    const content = result.markdown ?? "";
    const host = new URL(url).hostname;
    agentEvents.push(
      "scrape-result",
      `Scraped ${content.length.toLocaleString()} chars from ${host}`,
      activeSessionId
    );
    return { content };
  },
});

export const searchTool = tool({
  description:
    "Search the web for information. Use this to find evidence about claims — search for company names, people, funding rounds, awards, metrics, etc.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe("Number of results to return"),
  }),
  execute: async ({ query, limit }) => {
    agentEvents.push("search", `Searching: "${query}"`, activeSessionId);
    const result = await firecrawl.search(query, {
      limit: limit ?? 5,
    });
    const count = result.web?.length ?? 0;
    agentEvents.push("search-result", `Search returned ${count} results`, activeSessionId);
    return result;
  },
});
