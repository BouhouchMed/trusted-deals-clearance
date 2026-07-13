import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, duplicateProduct, featureProduct, updateProduct } from "@/lib/product-store";
import { CategorySlug } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const body = (await request.json().catch(() => null)) as { action?: string; product?: Record<string, unknown> } | null;

  try {
    if (body?.action === "feature") {
    const product = await featureProduct(slug);
    return NextResponse.json({ ok: true, product });
    }

    if (body?.action === "update" && body.product) {
      const record = body.product as Record<string, unknown>;
      const product = await updateProduct(slug, {
        title: String(record.title),
        slug: record.slug ? String(record.slug) : undefined,
        shortDescription: String(record.shortDescription),
        longDescription: record.longDescription ? String(record.longDescription) : undefined,
        image: String(record.image),
        storeId: String(record.storeId),
        brand: String(record.brand),
        categorySlug: String(record.categorySlug) as CategorySlug,
        regularPrice: Number(record.regularPrice),
        salePrice: Number(record.salePrice),
        affiliateUrl: String(record.affiliateUrl),
        couponCode: record.couponCode ? String(record.couponCode) : undefined,
        featured: Boolean(record.featured),
        trending: Boolean(record.trending),
        clearance: Boolean(record.clearance),
        published: record.published !== false
      });
      return NextResponse.json({ ok: true, product });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update product." }, { status: 400 });
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const body = (await request.json().catch(() => null)) as { action?: string } | null;

  if (body?.action !== "duplicate") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  try {
    const product = await duplicateProduct(slug);
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not duplicate product." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { slug } = await params;

  try {
    await deleteProduct(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete product." }, { status: 400 });
  }
}
