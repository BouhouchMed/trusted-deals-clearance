import { NextRequest, NextResponse } from "next/server";
import { recordVisitorEvent } from "@/lib/analytics-store";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });

  try {
    await recordVisitorEvent({
      eventName: String(body.eventName ?? "PageView"),
      path: String(body.path ?? "/"),
      referrer: body.referrer ? String(body.referrer) : undefined,
      visitorId: body.visitorId ? String(body.visitorId) : undefined,
      userAgent: request.headers.get("user-agent") ?? undefined
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not record visitor event." }, { status: 400 });
  }
}
