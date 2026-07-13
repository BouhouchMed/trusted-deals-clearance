import { settings } from "@/lib/data";

export default function AffiliateDisclosurePage() {
  return (
    <section className="simple-page">
      <span className="eyebrow">Legal</span>
      <h1>Affiliate Disclosure</h1>
      <p>{settings.affiliateDisclosure}</p>
    </section>
  );
}
