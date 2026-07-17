import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAuth } from "@/lib/admin-auth";
import { deleteAffiliateLink } from "@/lib/affiliate-link-store";

type Props = { params: Promise<{ slug: string }> };

export async function DELETE(request: NextRequest, { params }: Props) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  await deleteAffiliateLink(slug);
  return NextResponse.json({ ok: true });
}
