"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  canUseMetaPixel,
  getCookieConsent,
  initializeMetaPixel,
  pageView
} from "@/lib/meta-pixel";

const recordedPageViews = new Set<string>();

export function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelInner />
    </Suspense>
  );
}

function MetaPixelInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);
  const firstPixelPageViewHandled = useRef(false);
  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    const refresh = () => setAllowed(canUseMetaPixel());
    refresh();
    window.addEventListener(COOKIE_CONSENT_EVENT, refresh);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, refresh);
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    if (getCookieConsent().analytics) recordVisitorPageView(currentPath);

    if (!allowed) return;
    initializeMetaPixel();
    if (!firstPixelPageViewHandled.current) {
      firstPixelPageViewHandled.current = true;
      return;
    }
    pageView(currentPath);
  }, [allowed, currentPath, pathname]);

  return null;
}

function getVisitorId() {
  const key = "tdc_visitor_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const nextId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, nextId);
  return nextId;
}

function recordVisitorPageView(path: string) {
  if (recordedPageViews.has(path)) return;
  recordedPageViews.add(path);

  fetch("/api/analytics/visitor-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName: "PageView",
      path,
      referrer: document.referrer,
      visitorId: getVisitorId()
    }),
    keepalive: true
  }).catch(() => undefined);
}
