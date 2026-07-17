"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Article, Category } from "@/lib/types";

const emptyDraft = {
  title: "",
  slug: "",
  excerpt: "",
  categorySlug: "top-deals",
  image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=80",
  author: "Trusted Deals Editors",
  tags: "Shopping Guide, Deals"
};

export function ArticleManager({ initialArticles, initialCategories }: { initialArticles: Article[]; initialCategories: Category[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const categoryOptions = initialCategories.length ? initialCategories : [{ slug: "top-deals", title: "Top Deals", description: "", image: "", icon: "" }];
  const [draft, setDraft] = useState(emptyDraft);
  const [open, setOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  function update(key: keyof typeof emptyDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function openCreateForm() {
    setDraft(emptyDraft);
    setEditingSlug(null);
    setOpen(true);
  }

  function openEditForm(article: Article) {
    setDraft({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      categorySlug: article.categorySlug,
      image: article.image,
      author: article.author,
      tags: article.tags.join(", ")
    });
    setEditingSlug(article.slug);
    setOpen(true);
  }

  async function createArticle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError("");

    let result: { article?: Article; error?: string } = {};
    let response: Response;

    try {
      response = await fetch(editingSlug ? `/api/admin/articles/${editingSlug}` : "/api/admin/articles", {
        method: editingSlug ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      result = (await response.json().catch(() => ({}))) as { article?: Article; error?: string };
    } catch {
      setStatus("error");
      setError("Could not connect to the article API. Please try again.");
      return;
    }

    if (!response.ok || !result.article) {
      setStatus("error");
      setError(result.error ?? "Could not create article.");
      return;
    }

    setArticles((current) =>
      editingSlug
        ? current.map((article) => (article.slug === editingSlug ? (result.article as Article) : article))
        : [result.article as Article, ...current]
    );
    setDraft(emptyDraft);
    setEditingSlug(null);
    setOpen(false);
    setStatus("saved");
  }

  async function deleteArticle(slug: string) {
    setDeletingSlug(slug);
    setError("");
    const response = await fetch(`/api/admin/articles/${slug}`, { method: "DELETE" });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setError(result.error ?? "Could not delete article.");
      setDeletingSlug(null);
      return;
    }

    setArticles((current) => current.filter((article) => article.slug !== slug));
    setStatus("saved");
    setDeletingSlug(null);
  }

  return (
    <>
      <div className="admin-panel-heading">
        <div>
          <h3>Article Management</h3>
          <p>Create shopping guides, buying guides, product reviews, seasonal deals, and gift guides.</p>
        </div>
        <button className="button" type="button" onClick={openCreateForm}>
          <Plus size={18} /> Create Article
        </button>
      </div>
      <div className="builder-status" aria-live="polite">
        {status === "saved" ? "Article changes saved. Refresh the blog to see the latest list." : null}
        {status === "error" ? error : null}
      </div>
      <div className="analytics-list">
        {articles.map((article) => (
          <span key={article.slug}>
            {article.title} <strong>{article.categorySlug}</strong>
            <button className="inline-edit-button" type="button" onClick={() => openEditForm(article)}>
              <Pencil size={14} /> Edit
            </button>
            <button className="inline-edit-button danger" type="button" onClick={() => deleteArticle(article.slug)} disabled={deletingSlug === article.slug}>
              <Trash2 size={14} /> {deletingSlug === article.slug ? "Deleting..." : "Delete"}
            </button>
          </span>
        ))}
      </div>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Create article">
          <form className="product-modal" onSubmit={createArticle}>
            <div className="admin-panel-heading">
              <div>
                <h3>{editingSlug ? "Edit Article" : "Create Article"}</h3>
                <p>{editingSlug ? "Update this article across the blog." : "Add a new editorial article to the blog."}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="product-form-grid">
              <Field label="Title" value={draft.title} onChange={(value) => update("title", value)} required />
              <Field label="Slug optional" value={draft.slug} onChange={(value) => update("slug", value)} />
              <Field label="Author" value={draft.author} onChange={(value) => update("author", value)} required />
              <ImageUrlField label="Image URL" value={draft.image} onChange={(value) => update("image", value)} />
              <label className="builder-field">
                <span>Category</span>
                <select value={draft.categorySlug} onChange={(event) => update("categorySlug", event.target.value)}>
                  {categoryOptions.map((category) => (
                    <option value={category.slug} key={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Tags comma separated" value={draft.tags} onChange={(value) => update("tags", value)} />
              <label className="builder-field wide">
                <span>Excerpt</span>
                <textarea value={draft.excerpt} onChange={(event) => update("excerpt", event.target.value)} required />
              </label>
            </div>
            {status === "error" ? <div className="builder-status modal-status">{error}</div> : null}
            <div className="modal-actions">
              <button type="button" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="button" type="submit" disabled={status === "saving"}>
                {status === "saving" ? "Saving..." : editingSlug ? "Save Article" : "Create Article"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function ImageUrlField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const canPreview = /^https?:\/\/\S+/i.test(value.trim());

  return (
    <label className="builder-field image-url-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value.trim())} placeholder="Paste direct image URL from retailer website" required />
      {canPreview ? (
        <span className="image-url-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" />
        </span>
      ) : (
        <small>Paste a direct image link starting with https://</small>
      )}
    </label>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="builder-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}
