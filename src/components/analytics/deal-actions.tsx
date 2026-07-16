"use client";

import Link from "next/link";
import { Heart, Share2 } from "lucide-react";
import { getDiscount } from "@/lib/data";
import { trackAddToWishlist, trackAffiliateClick, trackCouponCopy, trackCustomEvent, trackViewDeal } from "@/lib/meta-pixel";
import { Product } from "@/lib/types";

type DealActionProps = {
  product: Product;
  category: string;
  store: string;
  buttonLocation: string;
  className?: string;
  children?: React.ReactNode;
};

function eventPayload(product: Product, category: string, store: string, buttonLocation: string) {
  return {
    productId: product.id,
    productName: product.title,
    category,
    store,
    value: product.salePrice,
    regularPrice: product.regularPrice,
    salePrice: product.salePrice,
    discountPercentage: getDiscount(product),
    destinationUrl: `/go/${product.slug}`,
    affiliateNetwork: product.affiliateNetwork,
    buttonLocation,
    currency: "USD"
  };
}

export function TrackedDealLink({ product, category, store, buttonLocation, className = "button", children }: DealActionProps) {
  return (
    <Link
      className={className}
      href={`/go/${product.slug}?location=${encodeURIComponent(buttonLocation)}`}
      onClick={() => {
        const payload = eventPayload(product, category, store, buttonLocation);
        trackViewDeal(payload);
        trackAffiliateClick(payload);
      }}
    >
      {children ?? `Check price on ${formatRetailerName(store)}.com`}
    </Link>
  );
}

function formatRetailerName(store: string) {
  return store.replace(/\.com$/i, "");
}

export function CouponCopyButton({ product, category, store, couponCode }: DealActionProps & { couponCode: string }) {
  return (
    <button
      className="coupon-button"
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(couponCode).catch(() => undefined);
        trackCouponCopy({
          productId: product.id,
          productName: product.title,
          category,
          store,
          value: product.salePrice,
          currency: "USD",
          couponCode
        });
      }}
    >
      Copy Coupon: {couponCode}
    </button>
  );
}

export function WishlistButton({ product, category, store, buttonLocation }: DealActionProps) {
  return (
    <button
      className="icon-button"
      aria-label="Add to wishlist"
      type="button"
      onClick={() =>
        trackAddToWishlist({
          productId: product.id,
          productName: product.title,
          category,
          store,
          value: product.salePrice,
          currency: "USD",
          buttonLocation
        })
      }
    >
      <Heart />
    </button>
  );
}

export function ShareDealButton({ product, category, store, buttonLocation }: DealActionProps) {
  return (
    <button
      className="icon-button"
      aria-label="Share deal"
      type="button"
      onClick={() => {
        trackCustomEvent("ShareDeal", {
          product_id: product.id,
          product_name: product.title,
          category,
          store,
          button_location: buttonLocation
        });
        navigator.share?.({ title: product.title, url: `/products/${product.slug}` }).catch(() => undefined);
      }}
    >
      <Share2 />
    </button>
  );
}
