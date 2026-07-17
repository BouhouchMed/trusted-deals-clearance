import { NextRequest, NextResponse } from "next/server";
import { getAffiliateLinkBySlug } from "@/lib/affiliate-link-store";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const link = await getAffiliateLinkBySlug(slug);
  if (!link) return NextResponse.redirect(new URL("/", request.url));

  const destination = new URL(link.destinationUrl);
  await recordCustomAffiliateClick(request, slug, destination.hostname);

  return NextResponse.redirect(destination);
}

async function recordCustomAffiliateClick(request: NextRequest, slug: string, domain: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase.from("affiliate_clicks").insert({
      article_id: slug,
      source_page: request.headers.get("referer"),
      button_location: "custom_affiliate_link",
      destination_domain: domain,
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
