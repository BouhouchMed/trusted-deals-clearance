import { Article, Category, Product, Store } from "./types";

export const siteUrl = "https://trusteddeals.us";

export const stores: Store[] = [
  { id: "walmart", name: "Walmart", logo: "W", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/WMT.webp", url: "https://www.walmart.com" },
  { id: "target", name: "Target", logo: "T", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/TGT.webp", url: "https://www.target.com" },
  { id: "amazon", name: "Amazon", logo: "A", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/AMZN.webp", url: "https://www.amazon.com" },
  { id: "wayfair", name: "Wayfair", logo: "Wf", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/W.webp", url: "https://www.wayfair.com" },
  { id: "costco", name: "Costco", logo: "Co", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/COST.webp", url: "https://www.costco.com" },
  { id: "home-depot", name: "Home Depot", logo: "HD", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/HD.webp", url: "https://www.homedepot.com" },
  { id: "lowes", name: "Lowe's", logo: "Lo", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/LOW.webp", url: "https://www.lowes.com" },
  { id: "tjx", name: "TJX", logo: "TJ", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/TJX.webp", url: "https://www.tjx.com" },
  { id: "ross-stores", name: "Ross Stores", logo: "Rs", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/ROST.webp", url: "https://www.rossstores.com" },
  { id: "best-buy", name: "Best Buy", logo: "BB", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/BBY.webp", url: "https://www.bestbuy.com" },
  {
    id: "williams-sonoma",
    name: "Williams-Sonoma",
    logo: "WS",
    logoUrl: "https://companiesmarketcap.com/img/company-logos/64/WSM.webp",
    url: "https://www.williams-sonoma.com"
  },
  { id: "hm", name: "H&M", logo: "HM", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/HM-B.ST.webp", url: "https://www2.hm.com/en_us/index.html" },
  { id: "burlington", name: "Burlington", logo: "Bu", logoUrl: "https://companiesmarketcap.com/img/company-logos/64/BURL.webp", url: "https://www.burlington.com" },
  {
    id: "tractor-supply",
    name: "Tractor Supply",
    logo: "TS",
    logoUrl: "https://companiesmarketcap.com/img/company-logos/64/TSCO.webp",
    url: "https://www.tractorsupply.com"
  }
];

export const categories: Category[] = [
  {
    slug: "top-deals",
    title: "Top Deals",
    description: "Editor-picked markdowns with strong value, trusted stores, and clear buying context.",
    image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=80",
    icon: "Sparkles"
  },
  {
    slug: "walmart-deals",
    title: "Walmart Deals",
    description: "Daily Walmart savings across home, pantry, electronics, toys, and family essentials.",
    image: "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1200&q=80",
    icon: "ShoppingCart"
  },
  {
    slug: "home-kitchen",
    title: "Home & Kitchen",
    description: "Smart appliances, cookware, bedding, storage, and everyday home upgrades on sale.",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
    icon: "Home"
  },
  {
    slug: "electronics",
    title: "Electronics",
    description: "Helpful tech deals on headphones, tablets, smart home devices, TVs, and accessories.",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80",
    icon: "MonitorSmartphone"
  },
  {
    slug: "furniture",
    title: "Furniture",
    description: "Living room, bedroom, patio, and office furniture deals that look more expensive than they are.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    icon: "Armchair"
  },
  {
    slug: "fashion",
    title: "Fashion",
    description: "Practical wardrobe finds, seasonal basics, accessories, and clearance style steals.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    icon: "Shirt"
  },
  {
    slug: "clearance-deals",
    title: "Clearance Deals",
    description: "Last-call bargains and limited stock finds before they disappear.",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80",
    icon: "BadgePercent"
  }
];

export const products: Product[] = [
  {
    id: "prod_ninja_air_fryer_max_xl",
    slug: "ninja-air-fryer-max-xl",
    title: "Ninja Air Fryer Max XL",
    shortDescription: "Family-size crisping power with a limited-time Walmart rollback.",
    longDescription: "A dependable countertop air fryer for weeknight dinners, frozen snacks, and quick lunches with less oil and less cleanup.",
    image: "https://images.unsplash.com/photo-1662047102608-a6f2e492411f?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1662047102608-a6f2e492411f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=1200&q=80"
    ],
    storeId: "walmart",
    brand: "Ninja",
    categorySlug: "home-kitchen",
    regularPrice: 149.99,
    salePrice: 89.99,
    rating: 4.8,
    couponCode: "CRISPY10",
    affiliateUrl: "https://www.walmart.com/search?q=Ninja%20Air%20Fryer%20Max%20XL",
    affiliateNetwork: "walmart",
    availability: "In Stock",
    expiration: "2026-07-31",
    featured: true,
    trending: true,
    clearance: false,
    published: true,
    specs: ["5.5 quart basket", "Multiple cook programs", "Dishwasher-safe crisper plate"],
    pros: ["Great family size", "Fast preheating", "Easy cleanup"],
    cons: ["Takes counter space", "Popular deal may sell out"],
    tips: ["Compare color variants before checkout.", "Clip any Walmart cash offer before adding to cart."],
    seoTitle: "Ninja Air Fryer Max XL Deal",
    seoDescription: "Save on the Ninja Air Fryer Max XL with current pricing, coupon notes, tips, and related kitchen deals."
  },
  {
    id: "prod_samsung_55_crystal_uhd_tv",
    slug: "samsung-55-inch-crystal-uhd-tv",
    title: "Samsung 55-Inch Crystal UHD Smart TV",
    shortDescription: "A sharp living-room upgrade with streaming apps built in.",
    longDescription: "This Samsung smart TV is a strong value pick for movie nights, sports, and everyday streaming in a family room.",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80"],
    storeId: "walmart",
    brand: "Samsung",
    categorySlug: "electronics",
    regularPrice: 429.99,
    salePrice: 318,
    rating: 4.6,
    affiliateUrl: "https://www.walmart.com/search?q=Samsung%2055%20Inch%20Crystal%20UHD%20Smart%20TV",
    affiliateNetwork: "walmart",
    availability: "Limited Stock",
    expiration: "2026-07-20",
    featured: true,
    trending: true,
    clearance: false,
    published: true,
    specs: ["55 inch display", "Crystal UHD processor", "Built-in streaming apps"],
    pros: ["Strong sale price", "Good everyday picture", "Trusted brand"],
    cons: ["Delivery availability varies", "Soundbar recommended for larger rooms"],
    tips: ["Check open-box options only if return terms are clear.", "Measure your TV stand width before ordering."],
    seoTitle: "Samsung 55-Inch Smart TV Deal",
    seoDescription: "Current Samsung 55-inch Crystal UHD TV sale with savings, availability, shopping tips, and related electronics deals."
  },
  {
    id: "prod_bhg_patio_set",
    slug: "better-homes-gardens-patio-set",
    title: "Better Homes & Gardens 4-Piece Patio Set",
    shortDescription: "A polished outdoor seating set with a clearance-style price.",
    longDescription: "A comfortable patio bundle for porches, decks, and small outdoor spaces with neutral cushions and a clean silhouette.",
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80"],
    storeId: "walmart",
    brand: "Better Homes & Gardens",
    categorySlug: "furniture",
    regularPrice: 399,
    salePrice: 249,
    rating: 4.5,
    affiliateUrl: "https://www.walmart.com/search?q=Better%20Homes%20Gardens%204%20Piece%20Patio%20Set",
    affiliateNetwork: "walmart",
    availability: "In Stock",
    expiration: "2026-08-05",
    featured: true,
    trending: false,
    clearance: true,
    published: true,
    specs: ["4-piece seating set", "Neutral cushions", "Weather-resistant frame"],
    pros: ["Elegant for the price", "Good for smaller patios", "Clearance markdown"],
    cons: ["Assembly required", "Stock may vary by ZIP code"],
    tips: ["Check local pickup for faster availability.", "Add a cover if the set will stay outdoors."],
    seoTitle: "Better Homes & Gardens Patio Set Clearance",
    seoDescription: "Find current clearance pricing and shopping advice for a Better Homes & Gardens patio furniture set."
  },
  {
    id: "prod_dyson_v8_cordless_vacuum",
    slug: "dyson-v8-cordless-vacuum",
    title: "Dyson V8 Cordless Vacuum",
    shortDescription: "A lightweight floor-care favorite at a rare seasonal markdown.",
    longDescription: "A cordless stick vacuum for quick daily cleaning, pet hair touchups, stairs, and hard floors.",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1200&q=80"],
    storeId: "target",
    brand: "Dyson",
    categorySlug: "home-kitchen",
    regularPrice: 469.99,
    salePrice: 299.99,
    rating: 4.7,
    affiliateUrl: "https://www.target.com/s?searchTerm=Dyson%20V8%20Cordless%20Vacuum",
    affiliateNetwork: "target",
    availability: "In Stock",
    expiration: "2026-07-28",
    featured: false,
    trending: true,
    clearance: false,
    published: true,
    specs: ["Cordless design", "Handheld conversion", "Washable filter"],
    pros: ["Lightweight", "Great for quick cleans", "Strong brand support"],
    cons: ["Battery runtime depends on mode", "Premium price even on sale"],
    tips: ["Confirm included attachments.", "Watch for gift card promotions."],
    seoTitle: "Dyson V8 Cordless Vacuum Sale",
    seoDescription: "Track current Dyson V8 cordless vacuum deals with sale pricing, pros, cons, and related home offers."
  },
  {
    id: "prod_levi_denim_jacket",
    slug: "levi-strauss-womens-denim-jacket",
    title: "Levi Strauss Women's Denim Jacket",
    shortDescription: "A classic layer with an easy under-$40 fashion deal.",
    longDescription: "A timeless denim jacket for casual outfits, travel days, and transitional weather.",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80"],
    storeId: "amazon",
    brand: "Levi Strauss",
    categorySlug: "fashion",
    regularPrice: 69.5,
    salePrice: 37.99,
    rating: 4.4,
    affiliateUrl: "https://www.amazon.com/s?k=Levi+Strauss+Womens+Denim+Jacket",
    affiliateNetwork: "amazon",
    availability: "In Stock",
    expiration: "2026-07-25",
    featured: false,
    trending: false,
    clearance: true,
    published: true,
    specs: ["Cotton blend", "Multiple washes", "Button front"],
    pros: ["Classic styling", "Versatile layer", "Wide size range"],
    cons: ["Sizing varies by wash", "Some colors sell out quickly"],
    tips: ["Compare size charts by color.", "Check return eligibility before buying clearance."],
    seoTitle: "Levi Strauss Women's Denim Jacket Deal",
    seoDescription: "A current denim jacket fashion deal with pricing, clearance notes, fit tips, and related fashion finds."
  },
  {
    id: "prod_wayfair_storage_ottoman",
    slug: "wayfair-storage-ottoman",
    title: "Upholstered Storage Ottoman",
    shortDescription: "Hidden storage and living-room polish in one budget-friendly piece.",
    longDescription: "A soft upholstered ottoman that works as seating, a footrest, and a tidy place for throws, remotes, or toys.",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"],
    storeId: "wayfair",
    brand: "Mercury Row",
    categorySlug: "furniture",
    regularPrice: 179.99,
    salePrice: 104.99,
    rating: 4.3,
    affiliateUrl: "https://www.wayfair.com/keyword.php?keyword=upholstered%20storage%20ottoman",
    affiliateNetwork: "wayfair",
    availability: "In Stock",
    expiration: "2026-08-01",
    featured: false,
    trending: true,
    clearance: false,
    published: true,
    specs: ["Lift-top storage", "Upholstered finish", "Compact footprint"],
    pros: ["Useful storage", "Soft neutral look", "Good apartment scale"],
    cons: ["Color can vary by screen", "Weight limit should be checked"],
    tips: ["Measure sofa height for proportion.", "Review shipping estimates before checkout."],
    seoTitle: "Storage Ottoman Deal",
    seoDescription: "Current upholstered storage ottoman sale with savings, specs, pros, cons, and related furniture deals."
  }
];

export const articles: Article[] = [
  {
    slug: "how-to-spot-real-walmart-rollbacks",
    title: "How to Spot a Real Walmart Rollback",
    excerpt: "A practical guide to checking price history, pickup availability, and coupon stacking before you buy.",
    categorySlug: "walmart-deals",
    productSlug: "ninja-air-fryer-max-xl",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    author: "Trusted Deals Editors",
    publishedAt: "2026-07-08",
    tags: ["Walmart", "Coupons", "Savings"]
  },
  {
    slug: "best-home-deals-to-watch-in-july",
    title: "Best Home Deals to Watch in July",
    excerpt: "From patio furniture to countertop appliances, these are the home categories most likely to see useful markdowns.",
    categorySlug: "home-kitchen",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    author: "Maya Collins",
    publishedAt: "2026-07-10",
    tags: ["Home", "Kitchen", "Seasonal Deals"]
  },
  {
    slug: "clearance-shopping-checklist",
    title: "The Clearance Shopping Checklist",
    excerpt: "Use this quick checklist to avoid final-sale regret and find the buys that are actually worth it.",
    categorySlug: "clearance-deals",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80",
    author: "Dana Reeves",
    publishedAt: "2026-07-12",
    tags: ["Clearance", "Shopping Tips", "Budget"]
  }
];

export const settings = {
  facebookUrl: "https://www.facebook.com/groups/1998003327099051",
  defaultCurrency: "USD",
  affiliateRedirectTarget: "same_tab",
  approvedAffiliateDomains: [
    "www.walmart.com",
    "walmart.com",
    "www.target.com",
    "target.com",
    "www.amazon.com",
    "amazon.com",
    "www.wayfair.com",
    "wayfair.com",
    "www.costco.com",
    "costco.com",
    "www.homedepot.com",
    "homedepot.com",
    "www.lowes.com",
    "lowes.com",
    "www.tjx.com",
    "tjx.com",
    "www.rossstores.com",
    "rossstores.com",
    "www.bestbuy.com",
    "bestbuy.com",
    "www.williams-sonoma.com",
    "williams-sonoma.com",
    "www2.hm.com",
    "hm.com",
    "www.burlington.com",
    "burlington.com",
    "www.tractorsupply.com",
    "tractorsupply.com"
  ],
  adminHeroScheduleNote: "Featured hero slides are manually selected, ordered, and scheduled by admins.",
  affiliateDisclosure:
    "Trusted Deals & Clearance may earn a commission when you buy through links on our site. Our editors choose deals based on value, availability, and reader usefulness."
};

export function getStore(id: string) {
  return stores.find((store) => store.id === id) ?? stores[0];
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug && product.published);
}

export function getDiscount(product: Product) {
  return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(new Date(value));
}
