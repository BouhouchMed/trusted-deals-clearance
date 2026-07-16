import { Product } from "@/lib/types";

export function getRelatedProducts(products: Product[], options: { categorySlug?: string; excludeSlug?: string; limit?: number }) {
  const limit = options.limit ?? 3;
  const publishedProducts = products.filter((product) => product.published && product.slug !== options.excludeSlug);
  const related = publishedProducts.filter((product) => product.categorySlug === options.categorySlug);

  if (related.length >= limit) return related.slice(0, limit);

  const relatedSlugs = new Set(related.map((product) => product.slug));
  const fallback = publishedProducts
    .filter((product) => !relatedSlugs.has(product.slug))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.trending) - Number(a.trending) || b.salePrice - a.salePrice);

  return [...related, ...fallback].slice(0, limit);
}
