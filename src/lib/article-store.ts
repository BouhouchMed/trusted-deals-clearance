import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { articles as seedArticles } from "@/lib/data";
import { Article, CategorySlug } from "@/lib/types";

const adminArticlesPath = path.join(process.cwd(), "src", "lib", "admin-articles.json");

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
  try {
    const raw = await readFile(adminArticlesPath, "utf8");
    return JSON.parse(raw) as Article[];
  } catch {
    return [];
  }
}

export async function getAllArticles(): Promise<Article[]> {
  return [...(await getAdminArticles()), ...seedArticles];
}

export async function getArticleBySlug(slug: string) {
  const articles = await getAllArticles();
  return articles.find((article) => article.slug === slug);
}

export async function saveAdminArticle(input: ArticleInput) {
  const adminArticles = await getAdminArticles();
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

  await writeFile(adminArticlesPath, `${JSON.stringify([article, ...adminArticles], null, 2)}\n`, "utf8");
  return article;
}

export async function updateArticle(slug: string, input: ArticleInput) {
  const adminArticles = await getAdminArticles();
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

  const index = adminArticles.findIndex((article) => article.slug === slug);
  if (index >= 0) {
    const nextArticles = [...adminArticles];
    nextArticles[index] = updated;
    await writeFile(adminArticlesPath, `${JSON.stringify(nextArticles, null, 2)}\n`, "utf8");
  } else {
    await writeFile(adminArticlesPath, `${JSON.stringify([updated, ...adminArticles], null, 2)}\n`, "utf8");
  }

  return updated;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
