"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  destinationDomain: string;
  destinationUrl: string;
};

export function AffiliateRedirectLanding({ destinationDomain, destinationUrl }: Props) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const messageTimer = window.setTimeout(() => setIsRedirecting(true), 600);
    const redirectTimer = window.setTimeout(() => {
      window.location.assign(destinationUrl);
    }, 1200);

    return () => {
      window.clearTimeout(messageTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [destinationUrl]);

  return (
    <main className="redirect-page">
      <section className="redirect-card" aria-live="polite">
        <div className="redirect-icon">
          <ShieldCheck size={34} />
        </div>
        <p className="redirect-kicker">{destinationDomain}</p>
        <h1>{isRedirecting ? "Redirecting you to the product page" : "Checking your connection"}</h1>
        <div className="redirect-progress" aria-hidden="true">
          <span />
        </div>
        <a className="button" href={destinationUrl} rel="nofollow sponsored">
          Continue
        </a>
      </section>
    </main>
  );
}
