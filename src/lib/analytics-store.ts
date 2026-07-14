import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const analyticsEventsPath = path.join(process.cwd(), "src", "lib", "analytics-events.json");

export type VisitorEventInput = {
  eventName: string;
  path: string;
  referrer?: string;
  visitorId?: string;
  userAgent?: string;
};

export type AnalyticsSummary = {
  pageViews: number;
  uniqueVisitors: number;
  affiliateClicks: number;
  communityClicks: number;
  newsletterConversions: number;
  topPage: string;
  topStore: string;
  lastUpdated: string;
};

type StoredVisitorEvent = VisitorEventInput & {
  createdAt: string;
};

type VisitorEventRow = {
  event_name: string;
  path: string;
  referrer: string | null;
  visitor_id: string | null;
  user_agent: string | null;
  created_at: string;
};

type AffiliateClickRow = {
  store_id: string | null;
};

export async function recordVisitorEvent(input: VisitorEventInput) {
  const event: StoredVisitorEvent = {
    eventName: input.eventName.trim() || "PageView",
    path: input.path.trim() || "/",
    referrer: input.referrer?.trim() || undefined,
    visitorId: input.visitorId?.trim() || undefined,
    userAgent: input.userAgent?.trim() || undefined,
    createdAt: new Date().toISOString()
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("visitor_events").insert(mapVisitorEventToRow(event));
    if (error) throw new Error(error.message);
    return;
  }

  const events = await getLocalVisitorEvents();
  const nextEvents = [event, ...events].slice(0, 5000);
  await writeFile(analyticsEventsPath, `${JSON.stringify(nextEvents, null, 2)}\n`, "utf8");
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [visitorEvents, affiliateClicks] = await Promise.all([getVisitorEvents(), getAffiliateClicks()]);
  const pageViews = visitorEvents.filter((event) => event.eventName === "PageView").length;
  const uniqueVisitors = new Set(visitorEvents.map((event) => event.visitorId).filter(Boolean)).size;
  const communityClicks = visitorEvents.filter((event) => event.eventName === "JoinFacebookCommunity").length;
  const newsletterConversions = visitorEvents.filter((event) => event.eventName === "Subscribe" || event.eventName === "DealAlertSignup").length;

  return {
    pageViews,
    uniqueVisitors,
    affiliateClicks: affiliateClicks.length,
    communityClicks,
    newsletterConversions,
    topPage: getMostCommon(visitorEvents.map((event) => event.path).filter(Boolean)) ?? "/",
    topStore: getMostCommon(affiliateClicks.map((click) => click.store_id).filter((storeId): storeId is string => Boolean(storeId))) ?? "No clicks yet",
    lastUpdated: new Date().toISOString()
  };
}

async function getVisitorEvents(): Promise<StoredVisitorEvent[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("visitor_events").select("*").order("created_at", { ascending: false }).limit(5000);
    if (!error && data) return data.map(mapVisitorEventRow);
  }

  return getLocalVisitorEvents();
}

async function getAffiliateClicks(): Promise<AffiliateClickRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data, error } = await supabase.from("affiliate_clicks").select("store_id").order("created_at", { ascending: false }).limit(5000);
  if (error || !data) return [];
  return data as AffiliateClickRow[];
}

async function getLocalVisitorEvents(): Promise<StoredVisitorEvent[]> {
  try {
    const raw = await readFile(analyticsEventsPath, "utf8");
    return JSON.parse(raw) as StoredVisitorEvent[];
  } catch {
    return [];
  }
}

function getMostCommon(values: string[]) {
  if (!values.length) return undefined;
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function mapVisitorEventRow(row: VisitorEventRow): StoredVisitorEvent {
  return {
    eventName: row.event_name,
    path: row.path,
    referrer: row.referrer ?? undefined,
    visitorId: row.visitor_id ?? undefined,
    userAgent: row.user_agent ?? undefined,
    createdAt: row.created_at
  };
}

function mapVisitorEventToRow(event: StoredVisitorEvent): VisitorEventRow {
  return {
    event_name: event.eventName,
    path: event.path,
    referrer: event.referrer ?? null,
    visitor_id: event.visitorId ?? null,
    user_agent: event.userAgent ?? null,
    created_at: event.createdAt
  };
}
