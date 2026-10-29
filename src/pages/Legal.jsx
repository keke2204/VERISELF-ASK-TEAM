import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { generateLegalNotice, getFindings, getLegalResponses } from "../services/api";
import { Scale, FileText, CheckCircle2, RefreshCw } from "lucide-react";

export default function Legal() {
  const identityId = Number(localStorage.getItem("veriself_identity_id"));
  const [responses, setResponses] = useState([]);
  const [findings, setFindings] = useState([]);
  const [message, setMessage] = useState("");
  const [generatingId, setGeneratingId] = useState(null);

  async function load() {
    if (!identityId) return;
    try {
      const [legal, risk] = await Promise.all([
        getLegalResponses(identityId),
        getFindings(identityId),
      ]);
      setResponses(legal || []);
      setFindings(risk || []);
    } catch (e) {
      setMessage(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [identityId]);

  async function generate(id) {
    try {
      setGeneratingId(id);
      await generateLegalNotice(id);
      setMessage("Legal response notice generated and added to repository.");
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setGeneratingId(null);
    }
  }

  if (!identityId) {
    return (
      <main className="page-shell p-12 text-center text-slate-400">
        <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Enroll Identity First</h2>
        <p className="text-xs text-slate-500 mt-1">Please register an identity to prepare legal response notices.</p>
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
        <p className="page-kicker">Statutory Remediation</p>
        <h1 className="page-title">Legal Takedown & Response Drafts</h1>
        <p className="page-description">
          Synthesize structured DMCA, Right-of-Publicity, and non-consensual deepfake takedown demands backed by cryptographic hash evidence.
        </p>
      </section>

      {message && (
        <motion.div
          className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-center gap-2"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle2 size={15} />
          <span>{message}</span>
        </motion.div>
      )}

      {/* Available findings for response */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Eligible Threat Findings ({findings.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {findings.map((f, idx) => (
            <motion.div
              key={f.finding_id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg flex flex-col justify-between gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div>
                <p className="text-sm font-bold text-white">{f.title}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Finding #{f.finding_id} · Score {f.risk_score}
                </p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{f.description}</p>
              </div>

              <motion.button
                onClick={() => generate(f.finding_id)}
                disabled={generatingId === f.finding_id}
                className="self-start rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-4 py-2 text-xs font-bold font-mono flex items-center gap-2 transition disabled:opacity-50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {generatingId === f.finding_id ? (
                  <>
                    <RefreshCw size={13} className="animate-spin text-emerald-300" />
                    Drafting Notice…
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    Generate Takedown Notice
                  </>
                )}
              </motion.button>
            </motion.div>
          ))}

          {!findings.length && (
            <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-500 md:col-span-2">
              <p className="text-sm font-semibold text-slate-300">No infringing findings available</p>
              <p className="text-xs text-slate-500 mt-1">Discovered unauthorized findings will appear here for one-click notice drafting.</p>
            </div>
          )}
        </div>
      </section>

      {/* Generated Responses */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Generated Takedown Notices ({responses.length})
        </h3>

        {responses.map((r, i) => (
          <motion.div
            key={r.id ?? i}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-xs font-bold text-emerald-400 font-mono">
              Statutory Notice #{r.id || i + 1}
            </div>
            <pre className="max-h-80 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300">
              {JSON.stringify(r, null, 2)}
            </pre>
          </motion.div>
        ))}

        {!responses.length && (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-500">
            <p className="text-sm font-semibold text-slate-300">No notice drafts generated yet</p>
            <p className="text-xs text-slate-500 mt-1">Generate a draft from any finding above.</p>
          </div>
        )}
      </section>
    </motion.main>
  );
}
