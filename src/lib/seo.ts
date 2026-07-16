import { siteUrl } from "@/lib/data";
import { Article, Category, Product, Store } from "@/lib/types";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Trusted Deals & Clearance",
    url: siteUrl,
    logo: `${siteUrl}/LOGO.png`,
    sameAs: ["https://www.facebook.com/groups/1998003327099051"]
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Trusted Deals & Clearance",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function productJsonLd(product: Product, store: Store) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.gallery.length ? product.gallery : [product.image],
    description: product.seoDescription || product.shortDescription,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.id,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: 128
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.salePrice,
      priceValidUntil: product.expiration,
      availability: product.availability === "Expired" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: store.name }
    }
  };
}

export function breadcrumbsJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function articleJsonLd(article: Article, category?: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [article.image],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Trusted Deals & Clearance",
      logo: { "@type": "ImageObject", url: `${siteUrl}/LOGO.png` }
    },
    articleSection: category?.title,
    mainEntityOfPage: `${siteUrl}/blog/${article.slug}`
  };
}

export function itemListJsonLd(name: string, items: Array<{ name: string; url: string; image?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name,
      image: item.image
    }))
  };
}
