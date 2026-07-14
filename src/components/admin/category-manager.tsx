"use client";

import { Pencil, Save } from "lucide-react";
import { useState } from "react";
import { Category } from "@/lib/types";

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [draft, setDraft] = useState<Category>(initialCategories[0]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update<Key extends keyof Category>(key: Key, value: Category[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setStatus("saving");
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    const result = (await response.json().catch(() => ({}))) as { category?: Category };
    if (!response.ok || !result.category) {
      setStatus("error");
      return;
    }
    setCategories((current) => current.map((category) => (category.slug === result.category!.slug ? result.category! : category)));
    setStatus("saved");
  }

  return (
    <>
      <div className="admin-panel-heading">
        <div>
          <h3>Dynamic Categories</h3>
          <p>Edit category titles, descriptions, icons, and hero images.</p>
        </div>
        <button className="button" type="button" onClick={save}>
          <Save size={18} /> Save Category
        </button>
      </div>
      <div className="builder-status" aria-live="polite">
        {status === "saved" ? "Category saved." : null}
        {status === "error" ? "Could not save category." : null}
      </div>
      <div className="category-manager-grid">
        <div className="analytics-list">
          {categories.map((category) => (
            <span key={category.slug}>
              {category.title}
              <button className="inline-edit-button" type="button" onClick={() => setDraft(category)}>
                <Pencil size={14} /> Edit
              </button>
            </span>
          ))}
        </div>
        <div className="builder-card">
          <label className="builder-field">
            <span>Slug</span>
            <input value={draft.slug} readOnly />
          </label>
          <label className="builder-field">
            <span>Title</span>
            <input value={draft.title} onChange={(event) => update("title", event.target.value)} />
          </label>
          <label className="builder-field">
            <span>Description</span>
            <textarea value={draft.description} onChange={(event) => update("description", event.target.value)} />
          </label>
          <label className="builder-field">
            <span>Image URL</span>
            <input value={draft.image} onChange={(event) => update("image", event.target.value)} />
          </label>
          <label className="builder-field">
            <span>Icon</span>
            <input value={draft.icon} onChange={(event) => update("icon", event.target.value)} />
          </label>
        </div>
      </div>
    </>
  );
}
