import Link from "next/link";
import { stores } from "@/lib/data";

export function PartnersSlider() {
  const partners = [...stores, ...stores];

  return (
    <section className="partners-slider-section" aria-label="Retail partners">
      <div className="partners-slider-heading">
        <span className="eyebrow">Trusted retailers</span>
        <h2>Our Partner Stores</h2>
      </div>
      <div className="partners-slider" aria-hidden="false">
        <div className="partners-track">
          {partners.map((store, index) => (
            <Link className="partner-logo-card" href={store.url} target="_blank" rel="noreferrer" key={`${store.id}-${index}`}>
              <span>{store.logo}</span>
              <strong>{store.name}</strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
