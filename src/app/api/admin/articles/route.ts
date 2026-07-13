import { NextRequest, NextResponse } from "next/server";
import { saveAdminArticle } from "@/lib/article-store";
import { CategorySlug } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid article payload" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  for (const key of ["title", "excerpt", "categorySlug", "image", "author"]) {
    if (!record[key]) return NextResponse.json({ error: `${key} is required.` }, { status: 400 });
  }

  try {
    const article = await saveAdminArticle({
      title: String(record.title),
      slug: record.slug ? String(record.slug) : undefined,
      excerpt: String(record.excerpt),
      categorySlug: String(record.categorySlug) as CategorySlug,
      productSlug: record.productSlug ? String(record.productSlug) : undefined,
      image: String(record.image),
      author: String(record.author),
      tags: String(record.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    });
    return NextResponse.json({ ok: true, article }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create article." }, { status: 400 });
  }
}
