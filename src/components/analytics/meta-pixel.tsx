"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  DEFAULT_META_PIXEL_ID,
  canUseMetaPixel,
  getCookieConsent,
  hasValidPixelId,
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
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || DEFAULT_META_PIXEL_ID;
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

  if (!pixelId || !hasValidPixelId() || !allowed) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onReady={() => {
          initializeMetaPixel();
        }}
      >
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
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
