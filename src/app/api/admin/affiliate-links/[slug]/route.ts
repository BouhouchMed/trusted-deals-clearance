import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAuth } from "@/lib/admin-auth";
import { deleteAffiliateLink, updateAffiliateLink } from "@/lib/affiliate-link-store";

type Props = { params: Promise<{ slug: string }> };

export async function DELETE(request: NextRequest, { params }: Props) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  await deleteAffiliateLink(slug);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid affiliate link payload." }, { status: 400 });
  }

  const { slug } = await params;
  const record = body as Record<string, unknown>;
  try {
    const link = await updateAffiliateLink(slug, {
      destinationUrl: String(record.destinationUrl ?? ""),
      title: record.title ? String(record.title) : undefined
    });
    return NextResponse.json({ ok: true, link });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update affiliate link." }, { status: 400 });
  }
}
