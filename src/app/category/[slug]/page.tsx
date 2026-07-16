import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryFilters } from "@/components/category-filters";
import { ProductCard } from "@/components/product-card";
import { getDiscount, siteUrl } from "@/lib/data";
import { getAllArticles } from "@/lib/article-store";
import { getAllCategories, getCategoryBySlug } from "@/lib/category-store";
import { getAllProducts } from "@/lib/product-store";
import { breadcrumbsJsonLd, itemListJsonLd } from "@/lib/seo";
import { Product } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ price?: string; store?: string; brand?: string; discount?: string; sort?: string }>;
};

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.title} Deals`,
    description: category.description,
    alternates: { canonical: `${siteUrl}/category/${category.slug}` },
    openGraph: {
      title: `${category.title} Deals`,
      description: category.description,
      url: `${siteUrl}/category/${category.slug}`,
      images: [category.image],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.title} Deals`,
      description: category.description,
      images: [category.image]
    }
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const filters = (await searchParams) ?? {};
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getAllProducts();
  const allArticles = await getAllArticles();
  const categoryProducts = applyCategoryFilters(
    products.filter((product) => product.categorySlug === category.slug || category.slug === "top-deals"),
    filters
  );
  const latestArticles = allArticles.filter((article) => article.categorySlug === category.slug);
  const jsonLd = [
    breadcrumbsJsonLd([
      { name: "Home", url: siteUrl },
      { name: category.title, url: `${siteUrl}/category/${category.slug}` }
    ]),
    itemListJsonLd(
      `${category.title} Deals`,
      categoryProducts.slice(0, 20).map((product) => ({
        name: product.title,
        url: `${siteUrl}/products/${product.slug}`,
        image: product.image
      }))
    )
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="category-hero">
        <Image src={category.image} alt="" fill priority sizes="100vw" />
        <div>
          <span className="eyebrow">Category</span>
          <h1>{category.title}</h1>
          <p>{category.description}</p>
        </div>
      </section>
      <CategoryFilters />
      <section className="section">
        <div className="section-heading">
          <h2>Latest Products</h2>
        </div>
        <div className="deal-grid">
          {categoryProducts.map((product) => (
            <ProductCard product={product} buttonLocation="category_page" key={product.slug} />
          ))}
        </div>
        {categoryProducts.length === 0 ? <p>No deals match these filters.</p> : null}
      </section>
      <section className="section section-muted">
        <div className="section-heading">
          <h2>Latest Articles</h2>
        </div>
        <div className="link-list">
          {latestArticles.map((article) => (
            <a href={`/blog/${article.slug}`} key={article.slug}>
              {article.title}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function applyCategoryFilters(
  products: Product[],
  filters: { price?: string; store?: string; brand?: string; discount?: string; sort?: string }
) {
  const filtered = products.filter((product) => {
    if (filters.price === "under-50" && product.salePrice >= 50) return false;
    if (filters.price === "50-150" && (product.salePrice < 50 || product.salePrice > 150)) return false;
    if (filters.price === "150-plus" && product.salePrice <= 150) return false;
    if (filters.store && product.storeId !== filters.store) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.discount === "20" && getDiscount(product) < 20) return false;
    if (filters.discount === "40" && getDiscount(product) < 40) return false;
    if (filters.discount === "clearance" && !product.clearance) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === "lowest-price") return a.salePrice - b.salePrice;
    if (filters.sort === "highest-discount") return getDiscount(b) - getDiscount(a);
    if (filters.sort === "top-rated") return b.rating - a.rating;
    return Number(b.featured) - Number(a.featured);
  });
}
