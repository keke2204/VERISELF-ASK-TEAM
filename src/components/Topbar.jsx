import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sun, Moon, Home as HomeIcon } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";

const pageTitles = {
  "/dashboard": {
    title: "Command Center Overview",
    subtitle: "A clear view of your identity review workspace",
  },
  "/identity": {
    title: "Digital Identity Enrollment",
    subtitle: "Save a reference portrait and compare when needed",
  },
  "/monitoring": {
    title: "Public Web Scans",
    subtitle: "Review public pages you choose to add",
  },
  "/matches": {
    title: "Candidate Match Engine",
    subtitle: "Compare a candidate image against your reference",
  },
  "/manipulation": {
    title: "Deepfake Forensics Laboratory",
    subtitle: "Inspect image and video signals with context",
  },
  "/risk": {
    title: "Identity Risk Assessment",
    subtitle: "Bring possible exposure signals into one view",
  },
  "/alerts": {
    title: "Security Threat Alerts",
    subtitle: "Keep important review notes close at hand",
  },
  "/evidence": {
    title: "Cryptographic Evidence Vault",
    subtitle: "Keep source details and evidence together",
  },
  "/legal": {
    title: "Legal Response Generator",
    subtitle: "Prepare a response draft for careful review",
  },
  "/protection": {
    title: "Image Signature & Provenance",
    subtitle: "Check and protect media provenance",
  },
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = pageTitles[location.pathname] || {
    title: "Identity Command Center",
    subtitle: "Protecting biometric presence across the open web",
  };

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("veriself-theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("veriself-theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const signOut = () => {
    localStorage.removeItem("veriself_access_token");
    localStorage.removeItem("veriself_identity_id");
    navigate("/login");
  };

  return (
    <motion.header
      className="topbar"
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <div className="topbar-title flex items-center gap-2">
          <span>{current.title}</span>
        </div>
        <div className="topbar-subtitle">{current.subtitle}</div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="button-secondary"
          style={{
            fontSize: "12px",
            minHeight: "34px",
            padding: "0 12px",
            gap: "6px",
            textDecoration: "none",
          }}
          title="Return to Landing Page"
        >
          <HomeIcon size={14} />
          <span>Landing Page</span>
        </Link>

        <button
          className="theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
          style={{ minHeight: "34px", marginLeft: 0 }}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>

        <button
          className="theme-toggle"
          type="button"
          onClick={signOut}
        >
          Sign out
        </button>

        <motion.div
          className="system-status"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <span className="status-dot" />
          <ShieldCheck size={14} strokeWidth={2.2} />
          <span>WORKSPACE READY</span>
        </motion.div>
      </div>
    </motion.header>
  );
}
