import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAuth } from "@/lib/admin-auth";
import { getSiteConfig, mergeConfig, saveSiteConfig } from "@/lib/site-config";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json(await getSiteConfig());
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
  }

  const config = mergeConfig(body);
  await saveSiteConfig(config);
  return NextResponse.json({ ok: true, config });
}
