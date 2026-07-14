import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";
import { getAnalyticsSummary } from "@/lib/analytics-store";
import { getAllArticles } from "@/lib/article-store";
import { getAllCategories } from "@/lib/category-store";
import { getAllProducts } from "@/lib/product-store";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await getAllProducts();
  const articles = await getAllArticles();
  const categories = await getAllCategories();
  const siteConfig = await getSiteConfig();
  const analytics = await getAnalyticsSummary();

  return <AdminDashboardShell analytics={analytics} articles={articles} categories={categories} products={products} siteConfig={siteConfig} />;
}
