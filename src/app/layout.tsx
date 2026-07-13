import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/analytics/cookie-consent";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { siteUrl } from "@/lib/data";

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
  openGraph: {
    title: "Trusted Deals & Clearance",
    description: "Daily discounts, Walmart deals, home bargains, electronics offers, and exclusive clearance finds.",
    url: siteUrl,
    siteName: "Trusted Deals & Clearance",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Trusted Deals & Clearance",
    description: "Premium daily deals for American shoppers."
  },
  alternates: {
    canonical: siteUrl,
    types: {
      "application/rss+xml": `${siteUrl}/rss.xml`
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <Header />
        <MetaPixel />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
