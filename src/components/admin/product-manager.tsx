"use client";

import { Copy, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { categories, currency, getDiscount, getStore, stores } from "@/lib/data";
import { Product } from "@/lib/types";

type DraftProduct = {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  image: string;
  storeId: string;
  brand: string;
  categorySlug: string;
  regularPrice: string;
  salePrice: string;
  affiliateUrl: string;
  couponCode: string;
  featured: boolean;
  trending: boolean;
  clearance: boolean;
  published: boolean;
};

const emptyDraft: DraftProduct = {
  title: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=80",
  storeId: "walmart",
  brand: "",
  categorySlug: "top-deals",
  regularPrice: "",
  salePrice: "",
  affiliateUrl: "https://www.walmart.com/",
  couponCode: "",
  featured: false,
  trending: false,
  clearance: false,
  published: true
};

export function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<DraftProduct>(emptyDraft);
  const [open, setOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(initialProducts[0]?.slug ?? "");

  useEffect(() => {
    const openForm = () => openCreateForm();
    window.addEventListener("tdc-open-create-product", openForm);
    return () => window.removeEventListener("tdc-open-create-product", openForm);
  }, []);

  function update<Key extends keyof DraftProduct>(key: Key, value: DraftProduct[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function openCreateForm() {
    setDraft(emptyDraft);
    setEditingSlug(null);
    setOpen(true);
  }

  function openEditForm() {
    const product = products.find((item) => item.slug === selectedSlug);
    if (!product) {
      setStatus("error");
      setError("Select a product first.");
      return;
    }
    setDraft({
      title: product.title,
      slug: product.slug,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      image: product.image,
      storeId: product.storeId,
      brand: product.brand,
      categorySlug: product.categorySlug,
      regularPrice: String(product.regularPrice),
      salePrice: String(product.salePrice),
      affiliateUrl: product.affiliateUrl,
      couponCode: product.couponCode ?? "",
      featured: product.featured,
      trending: product.trending,
      clearance: product.clearance,
      published: product.published
    });
    setEditingSlug(product.slug);
    setOpen(true);
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError("");

    const response = await fetch(editingSlug ? `/api/admin/products/${editingSlug}` : "/api/admin/products", {
      method: editingSlug ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingSlug ? { action: "update", product: draft } : draft)
    });
    const result = (await response.json()) as { product?: Product; error?: string };

    if (!response.ok || !result.product) {
      setStatus("error");
      setError(result.error ?? "Could not create product.");
      return;
    }

    setProducts((current) =>
      editingSlug
        ? current.map((product) => (product.slug === editingSlug ? (result.product as Product) : product))
        : [result.product as Product, ...current]
    );
    setSelectedSlug(result.product.slug);
    setDraft(emptyDraft);
    setEditingSlug(null);
    setStatus("saved");
    setOpen(false);
  }

  async function runProductAction(action: "feature" | "duplicate" | "delete") {
    if (!selectedSlug) {
      setStatus("error");
      setError("Select a product first.");
      return;
    }

    setStatus("saving");
    setError("");

    const response = await fetch(`/api/admin/products/${selectedSlug}`, {
      method: action === "delete" ? "DELETE" : action === "duplicate" ? "POST" : "PATCH",
      headers: action === "delete" ? undefined : { "Content-Type": "application/json" },
      body: action === "delete" ? undefined : JSON.stringify({ action })
    });
    const result = (await response.json().catch(() => ({}))) as { product?: Product; error?: string };

    if (!response.ok) {
      setStatus("error");
      setError(result.error ?? `Could not ${action} product.`);
      return;
    }

    if (action === "delete") {
      setProducts((current) => current.filter((product) => product.slug !== selectedSlug));
      setSelectedSlug((current) => {
        const remaining = products.filter((product) => product.slug !== current);
        return remaining[0]?.slug ?? "";
      });
    }

    if (action === "feature" && result.product) {
      setProducts((current) => current.map((product) => (product.slug === result.product?.slug ? { ...product, featured: result.product.featured } : product)));
    }

    if (action === "duplicate" && result.product) {
      setProducts((current) => [result.product as Product, ...current]);
      setSelectedSlug(result.product.slug);
    }

    setStatus("saved");
  }

  return (
    <>
      <div className="admin-panel-heading">
        <div>
          <h3>Product Management</h3>
          <p>Create, edit, delete, feature, duplicate, expire, publish, draft, and mark clearance deals.</p>
        </div>
        <div className="admin-actions">
          <button type="button" onClick={openCreateForm}>
            <Plus size={16} /> Create
          </button>
          <button type="button" onClick={openEditForm} disabled={!selectedSlug || status === "saving"}>
            <Pencil size={16} /> Edit
          </button>
          <button type="button" onClick={() => runProductAction("feature")} disabled={!selectedSlug || status === "saving"}>
            <Megaphone size={16} /> Feature Product
          </button>
          <button type="button" onClick={() => runProductAction("duplicate")} disabled={!selectedSlug || status === "saving"}>
            <Copy size={16} /> Duplicate
          </button>
          <button type="button" onClick={() => runProductAction("delete")} disabled={!selectedSlug || status === "saving"}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
      <div className="builder-status" aria-live="polite">
        {status === "saved" ? "Product changes saved. Refresh the public site to see the latest catalog." : null}
        {status === "error" ? error : null}
      </div>
      <div className="admin-table">
        <div className="admin-row admin-head">
          <span>Product</span>
          <span>Store</span>
          <span>Price</span>
          <span>Flags</span>
          <span>SEO</span>
        </div>
        {products.map((product) => (
          <button
            className={`admin-row admin-product-row ${selectedSlug === product.slug ? "selected" : ""}`}
            type="button"
            key={product.slug}
            onClick={() => setSelectedSlug(product.slug)}
          >
            <span>
              <strong>{product.title}</strong>
              <small>/{product.slug}</small>
            </span>
            <span>{getStore(product.storeId).name}</span>
            <span>
              {currency(product.salePrice)}
              <small>{getDiscount(product)}% off</small>
            </span>
            <span className="pill-row">
              {product.featured ? <b>Featured</b> : null}
              {product.trending ? <b>Trending</b> : null}
              {product.clearance ? <b>Clearance</b> : null}
              {!product.published ? <b>Draft</b> : null}
            </span>
            <span>{product.seoTitle}</span>
          </button>
        ))}
      </div>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Create product">
          <form className="product-modal" onSubmit={createProduct}>
            <div className="admin-panel-heading">
              <div>
                <h3>{editingSlug ? "Edit Product" : "Create Product"}</h3>
                <p>{editingSlug ? "Update this deal across the website." : "Add a new affiliate deal to the website."}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="product-form-grid">
              <Field label="Title" value={draft.title} onChange={(value) => update("title", value)} required />
              <Field label="Slug optional" value={draft.slug} onChange={(value) => update("slug", value)} />
              <Field label="Brand" value={draft.brand} onChange={(value) => update("brand", value)} required />
              <Field label="Image URL" value={draft.image} onChange={(value) => update("image", value)} required />
              <Field label="Regular Price" value={draft.regularPrice} onChange={(value) => update("regularPrice", value)} required type="number" />
              <Field label="Sale Price" value={draft.salePrice} onChange={(value) => update("salePrice", value)} required type="number" />
              <label className="builder-field">
                <span>Store</span>
                <select value={draft.storeId} onChange={(event) => update("storeId", event.target.value)}>
                  {stores.map((store) => (
                    <option value={store.id} key={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="builder-field">
                <span>Category</span>
                <select value={draft.categorySlug} onChange={(event) => update("categorySlug", event.target.value)}>
                  {categories.map((category) => (
                    <option value={category.slug} key={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Affiliate URL" value={draft.affiliateUrl} onChange={(value) => update("affiliateUrl", value)} required />
              <Field label="Coupon Code" value={draft.couponCode} onChange={(value) => update("couponCode", value)} />
              <label className="builder-field wide">
                <span>Short Description</span>
                <textarea value={draft.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} required />
              </label>
              <label className="builder-field wide">
                <span>Long Description</span>
                <textarea value={draft.longDescription} onChange={(event) => update("longDescription", event.target.value)} />
              </label>
            </div>
            <div className="builder-toggle-grid compact product-flags">
              <label>
                <input type="checkbox" checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} />
                Featured
              </label>
              <label>
                <input type="checkbox" checked={draft.trending} onChange={(event) => update("trending", event.target.checked)} />
                Trending
              </label>
              <label>
                <input type="checkbox" checked={draft.clearance} onChange={(event) => update("clearance", event.target.checked)} />
                Clearance
              </label>
              <label>
                <input type="checkbox" checked={draft.published} onChange={(event) => update("published", event.target.checked)} />
                Published
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="button" type="submit" disabled={status === "saving"}>
                {status === "saving" ? "Saving..." : editingSlug ? "Save Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="builder-field">
      <span>{label}</span>
      <input type={type} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}
