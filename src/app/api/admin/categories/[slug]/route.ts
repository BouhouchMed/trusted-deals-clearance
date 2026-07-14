import { NextResponse } from "next/server";
import { requireAdminApiAuth } from "@/lib/admin-auth";
import { deleteCategory } from "@/lib/category-store";

type Props = { params: Promise<{ slug: string }> };

export async function DELETE(_request: Request, { params }: Props) {
  const unauthorized = requireAdminApiAuth(_request);
  if (unauthorized) return unauthorized;

  const { slug } = await params;

  try {
    await deleteCategory(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete category." }, { status: 400 });
  }
}
