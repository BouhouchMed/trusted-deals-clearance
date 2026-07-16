import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getAllArticles, getArticleBySlug } from "@/lib/article-store";
import { formatDate, getCategory, siteUrl } from "@/lib/data";
import { getAllProducts } from "@/lib/product-store";
import { articleJsonLd, breadcrumbsJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `${siteUrl}/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${siteUrl}/blog/${article.slug}`,
      images: [article.image],
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image]
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const category = getCategory(article.categorySlug);
  const products = await getAllProducts();
  const relatedProducts = products.filter((product) => product.categorySlug === article.categorySlug).slice(0, 3);
  const jsonLd = [
    articleJsonLd(article, category),
    breadcrumbsJsonLd([
      { name: "Home", url: siteUrl },
      { name: "Blog", url: `${siteUrl}/blog` },
      { name: article.title, url: `${siteUrl}/blog/${article.slug}` }
    ])
  ];

  return (
    <article className="article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="article-hero">
        <Image src={article.image} alt={article.title} fill priority sizes="100vw" />
        <div>
          <Link href={`/category/${category?.slug}`} className="eyebrow">
            {category?.title}
          </Link>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <span>
            {article.author} / {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>
      <div className="article-body">
        <p>
          Smart deal shopping starts with a simple question: would this item still make sense without the markdown? Our
          editors look for products with practical use, clear availability, recognizable stores, and pricing that feels
          meaningfully better than the usual online noise.
        </p>
        <p>
          Before buying, compare the sale price against nearby retailers, check whether pickup or shipping changes the
          final cost, and read the return policy carefully for clearance or limited-stock items.
        </p>
        <h2>What to Check Before Checkout</h2>
        <ul>
          <li>Price history and whether the discount is meaningful.</li>
          <li>Coupon codes, store cash, or card offers that can stack.</li>
          <li>Delivery windows, pickup ZIP code availability, and return rules.</li>
        </ul>
      </div>
      <section className="section section-muted">
        <div className="section-heading">
          <h2>Related Deals</h2>
        </div>
        <div className="deal-grid">
          {relatedProducts.map((product) => (
            <ProductCard product={product} buttonLocation="article_page" key={product.slug} />
          ))}
        </div>
      </section>
    </article>
  );
}
