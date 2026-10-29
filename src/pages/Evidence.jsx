import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getEvidence } from "../services/api";
import { FileSearch, Hash, Globe, ChevronDown } from "lucide-react";

export default function Evidence() {
  const identityId = Number(localStorage.getItem("veriself_identity_id"));
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!identityId) return;
    getEvidence(identityId)
      .then(setRecords)
      .catch((e) => setError(e.message));
  }, [identityId]);

  if (!identityId) {
    return (
      <main className="page-shell p-12 text-center text-slate-400">
        <FileSearch className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Enroll Identity First</h2>
        <p className="text-xs text-slate-500 mt-1">Please register an identity to access cryptographic evidence vaults.</p>
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
        <p className="page-kicker">Forensic Custody</p>
        <h1 className="page-title">Cryptographic Evidence Vault</h1>
        <p className="page-description">
          Immutable forensic audit chain recording source URLs, timestamps, facial vectors, and SHA-256 payload checksums for statutory dispute resolution.
        </p>
      </section>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Evidence Chain of Custody ({records.length})
        </h3>

        {records.map((r, idx) => (
          <motion.details
            key={r.id}
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSearch className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="font-bold text-white text-sm">
                    Evidence Case #{r.id} · {r.source_domain || "Origin Domain"}
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Immutable Record · SHA-256 Sealed
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
            </summary>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Globe size={13} className="text-cyan-400 shrink-0" />
                <span className="text-slate-500">Source:</span>
                <span className="break-all text-slate-300">{r.source_url}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <Hash size={13} className="text-emerald-400 shrink-0" />
                <span className="text-slate-500">SHA-256 Hash:</span>
                <span className="break-all text-emerald-400/90">{r.content_hash}</span>
              </div>

              <div className="mt-3">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  Forensic Payload Data:
                </span>
                <pre className="mt-1.5 max-h-72 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] font-mono text-slate-300">
                  {JSON.stringify(r.evidence_data, null, 2)}
                </pre>
              </div>
            </div>
          </motion.details>
        ))}

        {!records.length && (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-500">
            <FileSearch className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Evidence vault is empty</p>
            <p className="text-xs text-slate-500 mt-1">Discovered matches will be cryptographically logged here.</p>
          </div>
        )}
      </section>
    </motion.main>
  );
}
