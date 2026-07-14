import type { Metadata } from "next";
import Link from "next/link";
import { SearchTracker } from "@/components/analytics/search-tracker";
import { ProductCard } from "@/components/product-card";
import { siteUrl } from "@/lib/data";
import { getAllArticles } from "@/lib/article-store";
import { getAllCategories } from "@/lib/category-store";
import { getAllProducts } from "@/lib/product-store";

export const metadata: Metadata = {
  title: "Search Deals",
  description: "Search products, articles, categories, Walmart deals, electronics offers, and clearance finds.",
  alternates: { canonical: `${siteUrl}/search` }
};

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return <SearchContent searchParams={searchParams} />;
}

async function SearchContent({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.toLowerCase();
  const products = await getAllProducts();
  const articles = await getAllArticles();
  const categories = await getAllCategories();
  const matchedProducts = products.filter((product) => `${product.title} ${product.brand} ${product.shortDescription}`.toLowerCase().includes(term));
  const matchedArticles = articles.filter((article) => `${article.title} ${article.excerpt} ${article.tags.join(" ")}`.toLowerCase().includes(term));
  const matchedCategories = categories.filter((category) => `${category.title} ${category.description}`.toLowerCase().includes(term));

  return (
    <section className="section">
      <SearchTracker query={q} />
      <div className="section-heading">
        <span className="eyebrow">Global search</span>
        <h1>{q ? `Results for "${q}"` : "Search Products, Articles & Categories"}</h1>
      </div>
      <div className="deal-grid">
        {matchedProducts.map((product) => (
          <ProductCard product={product} key={product.slug} />
        ))}
      </div>
      <div className="search-columns">
        <section className="info-card">
          <h2>Articles</h2>
          {matchedArticles.map((article) => (
            <Link href={`/blog/${article.slug}`} key={article.slug}>
              {article.title}
            </Link>
          ))}
        </section>
        <section className="info-card">
          <h2>Categories</h2>
          {matchedCategories.map((category) => (
            <Link href={`/category/${category.slug}`} key={category.slug}>
              {category.title}
            </Link>
          ))}
        </section>
      </div>
    </section>
  );
}
