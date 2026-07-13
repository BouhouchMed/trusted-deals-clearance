"use client";

export function CookiePreferencesLink() {
  return (
    <button
      className="footer-link-button"
      type="button"
      onClick={() => window.dispatchEvent(new Event("tdc-open-cookie-preferences"))}
    >
      Cookie Preferences
    </button>
  );
}
