"use client";

import { CalendarClock, Megaphone } from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/types";

export function HeroSliderManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const featuredProducts = products.filter((product) => product.featured);

  async function toggleHero(product: Product) {
    setStatus("saving");
    setError("");
    const response = await fetch(`/api/admin/products/${product.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "feature" })
    });
    const result = (await response.json().catch(() => ({}))) as { product?: Product; error?: string };
    if (!response.ok || !result.product) {
      setError(result.error ?? "Could not update hero slider.");
      setStatus("error");
      return;
    }
    setProducts((current) => current.map((item) => (item.slug === product.slug ? { ...item, featured: result.product!.featured } : item)));
    setStatus("saved");
  }

  return (
    <>
      <div className="admin-panel-heading">
        <div>
          <h3>Hero Slider Scheduling</h3>
          <p>Select which products appear in the homepage slideshow.</p>
        </div>
      </div>
      <div className="builder-status" aria-live="polite">
        {status === "saved" ? "Hero slider updated." : null}
        {status === "error" ? error || "Could not update hero slider." : null}
      </div>
      <div className="hero-sort-list">
        {featuredProducts.map((product, index) => (
          <div draggable key={product.slug}>
            <span>{index + 1}</span>
            <strong>{product.title}</strong>
            <small>
              <CalendarClock size={14} /> Through {product.expiration}
            </small>
          </div>
        ))}
      </div>
      <div className="hero-product-picker">
        {products.map((product) => (
          <button type="button" className={product.featured ? "selected" : ""} onClick={() => toggleHero(product)} key={product.slug}>
            <Megaphone size={15} />
            {product.title}
          </button>
        ))}
      </div>
    </>
  );
}
