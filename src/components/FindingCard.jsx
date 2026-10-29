import { motion } from "framer-motion";
import RiskBadge from "./RiskBadge";

export default function FindingCard({ finding }) {
  return (
    <motion.div
      className="finding-row group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="finding-copy">
        <div className="finding-title group-hover:text-emerald-300 transition-colors">
          {finding.title}
        </div>
        <div className="finding-meta">
          <span>{finding.finding_type}</span>
          <span className="mx-1.5 opacity-40">·</span>
          <span>Score: {finding.risk_score}</span>
        </div>
      </div>
      <RiskBadge level={finding.risk_level} />
      <div className="finding-description">{finding.description}</div>
    </motion.div>
  );
}
