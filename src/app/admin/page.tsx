import {
  BarChart3,
  FileText,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  Megaphone,
  Radio,
  Settings,
  ShoppingBag,
  Store,
  Users
} from "lucide-react";
import { ArticleManager } from "@/components/admin/article-manager";
import { CategoryManager } from "@/components/admin/category-manager";
import { CreateProductButton } from "@/components/admin/create-product-button";
import { HeroSliderManager } from "@/components/admin/hero-slider-manager";
import { ProductManager } from "@/components/admin/product-manager";
import { SiteBuilderForm } from "@/components/admin/site-builder-form";
import { stores } from "@/lib/data";
import { getAllArticles } from "@/lib/article-store";
import { getAllCategories } from "@/lib/category-store";
import { getAllProducts } from "@/lib/product-store";
import { getSiteConfig } from "@/lib/site-config";

const adminNav = [
  ["Dashboard", LayoutDashboard],
  ["Site Builder", Settings],
  ["Products", ShoppingBag],
  ["Categories", FolderTree],
  ["Stores", Store],
  ["Articles", FileText],
  ["Media Library", ImageIcon],
  ["Subscribers", Users],
  ["Analytics", Radio],
  ["Settings", Settings]
];

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await getAllProducts();
  const articles = await getAllArticles();
  const categories = await getAllCategories();
  const siteConfig = await getSiteConfig();

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <h1>Admin Panel</h1>
        {adminNav.map(([label, Icon]) => (
          <a href={`#${String(label).toLowerCase().replaceAll(" ", "-")}`} key={String(label)}>
            <Icon size={18} /> {String(label)}
          </a>
        ))}
      </aside>
      <div className="admin-main">
        <section className="admin-topline">
          <div>
            <span className="eyebrow">Trusted Deals & Clearance</span>
            <h2>Dashboard</h2>
          </div>
          <CreateProductButton />
        </section>
        <section className="admin-stats">
          <Stat icon={<ShoppingBag />} label="Products" value={products.length} />
          <Stat icon={<FolderTree />} label="Categories" value={categories.length} />
          <Stat icon={<Store />} label="Stores" value={stores.length} />
          <Stat icon={<Users />} label="Subscribers" value="8,420" />
          <Stat icon={<BarChart3 />} label="Affiliate Clicks" value="12,940" />
          <Stat icon={<Megaphone />} label="Hero Clicks" value="1,306" />
          <Stat icon={<Users />} label="Community Clicks" value="842" />
          <Stat icon={<MailIcon />} label="Newsletter Conversions" value="2,184" />
        </section>
        <section className="admin-panel" id="products">
          <ProductManager initialProducts={products} />
        </section>
        <section className="admin-panel" id="site-builder">
          <SiteBuilderForm initialConfig={siteConfig} />
        </section>
        <section className="admin-grid">
          <div className="admin-panel" id="dashboard">
            <HeroSliderManager initialProducts={products} />
          </div>
          <div className="admin-panel" id="articles">
            <ArticleManager initialArticles={articles} />
          </div>
          <div className="admin-panel" id="categories">
            <CategoryManager initialCategories={categories} />
          </div>
          <div className="admin-panel" id="analytics">
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
          </div>
          <div className="admin-panel">
            <h3>Retargeting Performance</h3>
            <div className="analytics-list">
              <span>Total affiliate clicks <strong>12,940</strong></span>
              <span>Clicks by product <strong>Ninja Air Fryer</strong></span>
              <span>Clicks by category <strong>Home & Kitchen</strong></span>
              <span>Clicks by store <strong>Walmart</strong></span>
              <span>Top button location <strong>product_page</strong></span>
              <span>Top-performing article <strong>Clearance Shopping Checklist</strong></span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function MailIcon() {
  return <Users />;
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
