import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { products as seedProducts } from "@/lib/data";
import { CategorySlug, Product } from "@/lib/types";

const adminProductsPath = path.join(process.cwd(), "src", "lib", "admin-products.json");
const adminProductStatePath = path.join(process.cwd(), "src", "lib", "admin-product-state.json");

type ProductState = {
  hiddenSlugs: string[];
  overrides: Record<string, Partial<Pick<Product, "featured" | "trending" | "clearance" | "published">>>;
};

export type ProductInput = {
  title: string;
  slug?: string;
  shortDescription: string;
  longDescription?: string;
  image: string;
  storeId: string;
  brand: string;
  categorySlug: CategorySlug;
  regularPrice: number;
  salePrice: number;
  affiliateUrl: string;
  couponCode?: string;
  featured?: boolean;
  trending?: boolean;
  clearance?: boolean;
  published?: boolean;
};

export async function getAdminProducts(): Promise<Product[]> {
  try {
    const raw = await readFile(adminProductsPath, "utf8");
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const adminProducts = await getAdminProducts();
  const state = await getProductState();
  const visibleSeedProducts = seedProducts
    .filter((product) => !state.hiddenSlugs.includes(product.slug))
    .map((product) => ({ ...product, ...state.overrides[product.slug] }));
  const visibleAdminProducts = adminProducts
    .filter((product) => !state.hiddenSlugs.includes(product.slug))
    .map((product) => ({ ...product, ...state.overrides[product.slug] }));
  return [...visibleAdminProducts, ...visibleSeedProducts];
}

export async function getProductBySlug(slug: string) {
  const allProducts = await getAllProducts();
  return allProducts.find((product) => product.slug === slug && product.published);
}

export async function saveAdminProduct(input: ProductInput) {
  const adminProducts = await getAdminProducts();
  const allProducts = await getAllProducts();
  const slug = normalizeSlug(input.slug || input.title);

  if (allProducts.some((product) => product.slug === slug)) {
    throw new Error("A product with this slug already exists.");
  }

  const product: Product = {
    id: `prod_${slug.replaceAll("-", "_")}`,
    slug,
    title: input.title.trim(),
    shortDescription: input.shortDescription.trim(),
    longDescription: input.longDescription?.trim() || input.shortDescription.trim(),
    image: input.image.trim(),
    gallery: [input.image.trim()],
    storeId: input.storeId,
    brand: input.brand.trim(),
    categorySlug: input.categorySlug,
    regularPrice: Number(input.regularPrice),
    salePrice: Number(input.salePrice),
    rating: 4.5,
    couponCode: input.couponCode?.trim() || undefined,
    affiliateUrl: input.affiliateUrl.trim(),
    affiliateNetwork: input.storeId,
    availability: "In Stock",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    featured: Boolean(input.featured),
    trending: Boolean(input.trending),
    clearance: Boolean(input.clearance),
    published: input.published ?? true,
    specs: ["Added from Admin Panel"],
    pros: ["Created by site admin"],
    cons: ["Review retailer details before publishing widely"],
    tips: ["Verify price and coupon before promoting."],
    seoTitle: `${input.title.trim()} Deal`,
    seoDescription: input.shortDescription.trim()
  };

  const nextProducts = [product, ...adminProducts];
  await writeFile(adminProductsPath, `${JSON.stringify(nextProducts, null, 2)}\n`, "utf8");
  return product;
}

export async function featureProduct(slug: string) {
  const allProducts = await getAllProducts();
  const product = allProducts.find((item) => item.slug === slug);
  if (!product) throw new Error("Product not found.");
  await updateProductOverride(slug, { featured: !product.featured });
  return { ...product, featured: !product.featured };
}

export async function duplicateProduct(slug: string) {
  const allProducts = await getAllProducts();
  const source = allProducts.find((product) => product.slug === slug);
  if (!source) throw new Error("Product not found.");

  const adminProducts = await getAdminProducts();
  const nextSlug = await getUniqueSlug(`${source.slug}-copy`);
  const product: Product = {
    ...source,
    id: `prod_${nextSlug.replaceAll("-", "_")}`,
    slug: nextSlug,
    title: `${source.title} Copy`,
    featured: false,
    trending: false,
    seoTitle: `${source.title} Copy Deal`
  };
  await writeFile(adminProductsPath, `${JSON.stringify([product, ...adminProducts], null, 2)}\n`, "utf8");
  return product;
}

export async function deleteProduct(slug: string) {
  const adminProducts = await getAdminProducts();
  const nextAdminProducts = adminProducts.filter((product) => product.slug !== slug);
  const wasAdminProduct = nextAdminProducts.length !== adminProducts.length;
  await writeFile(adminProductsPath, `${JSON.stringify(nextAdminProducts, null, 2)}\n`, "utf8");

  if (!wasAdminProduct) {
    const state = await getProductState();
    if (!state.hiddenSlugs.includes(slug)) state.hiddenSlugs.push(slug);
    delete state.overrides[slug];
    await writeProductState(state);
  }
}

export async function updateProduct(slug: string, input: ProductInput) {
  const adminProducts = await getAdminProducts();
  const allProducts = await getAllProducts();
  const existing = allProducts.find((product) => product.slug === slug);
  if (!existing) throw new Error("Product not found.");

  const nextSlug = normalizeSlug(input.slug || input.title);
  if (nextSlug !== slug && allProducts.some((product) => product.slug === nextSlug)) {
    throw new Error("A product with this slug already exists.");
  }

  const updated: Product = {
    ...existing,
    id: existing.id,
    slug: nextSlug,
    title: input.title.trim(),
    shortDescription: input.shortDescription.trim(),
    longDescription: input.longDescription?.trim() || input.shortDescription.trim(),
    image: input.image.trim(),
    gallery: [input.image.trim()],
    storeId: input.storeId,
    brand: input.brand.trim(),
    categorySlug: input.categorySlug,
    regularPrice: Number(input.regularPrice),
    salePrice: Number(input.salePrice),
    couponCode: input.couponCode?.trim() || undefined,
    affiliateUrl: input.affiliateUrl.trim(),
    affiliateNetwork: input.storeId,
    featured: Boolean(input.featured),
    trending: Boolean(input.trending),
    clearance: Boolean(input.clearance),
    published: input.published ?? true,
    seoTitle: `${input.title.trim()} Deal`,
    seoDescription: input.shortDescription.trim()
  };

  const adminIndex = adminProducts.findIndex((product) => product.slug === slug);
  if (adminIndex >= 0) {
    const nextAdminProducts = [...adminProducts];
    nextAdminProducts[adminIndex] = updated;
    await writeFile(adminProductsPath, `${JSON.stringify(nextAdminProducts, null, 2)}\n`, "utf8");
  } else {
    await writeFile(adminProductsPath, `${JSON.stringify([updated, ...adminProducts], null, 2)}\n`, "utf8");
    const state = await getProductState();
    if (!state.hiddenSlugs.includes(slug)) state.hiddenSlugs.push(slug);
    delete state.overrides[slug];
    await writeProductState(state);
  }

  return updated;
}

async function updateProductOverride(slug: string, override: ProductState["overrides"][string]) {
  const state = await getProductState();
  state.overrides[slug] = {
    ...state.overrides[slug],
    ...override
  };
  await writeProductState(state);
}

async function getProductState(): Promise<ProductState> {
  try {
    const raw = await readFile(adminProductStatePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ProductState>;
    return {
      hiddenSlugs: parsed.hiddenSlugs ?? [],
      overrides: parsed.overrides ?? {}
    };
  } catch {
    return { hiddenSlugs: [], overrides: {} };
  }
}

async function writeProductState(state: ProductState) {
  await writeFile(adminProductStatePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function getUniqueSlug(baseSlug: string) {
  const allProducts = await getAllProducts();
  const existing = new Set(allProducts.map((product) => product.slug));
  let slug = normalizeSlug(baseSlug);
  let index = 2;
  while (existing.has(slug)) {
    slug = `${normalizeSlug(baseSlug)}-${index}`;
    index += 1;
  }
  return slug;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
