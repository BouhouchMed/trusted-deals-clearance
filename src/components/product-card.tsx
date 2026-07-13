import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { currency, getDiscount, getStore } from "@/lib/data";
import { Product } from "@/lib/types";
import { TrackedDealLink } from "@/components/analytics/deal-actions";

export function ProductCard({ product, buttonLocation = "product_card" }: { product: Product; buttonLocation?: string }) {
  const store = getStore(product.storeId);
  const discount = getDiscount(product);

  return (
    <article className="deal-card">
      <Link href={`/products/${product.slug}`} className="deal-image">
        <Image src={product.image} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
        <span className="badge">{discount}% off</span>
      </Link>
      <div className="deal-content">
        <div className="store-line">
          <span className="store-logo">{store.logo}</span>
          <span>{store.name}</span>
          <span className="rating">
            <Star size={14} fill="currentColor" /> {product.rating}
          </span>
        </div>
        <h3>
          <Link href={`/products/${product.slug}`}>{product.title}</Link>
        </h3>
        <p>{product.shortDescription}</p>
        <div className="price-row">
          <span className="old-price">{currency(product.regularPrice)}</span>
          <strong>{currency(product.salePrice)}</strong>
        </div>
        <TrackedDealLink
          product={product}
          category={product.categorySlug}
          store={store.name}
          buttonLocation={buttonLocation}
          className="button button-small"
        >
          View Deal
        </TrackedDealLink>
      </div>
    </article>
  );
}
