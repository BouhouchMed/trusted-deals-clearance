import { NextResponse } from "next/server";
import { deleteCategory } from "@/lib/category-store";

type Props = { params: Promise<{ slug: string }> };

export async function DELETE(_request: Request, { params }: Props) {
  const { slug } = await params;

  try {
    await deleteCategory(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete category." }, { status: 400 });
  }
}
