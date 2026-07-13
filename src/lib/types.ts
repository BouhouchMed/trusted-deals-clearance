export type CategorySlug =
  | "top-deals"
  | "walmart-deals"
  | "home-kitchen"
  | "electronics"
  | "furniture"
  | "fashion"
  | "clearance-deals";

export type Store = {
  id: string;
  name: string;
  logo: string;
  url: string;
};

export type Category = {
  slug: CategorySlug;
  title: string;
  description: string;
  image: string;
  icon: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  gallery: string[];
  storeId: string;
  brand: string;
  categorySlug: CategorySlug;
  regularPrice: number;
  salePrice: number;
  rating: number;
  couponCode?: string;
  affiliateUrl: string;
  affiliateNetwork: string;
  availability: "In Stock" | "Limited Stock" | "Expired";
  expiration: string;
  featured: boolean;
  trending: boolean;
  clearance: boolean;
  published: boolean;
  specs: string[];
  pros: string[];
  cons: string[];
  tips: string[];
  seoTitle: string;
  seoDescription: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: CategorySlug;
  productSlug?: string;
  image: string;
  author: string;
  publishedAt: string;
  tags: string[];
};
