import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAuth } from "@/lib/admin-auth";
import { createAffiliateLink, getAffiliateLinks } from "@/lib/affiliate-link-store";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json(await getAffiliateLinks());
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid affiliate link payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  try {
    const link = await createAffiliateLink({
      destinationUrl: String(record.destinationUrl ?? ""),
      title: record.title ? String(record.title) : undefined
    });
    return NextResponse.json({ ok: true, link }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create affiliate link." }, { status: 400 });
  }
}
