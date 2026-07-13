"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { currency, formatDate, getDiscount, getStore } from "@/lib/data";
import { Product } from "@/lib/types";
import { trackHeroSlideClick, trackHeroSlideView } from "@/lib/meta-pixel";

export function HeroSlider({ products }: { products: Product[] }) {
  const slides = useMemo(() => products.filter((product) => product.featured), [products]);
  const [index, setIndex] = useState(0);
  const viewedSlides = useRef(new Set<string>());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index] ?? products[0];

  useEffect(() => {
    if (!slide) return;
    if (viewedSlides.current.has(slide.id)) return;
    viewedSlides.current.add(slide.id);
    trackHeroSlideView({
      productId: slide.id,
      productName: slide.title,
      category: slide.categorySlug,
      store: getStore(slide.storeId).name,
      value: slide.salePrice,
      currency: "USD",
      slidePosition: index + 1
    });
  }, [index, slide]);

  return (
    <section className="hero-slider" aria-label="Featured deals">
      <Image src={slide.image} alt="" fill priority sizes="100vw" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="eyebrow">Editor Selected Deal</span>
        <h1>{slide.title}</h1>
        <p>{slide.shortDescription}</p>
        <div className="hero-price">
          <span>{currency(slide.salePrice)}</span>
          <del>{currency(slide.regularPrice)}</del>
          <strong>{getDiscount(slide)}% Off</strong>
        </div>
        <div className="countdown">Deal scheduled through {formatDate(slide.expiration)}</div>
        <Link
          className="button"
          href={`/products/${slide.slug}`}
          onClick={() =>
            trackHeroSlideClick({
              productId: slide.id,
              productName: slide.title,
              category: slide.categorySlug,
              store: getStore(slide.storeId).name,
              value: slide.salePrice,
              currency: "USD",
              slidePosition: index + 1,
              buttonText: "View Deal"
            })
          }
        >
          View Deal
        </Link>
      </div>
      <button className="slider-arrow prev" aria-label="Previous deal" onClick={() => setIndex((index - 1 + slides.length) % slides.length)}>
        <ChevronLeft />
      </button>
      <button className="slider-arrow next" aria-label="Next deal" onClick={() => setIndex((index + 1) % slides.length)}>
        <ChevronRight />
      </button>
      <div className="slider-dots">
        {slides.map((product, dotIndex) => (
          <button
            aria-label={`Show ${product.title}`}
            className={dotIndex === index ? "active" : ""}
            key={product.slug}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </section>
  );
}
