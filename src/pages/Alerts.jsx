import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAlerts, updateAlertStatus } from "../services/api";
import RiskBadge from "../components/RiskBadge";
import { Bell, Check, Eye, X } from "lucide-react";

export default function Alerts() {
  const identityId = Number(localStorage.getItem("veriself_identity_id"));
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    if (!identityId) return;
    try {
      setAlerts(await getAlerts(identityId));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [identityId]);

  async function changeStatus(id, status) {
    try {
      await updateAlertStatus(id, status);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  if (!identityId) {
    return (
      <main className="page-shell p-12 text-center text-slate-400">
        <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Enroll Identity First</h2>
        <p className="text-xs text-slate-500 mt-1">Please register your digital profile to view incident alerts.</p>
      </main>
    );
  }

  return (
    <motion.main
      className="page-shell space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <section className="page-heading">
        <p className="page-kicker">Security Operations</p>
        <h1 className="page-title">Threat Alerts & Incidents</h1>
        <p className="page-description">
          Prioritized alert feed triggered by threshold breaches in biometric similarity or deepfake manipulation scores.
        </p>
      </section>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Active Incident Log ({alerts.length})
        </h3>

        {alerts.map((a, idx) => (
          <motion.div
            key={a.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-white text-base">{a.title}</p>
                <p className="mt-1 text-xs text-slate-500 font-mono">
                  Alert #{a.id} · Status: <span className="text-emerald-400 uppercase font-semibold">{a.status}</span>
                </p>
              </div>
              <RiskBadge level={a.severity} />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{a.message}</p>

            <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              <motion.button
                onClick={() => changeStatus(a.id, "REVIEWED")}
                className="rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Eye size={13} />
                Mark Reviewed
              </motion.button>
              <motion.button
                onClick={() => changeStatus(a.id, "RESOLVED")}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 flex items-center gap-1.5 transition"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Check size={13} />
                Resolve Incident
              </motion.button>
              <motion.button
                onClick={() => changeStatus(a.id, "DISMISSED")}
                className="rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400 flex items-center gap-1.5 transition"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <X size={13} />
                Dismiss
              </motion.button>
            </div>
          </motion.div>
        ))}

        {!alerts.length && (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-500">
            <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No active incidents</p>
            <p className="text-xs text-slate-500 mt-1">All notification queues are clear.</p>
          </div>
        )}
      </section>
    </motion.main>
  );
}
