import type { MetadataRoute } from "next";
import { categories, siteUrl } from "@/lib/data";
import { getAllArticles } from "@/lib/article-store";
import { getAllProducts } from "@/lib/product-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  const articles = await getAllArticles();
  const staticRoutes = ["", "/blog", "/about", "/contact", "/affiliate-disclosure", "/privacy-policy", "/terms", "/cookie-policy"];
  return [
    ...staticRoutes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: new Date() })),
    ...products.map((product) => ({ url: `${siteUrl}/products/${product.slug}`, lastModified: new Date(product.expiration) })),
    ...categories.map((category) => ({ url: `${siteUrl}/category/${category.slug}`, lastModified: new Date() })),
    ...articles.map((article) => ({ url: `${siteUrl}/blog/${article.slug}`, lastModified: new Date(article.publishedAt) }))
  ];
}
