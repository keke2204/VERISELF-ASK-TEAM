import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFindings, getRiskSummary } from "../services/api";
import FindingCard from "../components/FindingCard";
import StatCard from "../components/StatCard";
import { ShieldAlert } from "lucide-react";

export default function Risk() {
  const identityId = Number(localStorage.getItem("veriself_identity_id"));
  const [summary, setSummary] = useState(null);
  const [findings, setFindings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!identityId) return;
    Promise.all([getRiskSummary(identityId), getFindings(identityId)])
      .then(([s, f]) => {
        setSummary(s);
        setFindings(f || []);
      })
      .catch((e) => setError(e.message));
  }, [identityId]);

  if (!identityId) {
    return (
      <main className="page-shell p-12 text-center text-slate-400">
        <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Enroll Identity First</h2>
        <p className="text-xs text-slate-500 mt-1">Please register a digital identity profile to access risk index scores.</p>
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
        <p className="page-kicker">Threat Modeling</p>
        <h1 className="page-title">Risk Engine & Findings</h1>
        <p className="page-description">
          Consolidated multimodal risk exposure, classified by synthetic likelihood, distribution breadth, and brand compromise potential.
        </p>
      </section>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <section className="metrics-grid">
        <StatCard title="Total Findings" value={summary?.total_findings ?? 0} hint="Discovered assets" delay={0} />
        <StatCard title="Critical Grade" value={summary?.critical ?? 0} hint="Active deepfake cloning" delay={0.05} />
        <StatCard title="High Grade" value={summary?.high ?? 0} hint="Severe visual distortion" delay={0.1} />
        <StatCard title="Medium Grade" value={summary?.medium ?? 0} hint="Unverified similarity" delay={0.15} />
        <StatCard title="Peak Threat" value={summary?.highest_risk_score ?? 0} hint="Maximum single score" delay={0.2} />
      </section>

      {/* Findings stream */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Identified Risk Vectors ({findings.length})
        </h3>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl space-y-2">
          {findings.map((f) => (
            <FindingCard key={f.finding_id} finding={f} />
          ))}

          {!findings.length && (
            <div className="p-12 text-center text-slate-500">
              <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Clean Biometric Register</p>
              <p className="text-xs text-slate-500 mt-1">
                No active threats or unauthorized facial clones recorded.
              </p>
            </div>
          )}
        </div>
      </section>
    </motion.main>
  );
}
