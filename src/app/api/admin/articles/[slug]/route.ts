import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAuth } from "@/lib/admin-auth";
import { deleteArticle, updateArticle } from "@/lib/article-store";
import { CategorySlug } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid article payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  try {
    const article = await updateArticle(slug, {
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
    return NextResponse.json({ ok: true, article });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update article." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const unauthorized = requireAdminApiAuth(_request);
  if (unauthorized) return unauthorized;

  const { slug } = await params;

  try {
    await deleteArticle(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete article." }, { status: 400 });
  }
}
