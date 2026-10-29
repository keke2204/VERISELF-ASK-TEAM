import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function CookiePolicy() {
  return (
    <motion.div className="page-container" {...fadeIn}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Cookie Policy
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Last updated: October 11, 2026
        </p>

        <section style={{ marginBottom: "2rem" }}>
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website.
            They help the site remember your preferences and session information.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>Cookies We Use</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Name</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Purpose</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Type</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.5rem 0" }}>cookie_consent</td>
                <td style={{ padding: "0.5rem" }}>Stores your cookie preference</td>
                <td style={{ padding: "0.5rem" }}>Essential</td>
                <td style={{ padding: "0.5rem" }}>1 year</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.5rem 0" }}>session</td>
                <td style={{ padding: "0.5rem" }}>Maintains your login session</td>
                <td style={{ padding: "0.5rem" }}>Essential</td>
                <td style={{ padding: "0.5rem" }}>Session</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>What We Do NOT Use</h2>
          <ul>
            <li>❌ Advertising or tracking cookies</li>
            <li>❌ Facebook Pixel or Google Ads cookies</li>
            <li>❌ Third-party analytics cookies that identify you personally</li>
            <li>❌ Cross-site tracking cookies</li>
          </ul>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>Managing Cookies</h2>
          <p>
            You can control cookies through your browser settings. Disabling essential
            cookies may affect your ability to use the service. You can also withdraw
            your consent at any time by clearing your browser cookies.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions? Email us at{" "}
            <a href="mailto:privacy@veriself.app" style={{ color: "var(--accent)" }}>
              privacy@veriself.app
            </a>
            .
          </p>
        </section>
      </div>
    </motion.div>
  );
}
