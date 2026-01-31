import { tool } from "ai";
import { z } from "zod";
import { firecrawl } from "./firecrawl";

export const scrapeTool = tool({
  description:
    "Scrape content from a URL and return it as markdown. Use this to check specific pages like LinkedIn, Crunchbase, company websites, app stores, review sites, etc.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to scrape"),
  }),
  execute: async ({ url }) => {
    const result = await firecrawl.scrape(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 30000,
    });
    return { content: result.markdown ?? "" };
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
    const result = await firecrawl.search(query, {
      limit: limit ?? 5,
    });
    return result;
  },
});
