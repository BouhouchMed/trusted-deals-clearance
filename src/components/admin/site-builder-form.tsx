"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import type { SiteConfig } from "@/lib/site-config";

type Props = {
  initialConfig: SiteConfig;
};

type HomepageToggleKey = {
  [Key in keyof SiteConfig["homepage"]]: SiteConfig["homepage"][Key] extends boolean ? Key : never;
}[keyof SiteConfig["homepage"]];

const sectionToggles: Array<[HomepageToggleKey, string]> = [
  ["showHero", "Hero Slider"],
  ["showCategories", "Featured Categories"],
  ["showTodaysDeals", "Best Deals"],
  ["showTrendingDeals", "Trending Deals"],
  ["showLatestArticles", "Latest Articles"],
  ["showCommunity", "Facebook Community"],
  ["showNewsletter", "Newsletter"]
];

export function SiteBuilderForm({ initialConfig }: Props) {
  const [config, setConfig] = useState(initialConfig);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function updateHomepage<Key extends keyof SiteConfig["homepage"]>(key: Key, value: SiteConfig["homepage"][Key]) {
    setConfig((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        [key]: value
      }
    }));
  }

  function updateFooter<Key extends keyof SiteConfig["footer"]>(key: Key, value: SiteConfig["footer"][Key]) {
    setConfig((current) => ({
      ...current,
      footer: {
        ...current.footer,
        [key]: value
      }
    }));
  }

  async function saveSettings() {
    setStatus("saving");
    const response = await fetch("/api/admin/site-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config)
    });
    setStatus(response.ok ? "saved" : "error");
  }

  return (
    <div className="site-builder">
      <div className="admin-panel-heading">
        <div>
          <h3>Site Components Builder</h3>
          <p>Control homepage sections, section titles, community copy, newsletter copy, and footer blocks.</p>
        </div>
        <button className="button" type="button" onClick={saveSettings} disabled={status === "saving"}>
          <Save size={18} /> {status === "saving" ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="builder-status" aria-live="polite">
        {status === "saved" ? "Saved. Refresh the public site to see the latest settings." : null}
        {status === "error" ? "Could not save settings. Please try again." : null}
      </div>

      <div className="builder-grid">
        <section className="builder-card">
          <h4>Homepage Sections</h4>
          <div className="builder-toggle-grid">
            {sectionToggles.map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={Boolean(config.homepage[key])}
                  onChange={(event) => updateHomepage(key, event.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section className="builder-card">
          <h4>Section Titles</h4>
          <TextField label="Categories eyebrow" value={config.homepage.categoriesEyebrow} onChange={(value) => updateHomepage("categoriesEyebrow", value)} />
          <TextField label="Categories title" value={config.homepage.categoriesTitle} onChange={(value) => updateHomepage("categoriesTitle", value)} />
          <TextField label="Best deals eyebrow" value={config.homepage.todaysDealsEyebrow} onChange={(value) => updateHomepage("todaysDealsEyebrow", value)} />
          <TextField label="Best deals title" value={config.homepage.todaysDealsTitle} onChange={(value) => updateHomepage("todaysDealsTitle", value)} />
          <TextField label="Trending eyebrow" value={config.homepage.trendingEyebrow} onChange={(value) => updateHomepage("trendingEyebrow", value)} />
          <TextField label="Trending title" value={config.homepage.trendingTitle} onChange={(value) => updateHomepage("trendingTitle", value)} />
          <TextField label="Articles eyebrow" value={config.homepage.articlesEyebrow} onChange={(value) => updateHomepage("articlesEyebrow", value)} />
          <TextField label="Articles title" value={config.homepage.articlesTitle} onChange={(value) => updateHomepage("articlesTitle", value)} />
        </section>

        <section className="builder-card">
          <h4>Community and Newsletter</h4>
          <TextField label="Community eyebrow" value={config.homepage.communityEyebrow} onChange={(value) => updateHomepage("communityEyebrow", value)} />
          <TextField label="Community title" value={config.homepage.communityTitle} onChange={(value) => updateHomepage("communityTitle", value)} />
          <TextArea label="Community text" value={config.homepage.communityText} onChange={(value) => updateHomepage("communityText", value)} />
          <TextField label="Newsletter title" value={config.homepage.newsletterTitle} onChange={(value) => updateHomepage("newsletterTitle", value)} />
          <TextArea label="Newsletter text" value={config.homepage.newsletterText} onChange={(value) => updateHomepage("newsletterText", value)} />
        </section>

        <section className="builder-card">
          <h4>Footer</h4>
          <TextField label="Footer title" value={config.footer.aboutTitle} onChange={(value) => updateFooter("aboutTitle", value)} />
          <TextArea label="Footer about text" value={config.footer.aboutText} onChange={(value) => updateFooter("aboutText", value)} />
          <div className="builder-toggle-grid compact">
            <label>
              <input type="checkbox" checked={config.footer.showCategories} onChange={(event) => updateFooter("showCategories", event.target.checked)} />
              Show Categories
            </label>
            <label>
              <input type="checkbox" checked={config.footer.showLegalPages} onChange={(event) => updateFooter("showLegalPages", event.target.checked)} />
              Show Legal Pages
            </label>
            <label>
              <input type="checkbox" checked={config.footer.showSocialMedia} onChange={(event) => updateFooter("showSocialMedia", event.target.checked)} />
              Show Social Media
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="builder-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="builder-field">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
