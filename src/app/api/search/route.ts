import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions, searchSite } from "@/lib/site-search";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const sort = searchParams.get("sort");
  const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
  const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

  if (!query.trim()) {
    const suggestions = await getSearchSuggestions();
    return NextResponse.json({ results: [], total: 0, suggestions });
  }

  const { results, total } = await searchSite({ query, type, sort, limit, offset });
  return NextResponse.json({ results, total, query: query.trim() });
}
