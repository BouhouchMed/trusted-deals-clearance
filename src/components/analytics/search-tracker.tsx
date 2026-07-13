"use client";

import { useEffect } from "react";
import { trackSearch } from "@/lib/meta-pixel";

export function SearchTracker({ query, category = "global" }: { query: string; category?: string }) {
  useEffect(() => {
    trackSearch(query, category);
  }, [category, query]);

  return null;
}
