import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AffiliateRedirectLanding } from "@/components/affiliate-redirect-landing";
import { getAffiliateLinkBySlug } from "@/lib/affiliate-link-store";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Redirecting | Trusted Deals & Clearance",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AffiliateRedirectPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const link = await getAffiliateLinkBySlug(slug);
  if (!link) redirect("/");

  const requestHeaders = await headers();
  const destination = new URL(link.destinationUrl);
  await recordCustomAffiliateClick({
    slug,
    domain: destination.hostname,
    referer: requestHeaders.get("referer"),
    userAgent: requestHeaders.get("user-agent") ?? "",
    query
  });

  return <AffiliateRedirectLanding destinationUrl={link.destinationUrl} destinationDomain={destination.hostname.replace(/^www\./, "")} />;
}

async function recordCustomAffiliateClick(input: {
  slug: string;
  domain: string;
  referer: string | null;
  userAgent: string;
  query: Record<string, string | string[] | undefined>;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase.from("affiliate_clicks").insert({
      article_id: input.slug,
      source_page: input.referer,
      button_location: "custom_affiliate_link",
      destination_domain: input.domain,
      utm_source: getQueryValue(input.query.utm_source),
      utm_medium: getQueryValue(input.query.utm_medium),
      utm_campaign: getQueryValue(input.query.utm_campaign),
      utm_content: getQueryValue(input.query.utm_content),
      referrer: input.referer,
      device_type: getDeviceType(input.userAgent)
    });
  } catch {
    return;
  }
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getDeviceType(userAgent: string) {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
}
