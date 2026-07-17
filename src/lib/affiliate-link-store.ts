import { randomBytes } from "crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { siteUrl } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export type AffiliateLink = {
  createdAt: string;
  destinationUrl: string;
  localUrl: string;
  slug: string;
  title: string;
};

const linksPath = path.join(process.cwd(), "src", "lib", "admin-affiliate-links.json");
const settingsKey = "affiliate_links";

export async function getAffiliateLinks(): Promise<AffiliateLink[]> {
  const links = await getStoredLinks();
  return links.map((link) => ({ ...link, localUrl: getLocalUrl(link.slug) }));
}

export async function getAffiliateLinkBySlug(slug: string) {
  const links = await getAffiliateLinks();
  return links.find((link) => link.slug === slug);
}

export async function createAffiliateLink(input: { destinationUrl: string; title?: string }) {
  const destinationUrl = normalizeDestinationUrl(input.destinationUrl);
  const links = await getStoredLinks();
  const hostname = new URL(destinationUrl).hostname.replace(/^www\./, "");
  const title = input.title?.trim() || hostname;
  const slug = createUniqueCodeSlug(links);
  const link: AffiliateLink = {
    createdAt: new Date().toISOString(),
    destinationUrl,
    localUrl: getLocalUrl(slug),
    slug,
    title
  };

  await saveStoredLinks([link, ...links]);
  return link;
}

export async function deleteAffiliateLink(slug: string) {
  const links = await getStoredLinks();
  await saveStoredLinks(links.filter((link) => link.slug !== slug));
}

function normalizeDestinationUrl(value: string) {
  const trimmed = value.trim();
  const url = new URL(trimmed);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Affiliate URL must start with http or https.");
  return url.toString();
}

function createUniqueCodeSlug(links: AffiliateLink[]) {
  const existing = new Set(links.map((link) => link.slug));
  let slug = createRandomCode();
  while (existing.has(slug)) slug = createRandomCode();
  return slug;
}

function createRandomCode(length = 13) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function getLocalUrl(slug: string) {
  return `${siteUrl}/r/${slug}`;
}

async function getStoredLinks(): Promise<AffiliateLink[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("settings").select("value").eq("key", settingsKey).single();
    if (!error && Array.isArray(data?.value)) return data.value as AffiliateLink[];
  }

  try {
    const raw = await readFile(linksPath, "utf8");
    return JSON.parse(raw) as AffiliateLink[];
  } catch {
    return [];
  }
}

async function saveStoredLinks(links: AffiliateLink[]) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("settings").upsert({
      key: settingsKey,
      value: links,
      updated_at: new Date().toISOString()
    });
    if (error) throw new Error(error.message);
    return;
  }

  await writeFile(linksPath, `${JSON.stringify(links, null, 2)}\n`, "utf8");
}
