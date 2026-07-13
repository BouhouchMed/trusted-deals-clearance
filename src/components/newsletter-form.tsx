"use client";

import { trackDealAlertSignup, trackSubscribe } from "@/lib/meta-pixel";

export function NewsletterForm({ source = "homepage" }: { source?: string }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        trackSubscribe(source);
        trackDealAlertSignup({ alertType: "newsletter", category: "all" });
      }}
    >
      <input type="email" placeholder="Email address" aria-label="Email address" required />
      <button className="button" type="submit">
        Subscribe
      </button>
    </form>
  );
}
