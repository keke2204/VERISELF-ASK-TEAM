import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function TermsAndConditions() {
  return (
    <motion.div className="page-container" {...fadeIn}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Terms &amp; Conditions
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Last updated: October 11, 2026
        </p>

        <section style={{ marginBottom: "2rem" }}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using VeriSelf, you agree to be bound by these Terms and
            Conditions. If you do not agree, please do not use the service.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>2. Description of Service</h2>
          <p>
            VeriSelf provides AI-powered deepfake detection, digital identity monitoring,
            evidence collection, and legal response assistance. The service is provided
            for personal identity protection purposes only.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>3. Acceptable Use</h2>
          <p>You agree <strong>not</strong> to:</p>
          <ul>
            <li>Use the platform to analyse images/videos of individuals without their consent.</li>
            <li>Attempt to hack, reverse-engineer, or disrupt the service.</li>
            <li>Upload illegal, defamatory, or infringing content.</li>
            <li>Use automated bots or scrapers against our API.</li>
            <li>Misrepresent yourself or submit false legal claims.</li>
            <li>Upload content that violates another person's copyright or privacy rights.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>4. Intellectual Property</h2>
          <p>
            All content, AI models, interfaces, and branding of VeriSelf are owned by
            VeriSelf and protected under applicable copyright and IP laws. You retain
            ownership of content you upload; by uploading, you grant us a limited,
            non-exclusive licence to process it for the purpose of providing the service.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>5. Image Copyright</h2>
          <p>
            You confirm that you have the right to upload any images or media you submit.
            Uploading images of third parties without their consent for non-protective
            purposes is strictly prohibited and may result in account termination.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>6. Legal Response Tools</h2>
          <p>
            The legal response templates provided by VeriSelf are for informational
            purposes only. They do not constitute legal advice. We strongly recommend
            consulting a qualified lawyer before sending formal legal notices.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>7. Disclaimer of Warranties</h2>
          <p>
            VeriSelf is provided "as is" without warranties of any kind. We do not
            guarantee 100% accuracy of deepfake detection. False positives and negatives
            may occur. Always verify results with a human expert for critical decisions.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, VeriSelf shall not be liable for
            any indirect, incidental, or consequential damages arising from use or
            inability to use the service.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these
            terms, without notice. You may delete your account at any time.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2>10. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be subject
            to the exclusive jurisdiction of courts in India.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:legal@veriself.app" style={{ color: "var(--accent)" }}>
              legal@veriself.app
            </a>
            .
          </p>
        </section>
      </div>
    </motion.div>
  );
}
