import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  downloadProtectedMedia,
  getProtectionHistory,
  protectMedia,
  verifyProtectedMedia,
} from "../services/api";
import { ShieldCheck, UploadCloud, Download, Shield, RefreshCw } from "lucide-react";

export default function Protection() {
  const identityId = Number(localStorage.getItem("veriself_identity_id"));
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!identityId) return;
    try {
      setHistory(await getProtectionHistory(identityId));
    } catch (e) {
      setResult({ error: e.message });
    }
  }

  useEffect(() => {
    load();
  }, [identityId]);

  async function send(fn, e) {
    e.preventDefault();
    if (!identityId || !file) {
      return setResult({ error: "Enroll an identity and choose an image file first." });
    }

    const f = new FormData();
    f.append("identity_id", identityId);
    f.append("file", file);

    try {
      setBusy(true);
      setResult(null);
      const res = await fn(f);
      setResult(res);
      await load();
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function download(id) {
    try {
      const blob = await downloadProtectedMedia(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `veriself-shielded-${id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setResult({ error: e.message });
    }
  }

  if (!identityId) {
    return (
      <main className="page-shell p-12 text-center text-slate-400">
        <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Enroll Identity First</h2>
        <p className="text-xs text-slate-500 mt-1">Please register an identity to apply adversarial shielding.</p>
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
        <p className="page-kicker">Adversarial Immunization</p>
        <h1 className="page-title">Proactive Media Shielding</h1>
        <p className="page-description">
          Inject imperceptible mathematical perturbations (gradient masks) into your photos to disrupt facial landmark detection and prevent generative deepfake model training.
        </p>
      </section>

      {/* Upload & Shield Card */}
      <motion.section
        className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl space-y-5"
        whileHover={{ borderColor: "rgba(16, 185, 129, 0.25)" }}
      >
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 rounded-xl p-7 text-center cursor-pointer transition bg-slate-950/40">
          <UploadCloud className="w-8 h-8 text-emerald-400 mb-2" />
          <span className="text-xs font-semibold text-slate-200">
            {file ? file.name : "Select portrait to immunize against AI scraping"}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 font-mono">
            Supported: JPG, PNG, WEBP · Human-imperceptible noise applied
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <motion.button
            onClick={(e) => send(protectMedia, e)}
            disabled={busy || !file}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs py-3.5 px-5 shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-40 flex items-center justify-center gap-2"
            whileHover={!busy && file ? { scale: 1.02 } : {}}
            whileTap={!busy && file ? { scale: 0.98 } : {}}
          >
            {busy ? (
              <>
                <RefreshCw size={14} className="animate-spin text-slate-950" />
                Injecting Perturbations…
              </>
            ) : (
              <>
                <Shield size={15} />
                Immunize & Protect Media
              </>
            )}
          </motion.button>

          <motion.button
            onClick={(e) => send(verifyProtectedMedia, e)}
            disabled={busy || !file}
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs py-3.5 px-5 disabled:opacity-40 flex items-center gap-2"
            whileHover={!busy && file ? { scale: 1.02 } : {}}
            whileTap={!busy && file ? { scale: 0.98 } : {}}
          >
            <ShieldCheck size={15} />
            Verify Shield Robustness
          </motion.button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-xs font-bold text-emerald-400 font-mono">
                TELEMETRY REPORT
              </div>
              <pre className="max-h-60 overflow-auto text-xs font-mono text-slate-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* History */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Immunized Asset Archive ({history.length})
        </h3>

        {history.map((i, idx) => (
          <motion.div
            key={i.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div>
              <div className="font-bold text-white text-sm">Protected Asset Record #{i.id}</div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Method: {i.protection_method || "Adversarial Perturbation"} · Hash: {i.content_hash?.slice(0, 16)}…
              </p>
            </div>

            <motion.button
              onClick={() => download(i.id)}
              className="rounded-xl border border-slate-700 hover:border-emerald-500/50 bg-slate-800/80 hover:bg-slate-800 text-slate-200 px-4 py-2 text-xs font-bold font-mono flex items-center gap-2 transition"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Download size={14} className="text-emerald-400" />
              Download Shielded File
            </motion.button>
          </motion.div>
        ))}

        {!history.length && (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-500">
            <Shield className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No media shielded yet</p>
            <p className="text-xs text-slate-500 mt-1">Upload a portrait above to generate an immunized copy.</p>
          </div>
        )}
      </section>
    </motion.main>
  );
}
