"use client";

import {
  BarChart3,
  FileText,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Settings,
  ShoppingBag,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { ArticleManager } from "@/components/admin/article-manager";
import { CategoryManager } from "@/components/admin/category-manager";
import { CreateProductButton } from "@/components/admin/create-product-button";
import { HeroSliderManager } from "@/components/admin/hero-slider-manager";
import { ProductManager } from "@/components/admin/product-manager";
import { SiteBuilderForm } from "@/components/admin/site-builder-form";
import { AnalyticsSummary } from "@/lib/analytics-store";
import { SiteConfig } from "@/lib/site-config";
import { Article, Category, Product } from "@/lib/types";

const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "site-builder", label: "Site Builder", icon: Settings },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "media-library", label: "Media Library", icon: ImageIcon },
  { id: "subscribers", label: "Subscribers", icon: Users },
  { id: "analytics", label: "Analytics", icon: Radio },
  { id: "settings", label: "Settings", icon: Settings }
] as const;

type AdminPageId = (typeof adminNav)[number]["id"];

type Props = {
  analytics: AnalyticsSummary;
  articles: Article[];
  categories: Category[];
  products: Product[];
  siteConfig: SiteConfig;
};

export function AdminDashboardShell({ analytics, articles, categories, products, siteConfig }: Props) {
  const [activePage, setActivePage] = useState<AdminPageId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (adminNav.some((item) => item.id === hash)) setActivePage(hash as AdminPageId);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function openPage(pageId: AdminPageId) {
    setActivePage(pageId);
    window.history.replaceState(null, "", `#${pageId}`);
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => !current);
  }

  const activeLabel = adminNav.find((item) => item.id === activePage)?.label ?? "Dashboard";

  return (
    <section className={`admin-shell${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1>
            <span className="admin-sidebar-mark">TD</span>
            <span className="admin-sidebar-title">Admin Panel</span>
          </h1>
          <button className="admin-sidebar-toggle" type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Show menu labels" : "Hide menu labels"}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        {adminNav.map(({ id, label, icon: Icon }) => (
          <button className={activePage === id ? "active" : ""} type="button" onClick={() => openPage(id)} title={label} key={id}>
            <Icon size={18} /> <span className="admin-nav-label">{label}</span>
          </button>
        ))}
      </aside>
      <div className="admin-main">
        <section className="admin-topline">
          <div>
            <span className="eyebrow">Trusted Deals & Clearance</span>
            <h2>{activeLabel}</h2>
          </div>
          <CreateProductButton />
        </section>

        <div className="admin-pages">
          <AdminPagePanel id="dashboard" activePage={activePage}>
            <div className="admin-stats">
              <Stat icon={<ShoppingBag />} label="Products" value={products.length} />
              <Stat icon={<FolderTree />} label="Categories" value={categories.length} />
              <Stat icon={<Users />} label="Visitors" value={analytics.uniqueVisitors} />
              <Stat icon={<BarChart3 />} label="Page Views" value={analytics.pageViews} />
              <Stat icon={<BarChart3 />} label="Affiliate Clicks" value={analytics.affiliateClicks} />
              <Stat icon={<Megaphone />} label="Hero Clicks" value="1,306" />
              <Stat icon={<Users />} label="Community Clicks" value={analytics.communityClicks} />
              <Stat icon={<Users />} label="Newsletter Conversions" value={analytics.newsletterConversions} />
            </div>
            <div className="admin-section-grid">
              {adminNav
                .filter((item) => item.id !== "dashboard")
                .map(({ id, label, icon: Icon }) => (
                  <button type="button" onClick={() => openPage(id)} key={id}>
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                ))}
            </div>
            <HeroSliderManager initialProducts={products} />
          </AdminPagePanel>

          <AdminPagePanel id="site-builder" activePage={activePage}>
            <SiteBuilderForm initialConfig={siteConfig} />
          </AdminPagePanel>

          <AdminPagePanel id="products" activePage={activePage}>
            <ProductManager initialProducts={products} />
          </AdminPagePanel>

          <AdminPagePanel id="categories" activePage={activePage}>
            <CategoryManager initialCategories={categories} />
          </AdminPagePanel>

          <AdminPagePanel id="articles" activePage={activePage}>
            <ArticleManager initialArticles={articles} />
          </AdminPagePanel>

          <AdminPagePanel id="media-library" activePage={activePage}>
            <div className="admin-panel-heading">
              <div>
                <h3>Media Library</h3>
                <p>Keep hero images, category images, and product image URLs organized.</p>
              </div>
            </div>
            <div className="analytics-list">
              <span>Product images <strong>{products.length}</strong></span>
              <span>Category hero images <strong>{categories.length}</strong></span>
              <span>Article images <strong>{articles.length}</strong></span>
            </div>
          </AdminPagePanel>

          <AdminPagePanel id="subscribers" activePage={activePage}>
            <div className="admin-panel-heading">
              <div>
                <h3>Subscribers</h3>
                <p>Newsletter and deal alert subscribers will appear here when connected to Supabase.</p>
              </div>
            </div>
            <div className="analytics-list">
              <span>Total visitors <strong>{analytics.uniqueVisitors}</strong></span>
              <span>Newsletter conversions <strong>{analytics.newsletterConversions}</strong></span>
              <span>Community clicks <strong>{analytics.communityClicks}</strong></span>
            </div>
          </AdminPagePanel>

          <AdminPagePanel id="analytics" activePage={activePage}>
            <h3>Analytics Settings</h3>
            <p>Public settings can live in application settings. Secrets must stay in server-side environment variables.</p>
            <div className="settings-grid">
              <label>Meta Pixel ID<input placeholder="NEXT_PUBLIC_META_PIXEL_ID" /></label>
              <label>Default currency<input defaultValue="USD" /></label>
              <label><input type="checkbox" defaultChecked /> Enable Meta Pixel</label>
              <label><input type="checkbox" /> Enable advanced matching</label>
              <label><input type="checkbox" defaultChecked /> Enable marketing cookie consent</label>
              <label><input type="checkbox" defaultChecked /> Enable custom affiliate click events</label>
              <label><input type="checkbox" /> Enable Meta Conversions API</label>
              <label>Meta Test Event Code<input placeholder="META_TEST_EVENT_CODE" /></label>
              <label>Conversions API Token<input placeholder="Stored only as META_CONVERSIONS_API_TOKEN" type="password" disabled /></label>
            </div>
            <hr className="admin-divider" />
            <h3>Retargeting Performance</h3>
            <div className="analytics-list">
              <span>Total page views <strong>{analytics.pageViews}</strong></span>
              <span>Unique visitors <strong>{analytics.uniqueVisitors}</strong></span>
              <span>Total affiliate clicks <strong>{analytics.affiliateClicks}</strong></span>
              <span>Top page <strong>{analytics.topPage}</strong></span>
              <span>Top store <strong>{analytics.topStore}</strong></span>
              <span>Top button location <strong>product_page</strong></span>
              <span>Last updated <strong>{analytics.lastUpdated.slice(0, 16).replace("T", " ")}</strong></span>
            </div>
          </AdminPagePanel>

          <AdminPagePanel id="settings" activePage={activePage}>
            <div className="admin-panel-heading">
              <div>
                <h3>Settings</h3>
                <p>Manage global defaults and environment-backed integrations.</p>
              </div>
            </div>
            <div className="settings-grid">
              <label>Default currency<input defaultValue="USD" /></label>
              <label>Default locale<input defaultValue="en-US" /></label>
              <label><input type="checkbox" defaultChecked /> Publish products by default</label>
              <label><input type="checkbox" defaultChecked /> Show affiliate disclosure links</label>
            </div>
          </AdminPagePanel>
        </div>
      </div>
    </section>
  );
}

function AdminPagePanel({ activePage, children, id }: { activePage: AdminPageId; children: React.ReactNode; id: AdminPageId }) {
  return (
    <section className="admin-page-panel" id={id} hidden={activePage !== id}>
      {children}
    </section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="stat-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
