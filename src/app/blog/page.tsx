import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteUrl } from "@/lib/data";
import { getAllArticles } from "@/lib/article-store";

export const metadata: Metadata = {
  title: "Shopping Guides, Reviews & Seasonal Deals",
  description: "Buying guides, product reviews, seasonal deals, holiday deals, and gift guides for practical American shoppers.",
  alternates: { canonical: `${siteUrl}/blog` }
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const articles = await getAllArticles();
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">The Deal Desk</span>
        <h1>Shopping Guides & Product Reviews</h1>
      </div>
      <div className="article-grid">
        {articles.map((article) => (
          <Link href={`/blog/${article.slug}`} className="article-card" key={article.slug}>
            <Image src={article.image} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
            <div>
              <span>{article.tags.join(" / ")}</span>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
