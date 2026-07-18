export default function CookiePolicyPage() {
  return (
    <section className="simple-page">
      <span className="eyebrow">Legal</span>
      <h1>Cookie Policy</h1>
      <p>
        Trusted Deals & Clearance may use cookies for analytics, preferences, affiliate attribution, and newsletter
        functionality.
      </p>

      <div className="cookie-policy-grid">
        <article>
          <h2>Essential Cookies</h2>
          <p>
            These cookies are required for the website to work correctly. They may remember basic preferences, protect
            admin sessions, and support core site functionality. Essential cookies cannot be disabled from the cookie
            banner.
          </p>
          <strong>Always active</strong>
        </article>

        <article>
          <h2>Analytics Cookies</h2>
          <p>
            Analytics cookies help us understand page views, popular content, and general visitor engagement so we can
            improve the website experience.
          </p>
          <strong>Optional</strong>
        </article>

        <article>
          <h2>Marketing Cookies</h2>
          <p>
            We use Meta Pixel on this website. Marketing cookies may include Meta Pixel and affiliate measurement tools.
            They help measure affiliate link performance and campaign activity when enabled.
          </p>
          <strong>Optional</strong>
        </article>
      </div>

      <h2>Meta Pixel</h2>
      <p>
        Meta Pixel is a marketing and measurement technology provided by Meta. On this website, Meta Pixel is used to
        measure visits, page activity, and marketing campaign performance when marketing cookies are enabled.
      </p>

      <h2>Your Choices</h2>
      <p>
        You can accept all cookies, reject non-essential cookies, or customize analytics and marketing preferences from
        the cookie banner. You can update your choice at any time using the Cookie Preferences link in the footer.
      </p>
    </section>
  );
}
