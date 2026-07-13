import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const supportedEvents = new Set([
  "ViewContent",
  "Search",
  "Lead",
  "Subscribe",
  "Contact",
  "CompleteRegistration",
  "AffiliateClick",
  "ViewDeal"
]);

type MetaEventRequest = {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  payload?: Record<string, unknown>;
  userData?: {
    email?: string;
    phone?: string;
  };
};

export async function POST(request: NextRequest) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  if (!pixelId || !token) return NextResponse.json({ ok: false, skipped: "missing_configuration" }, { status: 202 });

  const body = (await request.json().catch(() => null)) as MetaEventRequest | null;
  if (!body || !supportedEvents.has(body.eventName) || !body.eventId) {
    return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const event = {
    event_name: body.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.eventId,
    event_source_url: body.eventSourceUrl,
    action_source: "website",
    user_data: {
      client_user_agent: userAgent,
      client_ip_address: clientIp,
      fbp: request.cookies.get("_fbp")?.value,
      fbc: request.cookies.get("_fbc")?.value,
      em: body.userData?.email ? hash(body.userData.email) : undefined,
      ph: body.userData?.phone ? hash(body.userData.phone) : undefined
    },
    custom_data: body.payload ?? {}
  };

  const url = new URL(`https://graph.facebook.com/v20.0/${pixelId}/events`);
  url.searchParams.set("access_token", token);
  if (process.env.META_TEST_EVENT_CODE) url.searchParams.set("test_event_code", process.env.META_TEST_EVENT_CODE);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] })
    });
    return NextResponse.json({ ok: response.ok }, { status: response.ok ? 200 : 202 });
  } catch {
    return NextResponse.json({ ok: false, skipped: "network_or_meta_error" }, { status: 202 });
  }
}

function hash(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}
