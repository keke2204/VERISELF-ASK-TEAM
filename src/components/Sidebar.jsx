import { NavLink, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Fingerprint,
  Radar,
  Search,
  ShieldAlert,
  Bell,
  FileSearch,
  Scale,
  ShieldCheck,
  ScanFace,
  Activity,
  Globe,
} from "lucide-react";

const navigation = [
  { label: "Command Center", path: "/dashboard", icon: LayoutDashboard },
  { label: "Identity Profile", path: "/identity", icon: Fingerprint },
  { label: "Public Scans", path: "/monitoring", icon: Radar },
  { label: "Candidate Matches", path: "/matches", icon: Search },
  { label: "Media Forensics", path: "/manipulation", icon: ScanFace },
  { label: "Risk Engine", path: "/risk", icon: ShieldAlert },
  { label: "Threat Alerts", path: "/alerts", icon: Bell },
  { label: "Evidence Records", path: "/evidence", icon: FileSearch },
  { label: "Legal Drafts", path: "/legal", icon: Scale },
  { label: "Image Signature", path: "/protection", icon: ShieldCheck },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <motion.div
        className="brand"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <motion.div
            className="brand-mark"
            whileHover={{ rotate: 12, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ShieldCheck size={20} strokeWidth={2.2} />
          </motion.div>
          <div>
            <div className="brand-name">
              veriself<span>.</span>
            </div>
            <div className="brand-caption">Identity Defense</div>
          </div>
        </Link>
      </motion.div>

      {/* Nav Label */}
      <div className="nav-label">Command Center</div>

      {/* Navigation Links */}
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navigation.map(({ label, path, icon: Icon }) => {
          const isActive =
            location.pathname === path ||
            (path === "/dashboard" && location.pathname === "/dashboard");

          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive: navActive }) =>
                `nav-item${navActive || isActive ? " active" : ""}`
              }
            >
              <motion.div
                className="flex items-center gap-3 w-full"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </motion.div>

              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="nav-active-indicator"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}

        <div style={{ margin: "8px 0", borderTop: "1px solid var(--vs-line)" }} />

        <Link
          to="/"
          className="nav-item"
          style={{ color: "var(--vs-muted)" }}
        >
          <div className="flex items-center gap-3 w-full">
            <Globe size={16} />
            <span>Landing Page</span>
          </div>
        </Link>
      </nav>

      {/* Workspace status widget */}
      <motion.div
        className="sidebar-radar-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="radar-header">
          <span className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--vs-ink)" }}>
            <Activity size={13} style={{ color: "var(--accent)" }} />
            Review workspace
          </span>
          <div className="radar-dot" />
        </div>
        <div style={{ fontSize: "11px", color: "var(--vs-muted)", lineHeight: 1.5 }}>
          On-demand checks for identity, media, and evidence.
        </div>
      </motion.div>

      {/* Footer */}
      <div className="sidebar-footer">
        <span style={{ fontWeight: 600 }}>v0.1.0-PRO</span>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Online
        </span>
      </div>
    </aside>
  );
}
