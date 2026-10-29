import { motion } from "framer-motion";

export default function StatCard({ title, value, hint, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      className="metric relative overflow-hidden group cursor-default"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between">
        <div className="metric-label">{title}</div>
        {Icon && <Icon size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />}
      </div>

      <motion.div
        className="metric-value"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, delay: delay + 0.1 }}
      >
        {value}
      </motion.div>

      {hint && <div className="metric-hint">{hint}</div>}

      {/* Subtle bottom neon border accent on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/50 transition-all duration-300" />
    </motion.div>
  );
}
