import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCategory, getStore } from "@/lib/data";
import { getProductBySlug } from "@/lib/product-store";
import { Product } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return NextResponse.redirect(new URL("/", request.url));

  const destination = getSafeDestination(product.affiliateUrl);
  if (!destination) {
    return NextResponse.redirect(new URL(`/products/${product.slug}`, request.url));
  }

  const location = request.nextUrl.searchParams.get("location") ?? "unknown";
  await recordAffiliateClick(request, product, destination.hostname, location);

  return NextResponse.redirect(destination);
}

function getSafeDestination(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url;
  } catch {
    return null;
  }
}

async function recordAffiliateClick(request: NextRequest, product: Product, domain: string, location: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  try {
    const store = getStore(product.storeId);
    const category = getCategory(product.categorySlug);
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    await supabase.from("affiliate_clicks").insert({
      product_id: product.id,
      store_id: store.id,
      category_id: category?.slug,
      source_page: request.headers.get("referer"),
      button_location: location,
      destination_domain: domain,
      session_id: request.cookies.get("tdc_session_id")?.value,
      utm_source: request.nextUrl.searchParams.get("utm_source"),
      utm_medium: request.nextUrl.searchParams.get("utm_medium"),
      utm_campaign: request.nextUrl.searchParams.get("utm_campaign"),
      utm_content: request.nextUrl.searchParams.get("utm_content"),
      referrer: request.headers.get("referer"),
      device_type: getDeviceType(request.headers.get("user-agent") ?? "")
    });
  } catch {
    return;
  }
}

function getDeviceType(userAgent: string) {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
}
