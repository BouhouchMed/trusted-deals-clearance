import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAuth } from "@/lib/admin-auth";
import { getSecondaryAdminSettings, saveSecondaryAdminSettings } from "@/lib/admin-users-store";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json(await getSecondaryAdminSettings());
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid admin user payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  try {
    const settings = await saveSecondaryAdminSettings({
      displayName: String(record.displayName ?? "Second Admin"),
      enabled: Boolean(record.enabled),
      password: record.password ? String(record.password) : undefined,
      username: String(record.username ?? "admin2")
    });
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save admin user." }, { status: 400 });
  }
}
