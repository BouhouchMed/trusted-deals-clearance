"use client";

import {
  BarChart3,
  FileText,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBag,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminUserSettings } from "@/components/admin/admin-user-settings";
import { ArticleManager } from "@/components/admin/article-manager";
import { CategoryManager } from "@/components/admin/category-manager";
import { HeroSliderManager } from "@/components/admin/hero-slider-manager";
import { ProductManager } from "@/components/admin/product-manager";
import { SiteBuilderForm } from "@/components/admin/site-builder-form";
import { AnalyticsSummary } from "@/lib/analytics-store";
import { SiteConfig } from "@/lib/site-config";
import { Article, Category, Product } from "@/lib/types";
import type { SecondaryAdminSettings } from "@/lib/admin-users-store";

const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "site-builder", label: "Site Builder", icon: Settings },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "media-library", label: "Media Library", icon: ImageIcon },
  { id: "subscribers", label: "Subscribers", icon: Users },
  { id: "settings", label: "Settings", icon: Settings }
] as const;

type AdminPageId = (typeof adminNav)[number]["id"];

type Props = {
  analytics: AnalyticsSummary;
  articles: Article[];
  categories: Category[];
  products: Product[];
  secondaryAdmin: SecondaryAdminSettings;
  siteConfig: SiteConfig;
};

export function AdminDashboardShell({ analytics, articles, categories, products, secondaryAdmin, siteConfig }: Props) {
  const [activePage, setActivePage] = useState<AdminPageId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
    window.location.reload();
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
          <button className="admin-logout-button" type="button" onClick={logout} disabled={loggingOut}>
            <LogOut size={18} />
            <span>{loggingOut ? "Signing out..." : "Logout"}</span>
          </button>
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
            <hr className="admin-divider" />
            <div className="admin-panel-heading">
              <div>
                <h3>Admin Access</h3>
                <p>Manage the second admin account and update its password.</p>
              </div>
            </div>
            <AdminUserSettings initialSettings={secondaryAdmin} />
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
