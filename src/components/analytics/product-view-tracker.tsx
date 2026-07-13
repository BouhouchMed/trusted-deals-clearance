"use client";

import { useEffect } from "react";
import { trackExpiredDealView, trackViewContent } from "@/lib/meta-pixel";
import { Product } from "@/lib/types";

export function ProductViewTracker({ product, category, store }: { product: Product; category: string; store: string }) {
  useEffect(() => {
    const payload = {
      productId: product.id,
      productName: product.title,
      category,
      store,
      value: product.salePrice,
      currency: "USD"
    };
    trackViewContent(payload);
    if (product.availability === "Expired") trackExpiredDealView(payload);
  }, [category, product, store]);

  return null;
}
