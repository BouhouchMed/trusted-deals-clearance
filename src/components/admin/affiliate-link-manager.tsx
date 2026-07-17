"use client";

import { Copy, Link2, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import type { AffiliateLink } from "@/lib/affiliate-link-store";

type Props = {
  initialLinks: AffiliateLink[];
};

export function AffiliateLinkManager({ initialLinks }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function createLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    const response = await fetch("/api/admin/affiliate-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationUrl, title })
    });
    const body = (await response.json().catch(() => null)) as { error?: string; link?: AffiliateLink } | null;
    setSaving(false);

    if (!response.ok || !body?.link) {
      setStatus(body?.error || "Could not create affiliate link.");
      return;
    }

    setLinks((current) => [body.link as AffiliateLink, ...current]);
    setDestinationUrl("");
    setTitle("");
    setStatus("Local affiliate link created.");
  }

  async function deleteLink(slug: string) {
    const response = await fetch(`/api/admin/affiliate-links/${slug}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("Could not delete affiliate link.");
      return;
    }
    setLinks((current) => current.filter((link) => link.slug !== slug));
    setStatus("Affiliate link deleted.");
  }

  function copy(value: string) {
    navigator.clipboard?.writeText(value).catch(() => undefined);
    setStatus("Local link copied.");
  }

  return (
    <>
      <div className="admin-panel-heading">
        <div>
          <h3>Affiliate Links</h3>
          <p>Create local redirect links for publishing on social media, posts, groups, and messages.</p>
        </div>
      </div>

      <form className="affiliate-link-form" onSubmit={createLink}>
        <label className="builder-field">
          <span>Affiliate URL</span>
          <input value={destinationUrl} onChange={(event) => setDestinationUrl(event.target.value.trim())} placeholder="Paste your affiliate link here" required />
        </label>
        <label className="builder-field">
          <span>Label optional</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Example: Walmart AirPods Deal" />
        </label>
        <button className="button" type="submit" disabled={saving}>
          <Plus size={18} /> {saving ? "Generating..." : "Generate Local Link"}
        </button>
      </form>

      <div className="builder-status" aria-live="polite">
        {status}
      </div>

      <div className="admin-table affiliate-link-table">
        <div className="admin-row admin-head">
          <span>Label</span>
          <span>Local link</span>
          <span>Destination</span>
          <span>Actions</span>
        </div>
        {links.map((link) => (
          <div className="admin-row" key={link.slug}>
            <span>
              <strong>{link.title}</strong>
              <small>/{link.slug}</small>
            </span>
            <span>
              <a href={link.localUrl} target="_blank" rel="noreferrer">
                {link.localUrl}
              </a>
            </span>
            <span>
              <small>{link.destinationUrl}</small>
            </span>
            <span className="admin-inline-actions">
              <button type="button" onClick={() => copy(link.localUrl)}>
                <Copy size={14} /> Copy
              </button>
              <button type="button" onClick={() => deleteLink(link.slug)}>
                <Trash2 size={14} /> Delete
              </button>
            </span>
          </div>
        ))}
      </div>

      {links.length === 0 ? (
        <div className="empty-admin-state">
          <Link2 size={22} />
          <span>No local affiliate links yet.</span>
        </div>
      ) : null}
    </>
  );
}
