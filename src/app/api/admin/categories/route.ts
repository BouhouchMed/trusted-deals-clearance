import { NextRequest, NextResponse } from "next/server";
import { saveCategory } from "@/lib/category-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid category payload." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  for (const key of ["slug", "title", "description", "image", "icon"]) {
    if (!record[key]) return NextResponse.json({ error: `${key} is required.` }, { status: 400 });
  }

  try {
    const category = await saveCategory({
      slug: String(record.slug),
      title: String(record.title),
      description: String(record.description),
      image: String(record.image),
      icon: String(record.icon)
    });
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save category." }, { status: 400 });
  }
}
