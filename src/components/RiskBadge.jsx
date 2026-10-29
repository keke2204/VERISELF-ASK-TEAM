import { motion } from "framer-motion";

const styles = {
  LOW: "risk-low",
  MEDIUM: "risk-medium",
  HIGH: "risk-high",
  CRITICAL: "risk-critical",
};

export default function RiskBadge({ level }) {
  const value = (level || "LOW").toUpperCase();
  const isElevated = value === "CRITICAL" || value === "HIGH";

  return (
    <motion.span
      className={`risk-badge ${styles[value] || styles.LOW}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      {isElevated && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      )}
      {value}
    </motion.span>
  );
}
