import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/data";
import { getAllArticles } from "@/lib/article-store";
import { getAllCategories } from "@/lib/category-store";
import { getAllProducts } from "@/lib/product-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = (await getAllProducts()).filter((product) => product.published);
  const articles = await getAllArticles();
  const categories = await getAllCategories();
  const staticRoutes = ["", "/blog", "/about", "/contact", "/affiliate-disclosure", "/privacy-policy", "/terms", "/cookie-policy"];
  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "daily" as const : "monthly" as const,
      priority: route === "" ? 1 : 0.6
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(product.expiration),
      changeFrequency: "daily" as const,
      priority: product.featured ? 0.95 : 0.85
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
