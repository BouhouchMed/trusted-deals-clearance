import Link from "next/link";
import { Facebook, Mail } from "lucide-react";
import { CookiePreferencesLink } from "@/components/analytics/cookie-preferences-link";
import { categories, settings } from "@/lib/data";
import { getSiteConfig } from "@/lib/site-config";

export async function Footer() {
  const siteConfig = await getSiteConfig();
  const footer = siteConfig.footer;

  return (
    <footer className="footer">
      <div className="footer-grid">
        <section>
          <h2>{footer.aboutTitle}</h2>
          <p>{footer.aboutText}</p>
        </section>
        {footer.showCategories ? (
          <section>
            <h3>Categories</h3>
            {categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.slug}>
                {category.title}
              </Link>
            ))}
          </section>
        ) : null}
        {footer.showLegalPages ? (
          <section>
            <h3>Legal Pages</h3>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/affiliate-disclosure">Affiliate Disclosure</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
            <CookiePreferencesLink />
            <Link href="/contact">Contact</Link>
          </section>
        ) : null}
        {footer.showSocialMedia ? (
          <section>
            <h3>Social Media</h3>
            <div className="social-row">
              <Link href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook />
              </Link>
              <Link href="/contact" aria-label="Email">
                <Mail />
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </footer>
  );
}
