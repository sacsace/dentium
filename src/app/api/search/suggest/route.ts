import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions, suggestSearch } from "@/lib/site-search";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") || "";
  const suggestions = await getSearchSuggestions();

  if (!query.trim()) {
    return NextResponse.json({ suggestions, results: [] });
  }

  const results = await suggestSearch(query, 8);
  return NextResponse.json({ suggestions, results });
}
