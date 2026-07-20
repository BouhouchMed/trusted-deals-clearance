import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export type SiteConfig = {
  brandName: string;
  homepage: {
    showHero: boolean;
    showCategories: boolean;
    showTodaysDeals: boolean;
    showTrendingDeals: boolean;
    showLatestArticles: boolean;
    showCommunity: boolean;
    showNewsletter: boolean;
    categoriesEyebrow: string;
    categoriesTitle: string;
    todaysDealsEyebrow: string;
    todaysDealsTitle: string;
    trendingEyebrow: string;
    trendingTitle: string;
    articlesEyebrow: string;
    articlesTitle: string;
    communityEyebrow: string;
    communityTitle: string;
    communityText: string;
    newsletterTitle: string;
    newsletterText: string;
  };
  footer: {
    aboutTitle: string;
    aboutText: string;
    showCategories: boolean;
    showLegalPages: boolean;
    showSocialMedia: boolean;
  };
};

export const defaultSiteConfig: SiteConfig = {
  brandName: "Trusted Deals & Clearance",
  homepage: {
    showHero: true,
    showCategories: true,
    showTodaysDeals: true,
    showTrendingDeals: true,
    showLatestArticles: true,
    showCommunity: true,
    showNewsletter: true,
    categoriesEyebrow: "Browse by aisle",
    categoriesTitle: "Featured Categories",
    todaysDealsEyebrow: "Fresh finds",
    todaysDealsTitle: "Best Deals",
    trendingEyebrow: "Community favorites",
    trendingTitle: "Trending Deals",
    articlesEyebrow: "Smart shopping",
    articlesTitle: "Latest Articles",
    communityEyebrow: "Deal alerts together",
    communityTitle: "Join Our Facebook Community",
    communityText:
      "Join thousands of American shoppers discovering daily discounts, Walmart deals, home bargains, electronics offers and exclusive clearance finds.",
    newsletterTitle: "Never Miss a Great Deal",
    newsletterText: "Weekly editor picks, coupon reminders, and clearance alerts in one calm, useful email."
  },
  footer: {
    aboutTitle: "Trusted Deals & Clearance",
    aboutText:
      "A premium deals magazine helping U.S. shoppers find practical savings, Walmart rollbacks, home bargains, electronics offers, and clearance gems.",
    showCategories: true,
    showLegalPages: true,
    showSocialMedia: true
  }
};

const configPath = path.join(process.cwd(), "src", "lib", "site-config.json");

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("settings").select("value").eq("key", "site_config").single();
    if (!error && data?.value) return mergeConfig(data.value as Partial<SiteConfig>);
  }

  try {
    const raw = await readFile(configPath, "utf8");
    return mergeConfig(JSON.parse(raw) as Partial<SiteConfig>);
  } catch {
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(config: SiteConfig) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("settings").upsert({
      key: "site_config",
      value: mergeConfig(config),
      updated_at: new Date().toISOString()
    });
    if (error) throw new Error(error.message);
    return;
  }

  await writeFile(configPath, `${JSON.stringify(mergeConfig(config), null, 2)}\n`, "utf8");
}

export function mergeConfig(config: Partial<SiteConfig>): SiteConfig {
  const homepage = {
    ...defaultSiteConfig.homepage,
    ...config.homepage
  };

  if (homepage.todaysDealsTitle === "Today's Best Deals") {
    homepage.todaysDealsTitle = "Best Deals";
  }

  return {
    ...defaultSiteConfig,
    ...config,
    homepage,
    footer: {
      ...defaultSiteConfig.footer,
      ...config.footer
    }
  };
}
