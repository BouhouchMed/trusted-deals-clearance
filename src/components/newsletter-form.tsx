"use client";

import { setAdvancedMatchingEmail, trackDealAlertSignup, trackSubscribe } from "@/lib/meta-pixel";

export function NewsletterForm({ source = "homepage" }: { source?: string }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setAdvancedMatchingEmail(String(formData.get("email") ?? ""));
        trackSubscribe(source);
        trackDealAlertSignup({ alertType: "newsletter", category: "all" });
      }}
    >
      <input name="email" type="email" placeholder="Email address" aria-label="Email address" required />
      <button className="button" type="submit">
        Subscribe
      </button>
    </form>
  );
}
