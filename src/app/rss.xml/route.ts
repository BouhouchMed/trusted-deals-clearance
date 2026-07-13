import { siteUrl } from "@/lib/data";
import { getAllArticles } from "@/lib/article-store";

export async function GET() {
  const articles = await getAllArticles();
  const items = articles
    .map(
      (article) => `
        <item>
          <title>${article.title}</title>
          <link>${siteUrl}/blog/${article.slug}</link>
          <description>${article.excerpt}</description>
          <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
        </item>`
    )
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>Trusted Deals & Clearance</title>
        <link>${siteUrl}</link>
        <description>Daily deals, shopping guides, and clearance finds.</description>
        ${items}
      </channel>
    </rss>`,
    { headers: { "Content-Type": "application/rss+xml" } }
  );
}
