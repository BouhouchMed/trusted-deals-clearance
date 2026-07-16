import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/analytics/cookie-consent";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteUrl } from "@/lib/data";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Trusted Deals & Clearance | Premium Daily Deals",
    template: "%s | Trusted Deals & Clearance"
  },
  description:
    "A premium American shopping magazine for Walmart deals, home bargains, electronics offers, clearance finds, coupons, and practical buying guides.",
  applicationName: "Trusted Deals & Clearance",
  authors: [{ name: "Trusted Deals & Clearance", url: siteUrl }],
  creator: "Trusted Deals & Clearance",
  publisher: "Trusted Deals & Clearance",
  category: "Shopping",
  keywords: [
    "Walmart deals",
    "clearance deals",
    "daily deals",
    "home deals",
    "electronics deals",
    "furniture deals",
    "fashion deals",
    "affiliate deals",
    "US shopping deals"
  ],
  openGraph: {
    title: "Trusted Deals & Clearance",
    description: "Daily discounts, Walmart deals, home bargains, electronics offers, and exclusive clearance finds.",
    url: siteUrl,
    siteName: "Trusted Deals & Clearance",
    locale: "en_US",
    type: "website",
    images: [{ url: "/LOGO.png", width: 1200, height: 630, alt: "Trusted Deals & Clearance" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Trusted Deals & Clearance",
    description: "Premium daily deals for American shoppers.",
    images: ["/LOGO.png"]
  },
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": `${siteUrl}/rss.xml`
    }
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]) }}
        />
        <Header />
        <MetaPixel />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
