"use client";

import { setAdvancedMatchingEmail, trackContact, trackLead } from "@/lib/meta-pixel";

export function ContactForm() {
  return (
    <form
      className="contact-form"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setAdvancedMatchingEmail(String(formData.get("email") ?? ""));
        trackLead("contact_form");
        trackContact("contact_form");
      }}
    >
      <input placeholder="Name" aria-label="Name" />
      <input name="email" placeholder="Email" type="email" aria-label="Email" required />
      <textarea placeholder="Message" aria-label="Message" />
      <button className="button" type="submit">
        Send Message
      </button>
    </form>
  );
}
