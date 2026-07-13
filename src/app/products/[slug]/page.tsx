import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Star, X } from "lucide-react";
import { CouponCopyButton, ShareDealButton, TrackedDealLink, WishlistButton } from "@/components/analytics/deal-actions";
import { ProductViewTracker } from "@/components/analytics/product-view-tracker";
import { ProductCard } from "@/components/product-card";
import { articles, currency, formatDate, getCategory, getDiscount, getStore, settings, siteUrl } from "@/lib/data";
import { getAllProducts, getProductBySlug } from "@/lib/product-store";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: { canonical: `${siteUrl}/products/${product.slug}` },
    openGraph: {
      title: product.seoTitle,
      description: product.seoDescription,
      images: [product.image],
      type: "article"
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const products = await getAllProducts();
  const store = getStore(product.storeId);
  const category = getCategory(product.categorySlug);
  const relatedProducts = products.filter((item) => item.categorySlug === product.categorySlug && item.slug !== product.slug).slice(0, 3);
  const relatedArticles = articles.filter((article) => article.categorySlug === product.categorySlug || article.productSlug === product.slug);
  const discount = getDiscount(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.gallery,
    description: product.shortDescription,
    brand: product.brand,
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: 128 },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.salePrice,
      availability: product.availability === "Expired" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${siteUrl}/products/${product.slug}`,
      priceValidUntil: product.expiration
    }
  };

  return (
    <article className="product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductViewTracker product={product} category={category?.title ?? product.categorySlug} store={store.name} />
      <nav className="breadcrumbs" aria-label="Breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/category/${category?.slug}`}>{category?.title}</Link>
        <span>/</span>
        <span>{product.title}</span>
      </nav>
      <section className="product-hero">
        <div className="gallery">
          <Image src={product.image} alt={product.title} fill priority sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <div className="product-summary">
          <span className="eyebrow">{store.name} Deal</span>
          <h1>{product.title}</h1>
          <div className="rating-line">
            <Star size={18} fill="currentColor" /> {product.rating} rating
            <span>{product.availability}</span>
          </div>
          <p>{product.longDescription}</p>
          <div className="price-panel">
            <span className="old-price">{currency(product.regularPrice)}</span>
            <strong>{currency(product.salePrice)}</strong>
            <span className="badge">{discount}% savings</span>
          </div>
          {product.couponCode ? (
            <CouponCopyButton
              product={product}
              category={category?.title ?? product.categorySlug}
              store={store.name}
              buttonLocation="product_page"
              couponCode={product.couponCode}
            />
          ) : null}
          <div className="action-row">
            <TrackedDealLink
              product={product}
              category={category?.title ?? product.categorySlug}
              store={store.name}
              buttonLocation="product_page"
            >
              View Deal
            </TrackedDealLink>
            <WishlistButton product={product} category={category?.title ?? product.categorySlug} store={store.name} buttonLocation="product_page" />
            <ShareDealButton product={product} category={category?.title ?? product.categorySlug} store={store.name} buttonLocation="product_page" />
          </div>
          <p className="fine-print">Deal expiration: {formatDate(product.expiration)}</p>
          <aside className="affiliate-note">{settings.affiliateDisclosure}</aside>
        </div>
      </section>
      <section className="details-grid">
        <InfoList title="Specifications" items={product.specs} icon="dot" />
        <InfoList title="Pros" items={product.pros} icon="check" />
        <InfoList title="Cons" items={product.cons} icon="x" />
        <InfoList title="Shopping Tips" items={product.tips} icon="dot" />
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>Related Products</h2>
        </div>
        <div className="deal-grid">
          {relatedProducts.map((item) => (
            <ProductCard product={item} buttonLocation="related_products" key={item.slug} />
          ))}
        </div>
      </section>
      <section className="section section-muted">
        <div className="section-heading">
          <h2>Related Articles</h2>
        </div>
        <div className="link-list">
          {relatedArticles.map((article) => (
            <Link href={`/blog/${article.slug}`} key={article.slug}>
              {article.title}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

function InfoList({ title, items, icon }: { title: string; items: string[]; icon: "check" | "x" | "dot" }) {
  return (
    <section className="info-card">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>
            {icon === "check" ? <Check size={16} /> : icon === "x" ? <X size={16} /> : <span />}
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
