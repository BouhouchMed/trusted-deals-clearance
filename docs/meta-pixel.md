# Meta Pixel and Retargeting Setup

## Environment variables

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
NEXT_PUBLIC_ENABLE_MARKETING_COOKIE_CONSENT=true
NEXT_PUBLIC_ENABLE_META_CONVERSIONS_API=true
META_CONVERSIONS_API_TOKEN=server-side-token
META_TEST_EVENT_CODE=TEST12345
```

`META_CONVERSIONS_API_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` are server-only secrets. Never expose them to browser code.

## Testing in development

Meta Pixel is disabled in local development unless:

```bash
NEXT_PUBLIC_ENABLE_META_PIXEL_IN_DEV=true
```

Use Meta Events Manager Test Events with `META_TEST_EVENT_CODE` to verify events.

## Browser events to verify

- `PageView`: accept marketing cookies, then open `/`, `/category/home-kitchen`, `/blog`, `/search?q=air fryer`.
- `ViewContent`: open `/products/ninja-air-fryer-max-xl`.
- `Subscribe`: submit the newsletter form.
- `Contact`: submit the contact form.
- `AffiliateClick` and `ViewDeal`: click a product `View Deal` button.
- `CouponCopy`: click the coupon button on a product with a coupon.
- `HeroSlideView` and `HeroSlideClick`: view and click homepage slider products.

## Deduplication

Important browser events generate an `event_id` and send the same ID to `/api/analytics/meta-event` when Conversions API is enabled. Meta uses this to deduplicate browser Pixel and server CAPI events.

## Consent verification

Reject non-essential cookies from the banner, then repeat the checks above. Marketing events should not fire. Use the footer `Cookie Preferences` control to update consent later.

## Outbound redirects

Deal buttons point to `/go/[product-slug]`. The route validates the product, checks the affiliate URL domain against the retailer allowlist, optionally stores the click in Supabase, and redirects to the retailer.
