import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Fingerprint,
  Radar,
  ScanFace,
  Scale,
  Shield,
  ArrowRight,
} from "lucide-react";
import StatCard from "../components/StatCard";
import RiskBadge from "../components/RiskBadge";
import FindingCard from "../components/FindingCard";
import LoadingState from "../components/LoadingState";
import { getAlerts, getFindings, getRiskSummary } from "../services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Dashboard() {
  const identityId = Number(localStorage.getItem("veriself_identity_id"));
  const [summary, setSummary] = useState(null);
  const [findings, setFindings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(Boolean(identityId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!identityId) return;
    Promise.all([
      getRiskSummary(identityId),
      getFindings(identityId),
      getAlerts(identityId),
    ])
      .then(([s, f, a]) => {
        setSummary(s);
        setFindings(f || []);
        setAlerts(a || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [identityId]);

  if (!identityId) {
    return (
      <main className="page-shell flex items-center justify-center min-h-[calc(100vh-140px)]">
        <motion.div
          className="max-w-2xl w-full p-8 rounded-2xl border border-emerald-500/25 bg-slate-900/80 backdrop-blur-xl shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
                Private review workspace
              </span>
              <h1 className="text-2xl font-bold text-white">Set up your identity profile</h1>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Add a reference portrait to compare images, review public pages, and keep useful evidence together.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <Fingerprint className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-xs font-semibold text-white">Identity reference</div>
              <div className="text-[11px] text-slate-400 mt-1">A private comparison baseline</div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <ScanFace className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="text-xs font-semibold text-white">Media review</div>
              <div className="text-[11px] text-slate-400 mt-1">Signals worth a closer look</div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
              <Scale className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="text-xs font-semibold text-white">Evidence notes</div>
              <div className="text-[11px] text-slate-400 mt-1">Context for your next decision</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/identity"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create identity profile <ArrowRight size={16} />
            </Link>
            <Link
              to="/manipulation"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
            >
              Review a media file
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page-shell">
        <LoadingState label="Gathering your latest review notes…" />
      </main>
    );
  }

  return (
    <motion.main
      className="page-shell dashboard-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Identity Banner */}
      <motion.section className="identity-strip" variants={itemVariants}>
        <motion.div
          className="identity-mark"
          whileHover={{ rotate: 10, scale: 1.05 }}
        >
          <Shield size={20} />
        </motion.div>
        <div className="identity-copy">
          <div className="identity-name">Identity review profile</div>
          <div className="identity-meta font-mono">
            Identity ID #{identityId} <span>·</span> Reference profile saved
          </div>
        </div>
        <div className="identity-state">
          <motion.span
            className="status-dot"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          Ready to review
        </div>
      </motion.section>

      {/* Intro */}
      <motion.section className="dashboard-intro" variants={itemVariants}>
        <div>
          <div className="page-kicker">Command Center</div>
          <h1 className="page-title">Identity Defense at a Glance</h1>
          <p className="page-description">
            A clear view of identity checks, media review, and the evidence you choose to keep.
          </p>
        </div>
        <div className="intro-id font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/30 text-xs">
          ENROLLED ID #{identityId}
        </div>
      </motion.section>

      {error && (
        <motion.div
          className="p-4 mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm"
          variants={itemVariants}
        >
          {error}
        </motion.div>
      )}

      {/* Metrics Grid */}
      <motion.section
        className="metrics-grid"
        aria-label="Security summary"
        variants={itemVariants}
      >
        <StatCard
          title="Total Findings"
          value={summary?.total_findings ?? 0}
          hint="Across indexed domains"
          delay={0}
        />
        <StatCard
          title="Critical Alerts"
          value={summary?.critical ?? 0}
          hint="Immediate threat vector"
          delay={0.05}
        />
        <StatCard
          title="High Severity"
          value={summary?.high ?? 0}
          hint="Likely biometric match"
          delay={0.1}
        />
        <StatCard
          title="Medium Risk"
          value={summary?.medium ?? 0}
          hint="Under observation"
          delay={0.15}
        />
        <StatCard
          title="Risk Index"
          value={summary?.highest_risk_score ? `${summary.highest_risk_score}/100` : "0/100"}
          hint="Composite exposure"
          delay={0.2}
        />
      </motion.section>

      {/* Content Grid */}
      <motion.section className="content-grid" variants={itemVariants}>
        {/* Recent findings panel */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Threat Findings</h2>
              <p>Latest signals associated with your biometric reference.</p>
            </div>
            <span className="panel-count">{findings.length}</span>
          </div>
          <div className="panel-body finding-list">
            {findings.slice(0, 5).map((finding) => (
              <FindingCard key={finding.finding_id} finding={finding} />
            ))}
            {!findings.length && (
              <div className="empty-state">
                <ShieldCheck className="w-7 h-7 text-emerald-500 dark:text-emerald-400 mb-1" />
                <span className="text-slate-700 dark:text-slate-200 font-semibold">No biometric threats found</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Your identity signature is currently clear across all monitored channels.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Security alerts panel */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Security Alerts</h2>
              <p>Critical events requiring manual verification or triage.</p>
            </div>
            <span className="panel-count">{alerts.length}</span>
          </div>
          <div className="panel-body alert-list">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="security-alert">
                <div className="security-alert-top">
                  <div>
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-meta">Incident #{alert.id}</div>
                  </div>
                  <RiskBadge level={alert.severity} />
                </div>
                <p>{alert.message}</p>
              </div>
            ))}
            {!alerts.length && (
              <div className="empty-state">
                <ShieldCheck className="w-7 h-7 text-emerald-500 dark:text-emerald-400 mb-1" />
                <span className="text-slate-700 dark:text-slate-200 font-semibold">Zero unresolved alerts</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">All security queues are normal.</span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
        variants={itemVariants}
      >
        <Link
          to="/manipulation"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-emerald-500/40 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <ScanFace className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <span className="block text-sm font-semibold text-slate-800 dark:text-white">Forensic Scanner</span>
          <small className="text-xs text-slate-500 dark:text-slate-400">Detect deepfakes & AI manipulation</small>
        </Link>

        <Link
          to="/monitoring"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-cyan-500/40 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Radar className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <span className="block text-sm font-semibold text-slate-800 dark:text-white">Web Surveillance</span>
          <small className="text-xs text-slate-500 dark:text-slate-400">Scan public pages for identity use</small>
        </Link>

        <Link
          to="/protection"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <span className="block text-sm font-semibold text-slate-800 dark:text-white">Protect Media</span>
          <small className="text-xs text-slate-500 dark:text-slate-400">Inject anti-AI perturbations</small>
        </Link>

        <Link
          to="/legal"
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-amber-500/40 transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <span className="block text-sm font-semibold text-slate-800 dark:text-white">Legal Notices</span>
          <small className="text-xs text-slate-500 dark:text-slate-400">Prepare statutory takedowns</small>
        </Link>
      </motion.section>
    </motion.main>
  );
}
