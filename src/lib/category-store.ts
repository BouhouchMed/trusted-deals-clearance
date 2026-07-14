import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { categories as seedCategories } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Category } from "@/lib/types";

const adminCategoriesPath = path.join(process.cwd(), "src", "lib", "admin-categories.json");

export type CategoryInput = Category;
type StoredCategory = Category & { isDeleted?: boolean };

export async function getAdminCategories(): Promise<Category[]> {
  const storedCategories = await getStoredCategories();
  return storedCategories.filter((category) => !category.isDeleted).map(({ isDeleted: _isDeleted, ...category }) => category);
}

async function getStoredCategories(): Promise<StoredCategory[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("categories").select("*").order("title");
    if (!error && data?.length) return data.map(mapCategoryRow);
  }

  try {
    const raw = await readFile(adminCategoriesPath, "utf8");
    return JSON.parse(raw) as StoredCategory[];
  } catch {
    return [];
  }
}

export async function getAllCategories(): Promise<Category[]> {
  const storedCategories = await getStoredCategories();
  if (!storedCategories.length) return seedCategories;
  const deletedSlugs = new Set(storedCategories.filter((category) => category.isDeleted).map((category) => category.slug));
  const adminCategories = storedCategories.filter((category) => !category.isDeleted).map(({ isDeleted: _isDeleted, ...category }) => category);
  const adminSlugs = new Set(adminCategories.map((category) => category.slug));
  return [...adminCategories, ...seedCategories.filter((category) => !deletedSlugs.has(category.slug) && !adminSlugs.has(category.slug))];
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getAllCategories();
  return categories.find((category) => category.slug === slug);
}

export async function saveCategory(input: CategoryInput) {
  const category: Category = {
    slug: normalizeSlug(input.slug),
    title: input.title.trim(),
    description: input.description.trim(),
    image: input.image.trim(),
    icon: input.icon.trim() || "Sparkles"
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("categories").upsert({ ...mapCategoryToRow(category), is_deleted: false }, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return category;
  }

  const categories = await getStoredCategories();
  const index = categories.findIndex((item) => item.slug === category.slug);
  const nextCategories = index >= 0 ? categories.map((item) => (item.slug === category.slug ? category : item)) : [category, ...categories];
  await writeFile(adminCategoriesPath, `${JSON.stringify(nextCategories, null, 2)}\n`, "utf8");
  return category;
}

export async function deleteCategory(slug: string) {
  const categories = await getAllCategories();
  const existing = categories.find((category) => category.slug === slug);
  if (!existing) throw new Error("Category not found.");

  const isSeedCategory = seedCategories.some((category) => category.slug === slug);
  const supabase = getSupabaseAdmin();
  if (supabase) {
    if (isSeedCategory) {
      const { error } = await supabase.from("categories").upsert({ ...mapCategoryToRow(existing), is_deleted: true }, { onConflict: "slug" });
      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await supabase.from("categories").delete().eq("slug", slug);
    if (error) throw new Error(error.message);
    return;
  }

  const storedCategories = await getStoredCategories();
  const nextCategories = isSeedCategory
    ? [{ ...existing, isDeleted: true }, ...storedCategories.filter((category) => category.slug !== slug)]
    : storedCategories.filter((category) => category.slug !== slug);
  await writeFile(adminCategoriesPath, `${JSON.stringify(nextCategories, null, 2)}\n`, "utf8");
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CategoryRow = {
  slug: string;
  title: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  is_deleted?: boolean | null;
};

function mapCategoryRow(row: CategoryRow): StoredCategory {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    image: row.image ?? "",
    icon: row.icon ?? "Sparkles",
    isDeleted: Boolean(row.is_deleted)
  };
}

function mapCategoryToRow(category: Category): CategoryRow {
  return {
    slug: category.slug,
    title: category.title,
    description: category.description,
    image: category.image,
    icon: category.icon
  };
}
