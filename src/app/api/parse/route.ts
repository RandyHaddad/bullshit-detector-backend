import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { firecrawl } from "@/lib/firecrawl";
import type { ParseResponse } from "@/lib/contracts";

export const maxDuration = 60;

const OUTPUT_DIR = path.join(process.cwd(), "output");

async function saveMarkdown(markdown: string, source: string, url?: string) {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const slug = url
    ? url.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 60)
    : `pdf_${Date.now()}`;
  const filename = `${slug}.md`;
  await writeFile(path.join(OUTPUT_DIR, filename), markdown, "utf-8");
  console.log(`Saved markdown to output/${filename}`);
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  // URL path: JSON body with { url }
  if (contentType.includes("application/json")) {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'url' field" },
        { status: 400 }
      );
    }

    try {
      const result = await firecrawl.scrape(url, {
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 30000,
      });

      const markdown = result.markdown ?? "";
      await saveMarkdown(markdown, "url", url);

      const response: ParseResponse = {
        markdown,
        source: "url",
        url,
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error("Firecrawl scrape error:", error);
      return NextResponse.json(
        { error: "Failed to scrape URL" },
        { status: 500 }
      );
    }
  }

  // PDF path: multipart form with file
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: "Missing 'file' field in form data" },
          { status: 400 }
        );
      }

      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Only PDF files are supported" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Step 1: Get presigned URL from Reducto
      const uploadRes = await fetch("https://platform.reducto.ai/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REDUCTO_API_KEY}`,
        },
      });

      if (!uploadRes.ok) {
        return NextResponse.json(
          { error: "Failed to get upload URL from Reducto" },
          { status: 502 }
        );
      }

      const { file_id: fileId, presigned_url: presignedUrl } =
        await uploadRes.json();

      // Step 2: Upload PDF to presigned URL
      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        body: buffer,
      });

      if (!putRes.ok) {
        return NextResponse.json(
          { error: "Failed to upload PDF to storage" },
          { status: 502 }
        );
      }

      // Step 3: Parse with Reducto
      const parseRes = await fetch("https://platform.reducto.ai/parse", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REDUCTO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: fileId,
          formatting: { table_output_format: "md" },
        }),
      });

      if (!parseRes.ok) {
        return NextResponse.json(
          { error: "Failed to parse PDF" },
          { status: 502 }
        );
      }

      const parseData = await parseRes.json();
      const markdown = parseData.result.chunks
        .map((chunk: { content: string }) => chunk.content)
        .join("\n\n");

      await saveMarkdown(markdown, "pdf");

      const response: ParseResponse = {
        markdown,
        source: "pdf",
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error("Reducto parse error:", error);
      return NextResponse.json(
        { error: "Failed to parse PDF" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "Unsupported content type. Send JSON with { url } or multipart form with PDF." },
    { status: 400 }
  );
}
