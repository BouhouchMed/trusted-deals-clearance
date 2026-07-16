import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { CommunityLink } from "@/components/analytics/community-link";
import { CategoryIcon } from "@/components/category-icon";
import { HeroSlider } from "@/components/hero-slider";
import { NewsletterForm } from "@/components/newsletter-form";
import { PartnersSlider } from "@/components/partners-slider";
import { ProductCard } from "@/components/product-card";
import { settings, siteUrl } from "@/lib/data";
import { getAllArticles } from "@/lib/article-store";
import { getAllCategories } from "@/lib/category-store";
import { getAllProducts } from "@/lib/product-store";
import { itemListJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Walmart Deals, Clearance Finds & Daily Shopping Offers",
  description:
    "Find current Walmart deals, clearance markdowns, home deals, electronics offers, furniture savings, fashion discounts, and practical shopping guides for US shoppers.",
  alternates: { canonical: siteUrl }
};

export default async function HomePage() {
  const siteConfig = await getSiteConfig();
  const products = await getAllProducts();
  const articles = await getAllArticles();
  const categories = await getAllCategories();
  const home = siteConfig.homepage;
  const todaysDeals = products.filter((product) => product.published).slice(0, 6);
  const trending = products.filter((product) => product.trending);
  const jsonLd = itemListJsonLd(
    "Featured Daily Deals",
    todaysDeals.map((product) => ({
      name: product.title,
      url: `${siteUrl}/products/${product.slug}`,
      image: product.image
    }))
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {home.showHero ? <HeroSlider products={products} /> : null}
      {home.showCategories ? (
        <section className="section">
          <div className="section-heading">
            <span className="eyebrow">{home.categoriesEyebrow}</span>
            <h2>{home.categoriesTitle}</h2>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link className="category-card" href={`/category/${category.slug}`} key={category.slug}>
                <Image src={category.image} alt={category.title} fill sizes="(max-width: 768px) 100vw, 25vw" />
                <span className="category-icon">
                  <CategoryIcon name={category.icon} />
                </span>
                <strong>{category.title}</strong>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {home.showTodaysDeals ? (
        <section className="section section-muted">
          <div className="section-heading">
            <span className="eyebrow">{home.todaysDealsEyebrow}</span>
            <h2>{home.todaysDealsTitle}</h2>
          </div>
          <div className="deal-grid">
            {todaysDeals.map((product) => (
              <ProductCard product={product} buttonLocation="homepage_featured" key={product.slug} />
            ))}
          </div>
        </section>
      ) : null}
      {home.showTrendingDeals ? (
        <section className="section">
          <div className="section-heading">
            <span className="eyebrow">{home.trendingEyebrow}</span>
            <h2>{home.trendingTitle}</h2>
          </div>
          <div className="horizontal-scroll">
            {trending.map((product) => (
              <ProductCard product={product} buttonLocation="trending_section" key={product.slug} />
            ))}
          </div>
        </section>
      ) : null}
      {home.showLatestArticles ? (
        <section className="section section-muted">
          <div className="section-heading">
            <span className="eyebrow">{home.articlesEyebrow}</span>
            <h2>{home.articlesTitle}</h2>
          </div>
          <div className="article-grid">
            {articles.map((article) => (
              <Link href={`/blog/${article.slug}`} className="article-card" key={article.slug}>
                <Image src={article.image} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                <div>
                  <span>{article.tags[0]}</span>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {home.showCommunity ? (
        <section className="community-section" id="community">
          <div>
            <span className="eyebrow">{home.communityEyebrow}</span>
            <h2>{home.communityTitle}</h2>
            <p>{home.communityText}</p>
            <CommunityLink href={settings.facebookUrl} location="homepage_community" />
          </div>
        </section>
      ) : null}
      {home.showNewsletter ? (
        <section className="newsletter">
          <div>
            <Mail size={28} />
            <h2>{home.newsletterTitle}</h2>
            <p>{home.newsletterText}</p>
          </div>
          <NewsletterForm source="homepage" />
        </section>
      ) : null}
      <PartnersSlider />
    </>
  );
}
