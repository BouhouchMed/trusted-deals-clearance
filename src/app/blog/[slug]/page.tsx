import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getAllArticles, getArticleBySlug } from "@/lib/article-store";
import { formatDate, getCategory, siteUrl } from "@/lib/data";
import { getAllProducts } from "@/lib/product-store";
import { getRelatedProducts } from "@/lib/related-products";
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
  const relatedProducts = getRelatedProducts(products, { categorySlug: article.categorySlug, limit: 3 });
  const articleContent = article.content?.trim() || getDefaultArticleContent();
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
        {renderArticleContent(articleContent)}
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

function getDefaultArticleContent() {
  return `Smart deal shopping starts with a simple question: would this item still make sense without the markdown? Our editors look for products with practical use, clear availability, recognizable stores, and pricing that feels meaningfully better than the usual online noise.

Before buying, compare the sale price against nearby retailers, check whether pickup or shipping changes the final cost, and read the return policy carefully for clearance or limited-stock items.

## What to Check Before Checkout
- Price history and whether the discount is meaningful.
- Coupon codes, store cash, or card offers that can stack.
- Delivery windows, pickup ZIP code availability, and return rules.`;
}

function renderArticleContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block, index) => renderArticleBlock(block.trim(), index))
    .filter(Boolean);
}

function renderArticleBlock(block: string, index: number) {
  if (!block) return null;

  if (block.startsWith("### ")) return <h3 key={index}>{renderInlineMarkdown(block.slice(4))}</h3>;
  if (block.startsWith("## ")) return <h2 key={index}>{renderInlineMarkdown(block.slice(3))}</h2>;
  if (block.startsWith("> ")) return <blockquote key={index}>{renderInlineMarkdown(block.replace(/^> /gm, ""))}</blockquote>;

  const imageMatch = block.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/i);
  if (imageMatch) {
    return (
      <figure className="article-inline-image" key={index}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageMatch[2]} alt={imageMatch[1]} />
        {imageMatch[1] ? <figcaption>{imageMatch[1]}</figcaption> : null}
      </figure>
    );
  }

  if (block.startsWith("- ")) {
    return (
      <ul key={index}>
        {block.split("\n").map((item) => (
          <li key={item}>{renderInlineMarkdown(item.replace(/^- /, ""))}</li>
        ))}
      </ul>
    );
  }

  return <p key={index}>{renderInlineMarkdown(block)}</p>;
}

function renderInlineMarkdown(text: string) {
  const tokens = text.split(/(\[[^\]]+\]\(https?:\/\/[^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return tokens.map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/i);
    if (link) {
      return (
        <a href={link[2]} key={`${token}-${index}`} target="_blank" rel="nofollow sponsored noreferrer">
          {link[1]}
        </a>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={`${token}-${index}`}>{token.slice(2, -2)}</strong>;
    if (token.startsWith("*") && token.endsWith("*")) return <em key={`${token}-${index}`}>{token.slice(1, -1)}</em>;
    return token;
  });
}
