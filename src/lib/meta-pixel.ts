"use client";

export type CookieConsentPreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

type EventPayload = Record<string, string | number | boolean | null | undefined | string[] | number[]>;

export type ProductEventPayload = {
  productId: string;
  productName: string;
  category: string;
  store: string;
  value: number;
  currency?: string;
};

export type DealEventPayload = ProductEventPayload & {
  regularPrice: number;
  salePrice: number;
  discountPercentage: number;
  destinationUrl?: string;
  affiliateNetwork?: string;
  buttonLocation?: string;
};

declare global {
  interface Window {
    fbq?: (
      action: "init" | "track" | "trackCustom",
      eventName: string,
      params?: EventPayload,
      options?: { eventID?: string }
    ) => void;
    _fbq?: unknown;
  }
}

export const COOKIE_CONSENT_KEY = "tdc_cookie_preferences";
export const COOKIE_CONSENT_EVENT = "tdc-cookie-consent-change";

export const DEFAULT_META_PIXEL_ID = "898963533504103";

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID;
const enableInDev = process.env.NEXT_PUBLIC_ENABLE_META_PIXEL_IN_DEV === "true";
const enableAdvancedMatching = process.env.NEXT_PUBLIC_ENABLE_META_ADVANCED_MATCHING !== "false";
const enableServerEvents = process.env.NEXT_PUBLIC_ENABLE_META_CONVERSIONS_API === "true";
const initialized = { current: false };
const firedEvents = new Set<string>(["PageView:/"]);
const advancedMatching = { email: "" };
const pendingConsent: CookieConsentPreferences = { essential: true, analytics: false, marketing: false };

export function hasValidPixelId() {
  return Boolean(pixelId && /^[0-9]{6,30}$/.test(pixelId));
}

export function canUseMetaPixel() {
  if (typeof window === "undefined") return false;
  if (!hasValidPixelId()) return false;
  if (process.env.NODE_ENV === "development" && !enableInDev) return false;
  if (window.location.pathname.startsWith("/admin")) return false;
  return getCookieConsent().marketing;
}

export function getCookieConsent(): CookieConsentPreferences {
  if (typeof window === "undefined") return pendingConsent;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return pendingConsent;
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
    return { essential: true, analytics: Boolean(parsed.analytics), marketing: Boolean(parsed.marketing) };
  } catch {
    return pendingConsent;
  }
}

export function setCookieConsent(preferences: CookieConsentPreferences) {
  window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: preferences }));
}

export function initializeMetaPixel() {
  if (!canUseMetaPixel() || initialized.current || !pixelId) return;
  if (!window.fbq) return;
  if (advancedMatching.email) window.fbq("init", pixelId, getAdvancedMatchingPayload());
  initialized.current = true;
  devLog("Meta Pixel initialized", { pixelId });
}

export function setAdvancedMatchingEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !enableAdvancedMatching || !canUseMetaPixel()) return;

  advancedMatching.email = normalizedEmail;

  if (initialized.current && pixelId && window.fbq) {
    window.fbq("init", pixelId, getAdvancedMatchingPayload());
  }
}

export function createEventId(eventName: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${eventName}_${crypto.randomUUID()}`;
  return `${eventName}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function sendBrowserEvent(eventName: string, payload: EventPayload = {}, custom = false, eventId = createEventId(eventName)) {
  if (!canUseMetaPixel()) return eventId;
  initializeMetaPixel();
  try {
    window.fbq?.(custom ? "trackCustom" : "track", eventName, payload, { eventID: eventId });
    devLog(`Meta ${custom ? "custom " : ""}event`, { eventName, payload, eventId });
  } catch {
    return eventId;
  }
  return eventId;
}

function sendServerEvent(eventName: string, payload: EventPayload, eventId: string) {
  if (!enableServerEvents || typeof window === "undefined" || !getCookieConsent().marketing) return;
  fetch("/api/analytics/meta-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      payload
    }),
    keepalive: true
  }).catch(() => undefined);
}

export function pageView(path: string) {
  const key = `PageView:${path}`;
  if (firedEvents.has(key)) return;
  firedEvents.add(key);
  sendBrowserEvent("PageView");
}

export function trackViewContent(payload: ProductEventPayload) {
  const eventId = sendBrowserEvent("ViewContent", {
    content_ids: [payload.productId],
    content_name: payload.productName,
    content_category: payload.category,
    content_type: "product",
    value: payload.value,
    currency: payload.currency ?? "USD",
    store_name: payload.store
  });
  sendServerEvent("ViewContent", payload as unknown as EventPayload, eventId);
}

export function trackSearch(searchString: string, contentCategory = "global") {
  if (!searchString.trim()) return;
  const eventId = sendBrowserEvent("Search", { search_string: searchString, content_category: contentCategory });
  sendServerEvent("Search", { search_string: searchString, content_category: contentCategory }, eventId);
}

export function trackLead(source: string) {
  const eventId = sendBrowserEvent("Lead", { source });
  sendServerEvent("Lead", { source }, eventId);
}

export function trackSubscribe(source: string) {
  const eventId = sendBrowserEvent("Subscribe", { subscription_source: source });
  sendServerEvent("Subscribe", { subscription_source: source }, eventId);
}

export function trackContact(source = "contact_form") {
  const eventId = sendBrowserEvent("Contact", { source });
  sendServerEvent("Contact", { source }, eventId);
}

export function trackCompleteRegistration(source = "account") {
  const eventId = sendBrowserEvent("CompleteRegistration", { source });
  sendServerEvent("CompleteRegistration", { source }, eventId);
}

export function trackAddToWishlist(payload: ProductEventPayload & { buttonLocation?: string }) {
  sendBrowserEvent("AddToWishlist", {
    content_ids: [payload.productId],
    content_name: payload.productName,
    content_category: payload.category,
    value: payload.value,
    currency: payload.currency ?? "USD",
    button_location: payload.buttonLocation
  });
}

export function trackViewDeal(payload: DealEventPayload) {
  const eventId = sendBrowserEvent(
    "ViewDeal",
    {
      product_id: payload.productId,
      product_name: payload.productName,
      category: payload.category,
      store: payload.store,
      regular_price: payload.regularPrice,
      sale_price: payload.salePrice,
      discount_percentage: payload.discountPercentage,
      currency: payload.currency ?? "USD",
      destination_url: payload.destinationUrl
    },
    true
  );
  sendServerEvent("ViewDeal", payload as unknown as EventPayload, eventId);
}

export function trackAffiliateClick(payload: DealEventPayload) {
  const eventId = sendBrowserEvent(
    "AffiliateClick",
    {
      product_id: payload.productId,
      product_name: payload.productName,
      store: payload.store,
      category: payload.category,
      affiliate_network: payload.affiliateNetwork,
      button_location: payload.buttonLocation,
      currency: payload.currency ?? "USD",
      value: payload.salePrice
    },
    true
  );
  sendServerEvent("AffiliateClick", payload as unknown as EventPayload, eventId);
}

export function trackCouponCopy(payload: ProductEventPayload & { couponCode: string }) {
  sendBrowserEvent(
    "CouponCopy",
    {
      product_id: payload.productId,
      coupon_code: payload.couponCode,
      store: payload.store,
      category: payload.category
    },
    true
  );
}

export function trackJoinFacebookCommunity(buttonLocation: string, campaignName = "facebook_community") {
  sendBrowserEvent(
    "JoinFacebookCommunity",
    {
      button_location: buttonLocation,
      page_path: window.location.pathname,
      campaign_name: campaignName
    },
    true
  );
}

export function trackDealAlertSignup(payload: { alertType: string; category?: string; store?: string; productId?: string }) {
  sendBrowserEvent("DealAlertSignup", {
    alert_type: payload.alertType,
    category: payload.category,
    store: payload.store,
    product_id: payload.productId
  }, true);
}

export function trackExpiredDealView(payload: ProductEventPayload) {
  sendBrowserEvent(
    "ExpiredDealView",
    {
      product_id: payload.productId,
      product_name: payload.productName,
      category: payload.category,
      store: payload.store
    },
    true
  );
}

export function trackHeroSlideView(payload: ProductEventPayload & { slidePosition: number }) {
  sendBrowserEvent(
    "HeroSlideView",
    {
      product_id: payload.productId,
      product_name: payload.productName,
      slide_position: payload.slidePosition,
      category: payload.category,
      store: payload.store,
      sale_price: payload.value,
      currency: payload.currency ?? "USD"
    },
    true
  );
}

export function trackHeroSlideClick(payload: ProductEventPayload & { slidePosition: number; buttonText: string }) {
  sendBrowserEvent(
    "HeroSlideClick",
    {
      product_id: payload.productId,
      product_name: payload.productName,
      slide_position: payload.slidePosition,
      button_text: payload.buttonText,
      category: payload.category,
      store: payload.store,
      sale_price: payload.value,
      currency: payload.currency ?? "USD"
    },
    true
  );
}

export function trackCustomEvent(eventName: string, payload: EventPayload = {}) {
  sendBrowserEvent(eventName, payload, true);
}

function devLog(message: string, payload?: unknown) {
  if (process.env.NODE_ENV === "development") console.info(`[analytics] ${message}`, payload);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAdvancedMatchingPayload() {
  if (!enableAdvancedMatching || !advancedMatching.email) return undefined;
  return { em: advancedMatching.email };
}
