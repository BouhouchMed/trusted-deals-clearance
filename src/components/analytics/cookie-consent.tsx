"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { COOKIE_CONSENT_EVENT, CookieConsentPreferences, getCookieConsent, setCookieConsent } from "@/lib/meta-pixel";

const acceptAll: CookieConsentPreferences = { essential: true, analytics: true, marketing: true };
const rejectNonEssential: CookieConsentPreferences = { essential: true, analytics: false, marketing: false };

export function CookieConsent() {
  const needsInitialChoice = useSyncExternalStore(subscribeToConsentChanges, getNeedsInitialChoice, () => false);
  const [forcedOpen, setForcedOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(acceptAll);

  useEffect(() => {
    const openPreferences = () => {
      setPreferences(getCookieConsent());
      setForcedOpen(true);
      setCustomizing(true);
    };
    window.addEventListener("tdc-open-cookie-preferences", openPreferences);
    return () => {
      window.removeEventListener("tdc-open-cookie-preferences", openPreferences);
    };
  }, []);

  function save(next: CookieConsentPreferences) {
    setCookieConsent(next);
    setPreferences(next);
    setForcedOpen(false);
  }

  if (!needsInitialChoice && !forcedOpen) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie preferences">
      <div>
        <h2>Cookie Preferences</h2>
        <p>
          Analytics and marketing cookies are enabled by default to help us measure engagement, including Meta Pixel
          activity. You can reject or customize these choices at any time.
        </p>
        {customizing ? (
          <div className="cookie-options">
            <label>
              <input type="checkbox" checked disabled /> Essential
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(event) => setPreferences({ ...preferences, analytics: event.target.checked })}
              />
              Analytics
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(event) => setPreferences({ ...preferences, marketing: event.target.checked })}
              />
              Marketing
            </label>
          </div>
        ) : null}
      </div>
      <div className="cookie-actions">
        <Link className="cookie-details-link" href="/cookie-policy">
          Cookie Details
        </Link>
        {customizing ? (
          <button className="button" type="button" onClick={() => save(preferences)}>
            Save Preferences
          </button>
        ) : (
          <button type="button" onClick={() => setCustomizing(true)}>
            Customize Preferences
          </button>
        )}
        <button type="button" onClick={() => save(rejectNonEssential)}>
          Reject Non-Essential
        </button>
        <button className="button" type="button" onClick={() => save(acceptAll)}>
          Accept All
        </button>
      </div>
    </div>
  );
}

function subscribeToConsentChanges(callback: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getNeedsInitialChoice() {
  return !window.localStorage.getItem("tdc_cookie_preferences");
}
