/**
 * CookieBanner — shows on first visit, saves consent to localStorage.
 * Only essential cookies are used. No tracking cookies are set regardless
 * of whether the user accepts or declines.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const CONSENT_KEY = "cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Show after a short delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            left: "1rem",
            right: "1rem",
            zIndex: 9999,
            width: "min(560px, calc(100vw - 2rem))",
            marginInline: "auto",
            background: "var(--surface, #fffaf4)",
            color: "var(--ink, #2b211c)",
            border: "1px solid var(--line, rgba(75,48,38,0.16))",
            borderRadius: "4px",
            padding: "1.25rem 1.5rem",
            boxShadow: "0 16px 40px rgba(68,39,24,0.2), 0 0 28px var(--accent-glow, rgba(198,123,65,0.16))",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ marginBottom: "0.75rem" }}>
            <strong style={{ fontSize: "1rem", color: "var(--ink, #2b211c)" }}>🍪 Cookie Notice</strong>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--muted, #765f52)", marginBottom: "1rem", lineHeight: 1.5 }}>
            We use only <strong>essential cookies</strong> to keep the app running.
            No tracking, no ads, no third-party profiling. Read our{" "}
            <Link to="/cookie-policy" style={{ color: "var(--accent, #a8663c)" }}>
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" style={{ color: "var(--accent, #a8663c)" }}>
              Privacy Policy
            </Link>
            .
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={accept}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "0.55rem 1rem",
                borderRadius: "3px",
                background: "var(--accent, #a8663c)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              Accept Essential
            </button>
            <button
              onClick={decline}
              style={{
                flex: 1,
                minWidth: 120,
                padding: "0.55rem 1rem",
                borderRadius: "3px",
                background: "transparent",
                color: "var(--muted, #765f52)",
                border: "1px solid var(--line-strong, rgba(75,48,38,0.28))",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Decline
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
