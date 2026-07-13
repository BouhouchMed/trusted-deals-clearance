import { NextRequest, NextResponse } from "next/server";
import { settings } from "@/lib/data";
import { getAdminProducts, saveAdminProduct } from "@/lib/product-store";
import { CategorySlug } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getAdminProducts());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid product payload" }, { status: 400 });
  }

  const error = validateProductPayload(body as Record<string, unknown>);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const product = await saveAdminProduct({
      title: String(body.title),
      slug: body.slug ? String(body.slug) : undefined,
      shortDescription: String(body.shortDescription),
      longDescription: body.longDescription ? String(body.longDescription) : undefined,
      image: String(body.image),
      storeId: String(body.storeId),
      brand: String(body.brand),
      categorySlug: String(body.categorySlug) as CategorySlug,
      regularPrice: Number(body.regularPrice),
      salePrice: Number(body.salePrice),
      affiliateUrl: String(body.affiliateUrl),
      couponCode: body.couponCode ? String(body.couponCode) : undefined,
      featured: Boolean(body.featured),
      trending: Boolean(body.trending),
      clearance: Boolean(body.clearance),
      published: body.published !== false
    });
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create product" }, { status: 400 });
  }
}

function validateProductPayload(body: Record<string, unknown>) {
  const required = ["title", "shortDescription", "image", "storeId", "brand", "categorySlug", "regularPrice", "salePrice", "affiliateUrl"];
  for (const key of required) {
    if (!body[key]) return `${key} is required.`;
  }

  if (!Number.isFinite(Number(body.regularPrice)) || !Number.isFinite(Number(body.salePrice))) {
    return "Prices must be valid numbers.";
  }

  try {
    const url = new URL(String(body.affiliateUrl));
    if (!settings.approvedAffiliateDomains.includes(url.hostname)) {
      return "Affiliate URL domain is not in the approved retailer allowlist.";
    }
  } catch {
    return "Affiliate URL is invalid.";
  }

  return null;
}
