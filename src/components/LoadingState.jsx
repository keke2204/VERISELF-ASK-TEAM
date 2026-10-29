import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function LoadingState({ label = "Analyzing forensic telemetry…" }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[260px]">
      <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
        {/* Rotating outer cyber ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />

        {/* Pulsing inner radar ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-cyan-500/50"
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />

        {/* Center glowing icon */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Shield className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </motion.div>
      </div>

      <motion.p
        className="text-sm font-semibold text-slate-200 tracking-wide font-mono"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      >
        {label}
      </motion.p>
      <p className="text-xs text-slate-500 mt-1 font-mono">Neural network inference in progress</p>
    </div>
  );
}
