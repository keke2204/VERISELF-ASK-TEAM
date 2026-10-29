import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Home as HomeIcon, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#1f2937",
        color: "#ffffff",
        fontFamily: "'Times New Roman', Times, Georgia, serif",
        padding: "2rem 1rem",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "760px",
          width: "100%",
        }}
      >
        {/* Customized 404 Graphic Provided by User */}
        <div
          style={{
            width: "100%",
            maxWidth: "640px",
            marginBottom: "1.5rem",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            background: "#1e293b",
          }}
        >
          <img
            src="/404-ghost.png"
            alt="Error: 404 page not found - Ghost illustration"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        {/* Action navigation buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{
            display: "flex",
            gap: "1.2rem",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.75rem",
              borderRadius: "4px",
              background: "#3b82f6",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.02em",
              fontFamily: "'Times New Roman', Times, Georgia, serif",
              boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <HomeIcon size={18} /> Return to Home
          </Link>

          <Link
            to="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.75rem",
              borderRadius: "4px",
              background: "#111827",
              color: "#e5e7eb",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.02em",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontFamily: "'Times New Roman', Times, Georgia, serif",
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <LayoutDashboard size={18} /> Open Dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1.75rem",
              borderRadius: "4px",
              background: "transparent",
              color: "#9ca3af",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "1rem",
              letterSpacing: "0.02em",
              fontFamily: "'Times New Roman', Times, Georgia, serif",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
            }}
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
