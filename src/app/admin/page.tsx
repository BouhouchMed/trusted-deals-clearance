import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";
import { createCaptchaChallenge, isAdminAuthenticated } from "@/lib/admin-auth";
import { getAnalyticsSummary } from "@/lib/analytics-store";
import { getAllArticles } from "@/lib/article-store";
import { getAllCategories } from "@/lib/category-store";
import { getAllProducts } from "@/lib/product-store";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    const captcha = createCaptchaChallenge();
    return <AdminLogin captchaQuestion={captcha.question} captchaToken={captcha.token} />;
  }

  const products = await getAllProducts();
  const articles = await getAllArticles();
  const categories = await getAllCategories();
  const siteConfig = await getSiteConfig();
  const analytics = await getAnalyticsSummary();

  return <AdminDashboardShell analytics={analytics} articles={articles} categories={categories} products={products} siteConfig={siteConfig} />;
}
