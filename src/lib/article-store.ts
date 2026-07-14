import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { articles as seedArticles } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { Article, CategorySlug } from "@/lib/types";

const adminArticlesPath = path.join(process.cwd(), "src", "lib", "admin-articles.json");

type StoredArticle = Article & { isDeleted?: boolean };

export type ArticleInput = {
  title: string;
  slug?: string;
  excerpt: string;
  categorySlug: CategorySlug;
  productSlug?: string;
  image: string;
  author: string;
  tags: string[];
};

export async function getAdminArticles(): Promise<Article[]> {
  const storedArticles = await getStoredArticles();
  return storedArticles.filter((article) => !article.isDeleted).map(({ isDeleted: _isDeleted, ...article }) => article);
}

async function getStoredArticles(): Promise<StoredArticle[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("articles").select("*").order("published_at", { ascending: false });
    if (!error && data) return data.map(mapArticleRow);
  }

  try {
    const raw = await readFile(adminArticlesPath, "utf8");
    return JSON.parse(raw) as StoredArticle[];
  } catch {
    return [];
  }
}

export async function getAllArticles(): Promise<Article[]> {
  const storedArticles = await getStoredArticles();
  const deletedSlugs = new Set(storedArticles.filter((article) => article.isDeleted).map((article) => article.slug));
  const adminArticles = storedArticles.filter((article) => !article.isDeleted).map(({ isDeleted: _isDeleted, ...article }) => article);
  const adminSlugs = new Set(adminArticles.map((article) => article.slug));
  return [...adminArticles, ...seedArticles.filter((article) => !deletedSlugs.has(article.slug) && !adminSlugs.has(article.slug))];
}

export async function getArticleBySlug(slug: string) {
  const articles = await getAllArticles();
  return articles.find((article) => article.slug === slug);
}

export async function saveAdminArticle(input: ArticleInput) {
  const storedArticles = await getStoredArticles();
  const allArticles = await getAllArticles();
  const slug = normalizeSlug(input.slug || input.title);

  if (allArticles.some((article) => article.slug === slug)) {
    throw new Error("An article with this slug already exists.");
  }

  const article: Article = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    categorySlug: input.categorySlug,
    productSlug: input.productSlug?.trim() || undefined,
    image: input.image.trim(),
    author: input.author.trim() || "Trusted Deals Editors",
    publishedAt: new Date().toISOString().slice(0, 10),
    tags: input.tags.length ? input.tags : ["Shopping Guide"]
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("articles").upsert({ ...mapArticleToRow(article), is_deleted: false }, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return article;
  }

  await writeFile(adminArticlesPath, `${JSON.stringify([article, ...storedArticles.filter((item) => item.slug !== slug)], null, 2)}\n`, "utf8");
  return article;
}

export async function updateArticle(slug: string, input: ArticleInput) {
  const storedArticles = await getStoredArticles();
  const allArticles = await getAllArticles();
  const existing = allArticles.find((article) => article.slug === slug);
  if (!existing) throw new Error("Article not found.");

  const nextSlug = normalizeSlug(input.slug || input.title);
  if (nextSlug !== slug && allArticles.some((article) => article.slug === nextSlug)) {
    throw new Error("An article with this slug already exists.");
  }

  const updated: Article = {
    ...existing,
    slug: nextSlug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    categorySlug: input.categorySlug,
    productSlug: input.productSlug?.trim() || undefined,
    image: input.image.trim(),
    author: input.author.trim() || "Trusted Deals Editors",
    tags: input.tags.length ? input.tags : ["Shopping Guide"]
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("articles").upsert({ ...mapArticleToRow(updated), is_deleted: false }, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return updated;
  }

  const adminArticles = storedArticles.filter((article) => !article.isDeleted);
  const index = storedArticles.findIndex((article) => article.slug === slug);
  if (index >= 0) {
    const nextArticles = [...storedArticles];
    nextArticles[index] = updated;
    await writeFile(adminArticlesPath, `${JSON.stringify(nextArticles, null, 2)}\n`, "utf8");
  } else {
    await writeFile(adminArticlesPath, `${JSON.stringify([updated, ...adminArticles], null, 2)}\n`, "utf8");
  }

  return updated;
}

export async function deleteArticle(slug: string) {
  const allArticles = await getAllArticles();
  const existing = allArticles.find((article) => article.slug === slug);
  if (!existing) throw new Error("Article not found.");

  const isSeedArticle = seedArticles.some((article) => article.slug === slug);
  const supabase = getSupabaseAdmin();
  if (supabase) {
    if (isSeedArticle) {
      const { error } = await supabase.from("articles").upsert({ ...mapArticleToRow(existing), is_deleted: true }, { onConflict: "slug" });
      if (error) throw new Error(error.message);
      return;
    }

    const { error } = await supabase.from("articles").delete().eq("slug", slug);
    if (error) throw new Error(error.message);
    return;
  }

  const storedArticles = await getStoredArticles();
  const nextArticles = isSeedArticle
    ? [{ ...existing, isDeleted: true }, ...storedArticles.filter((article) => article.slug !== slug)]
    : storedArticles.filter((article) => article.slug !== slug);
  await writeFile(adminArticlesPath, `${JSON.stringify(nextArticles, null, 2)}\n`, "utf8");
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ArticleRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  category_slug: CategorySlug;
  product_slug: string | null;
  image: string | null;
  author: string | null;
  published_at: string | null;
  tags: string[] | null;
  is_deleted?: boolean | null;
};

function mapArticleRow(row: ArticleRow): StoredArticle {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    categorySlug: row.category_slug,
    productSlug: row.product_slug ?? undefined,
    image: row.image ?? "",
    author: row.author ?? "Trusted Deals Editors",
    publishedAt: row.published_at ?? new Date().toISOString().slice(0, 10),
    tags: row.tags ?? [],
    isDeleted: Boolean(row.is_deleted)
  };
}

function mapArticleToRow(article: Article): ArticleRow {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category_slug: article.categorySlug,
    product_slug: article.productSlug ?? null,
    image: article.image,
    author: article.author,
    published_at: article.publishedAt,
    tags: article.tags
  };
}
