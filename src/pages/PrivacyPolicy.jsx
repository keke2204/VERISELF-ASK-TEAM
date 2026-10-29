import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function PrivacyPolicy() {
  return (
    <motion.div className="page-container" {...fadeIn}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Privacy Policy
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Last updated: October 11, 2026
        </p>

        <section style={{ marginBottom: "2rem" }}>
          <h2>1. Who We Are</h2>
          <p>
            VeriSelf ("we", "our", "us") provides an AI-powered digital identity defence
            platform. This Privacy Policy explains how we collect, use, and protect your
            personal data when you use our service.
          </p>
          <p>
            This policy is compliant with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> (India),
            and aligned with GDPR principles.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>2. Data We Collect</h2>
          <ul>
            <li><strong>Identity data:</strong> Name, email address, profile information you provide.</li>
            <li><strong>Images / media:</strong> Photos or videos you upload for deepfake analysis (stored encrypted).</li>
            <li><strong>Usage data:</strong> Pages visited, features used, timestamps — for improving the service.</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information.</li>
          </ul>
          <p>
            We only collect data that is <strong>necessary</strong> for the service to function.
            We do not sell your data to third parties.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To provide deepfake detection and identity monitoring services.</li>
            <li>To generate legal response documents on your behalf.</li>
            <li>To send security alerts when threats are detected.</li>
            <li>To improve our AI models (only with your explicit consent).</li>
          </ul>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>4. Data Storage &amp; Security</h2>
          <p>
            Your data is stored securely with encryption at rest and in transit (TLS/HTTPS).
            We apply strict access controls and do not store images longer than necessary
            for the scan process, unless you explicitly save them.
          </p>
          <p>
            Watermark secrets and API keys are stored only in server-side environment
            variables — never in client-side code.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>5. Third-Party Services</h2>
          <p>We may use the following third-party services:</p>
          <ul>
            <li><strong>Google Fonts</strong> — for typography (no personal data sent).</li>
            <li><strong>Analytics</strong> — if enabled, only anonymised data is collected.</li>
          </ul>
          <p>
            We do not embed Facebook Pixel, advertising trackers, or data brokers.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>6. Your Rights (DPDP &amp; GDPR)</h2>
          <ul>
            <li><strong>Access:</strong> Request a copy of your data.</li>
            <li><strong>Correction:</strong> Fix inaccurate data.</li>
            <li><strong>Deletion:</strong> Request erasure of your data ("right to be forgotten").</li>
            <li><strong>Portability:</strong> Export your data in a machine-readable format.</li>
            <li><strong>Withdraw consent:</strong> At any time, without affecting prior processing.</li>
          </ul>
          <p>
            To exercise these rights, contact us at{" "}
            <a href="mailto:privacy@veriself.app" style={{ color: "var(--accent)" }}>
              privacy@veriself.app
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>7. Cookies</h2>
          <p>
            We use only essential cookies required for the application to function.
            We do not use advertising or tracking cookies. See our{" "}
            <a href="/cookie-policy" style={{ color: "var(--accent)" }}>
              Cookie Policy
            </a>{" "}
            for details.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>8. Children's Privacy</h2>
          <p>
            VeriSelf is not directed at children under 18. We do not knowingly collect
            personal data from minors. If you believe a child has provided us data,
            contact us immediately.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. We will notify you by email or
            in-app notification at least 14 days before significant changes take effect.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            <strong>VeriSelf</strong>
            <br />
            Email:{" "}
            <a href="mailto:privacy@veriself.app" style={{ color: "var(--accent)" }}>
              privacy@veriself.app
            </a>
          </p>
        </section>
      </div>
    </motion.div>
  );
}
