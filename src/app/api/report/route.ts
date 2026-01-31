import { NextRequest, NextResponse } from "next/server";
import { reportsCollection } from "@/lib/mongodb";

// GET /api/report?url=https://example.com
// Returns cached report if one exists for this URL
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 }
    );
  }

  const cached = await reportsCollection.findOne(
    { url },
    { sort: { createdAt: -1 } }
  );

  if (!cached) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    report: cached.report,
    createdAt: cached.createdAt,
  });
}
