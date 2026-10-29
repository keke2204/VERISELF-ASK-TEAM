import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Scan,
  RefreshCw,
} from "lucide-react";
import { registerIdentity, verifyIdentity } from "../services/api";

const DEV_USER_ID = 1;

export default function Identity() {
  const [displayName, setDisplayName] = useState("My Identity");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const currentIdentityId = localStorage.getItem("veriself_identity_id");

  async function handleRegister(event) {
    event.preventDefault();

    if (!file) {
      setResult({ error: "Choose a reference image first." });
      return;
    }

    if (!displayName.trim()) {
      setResult({ error: "Enter an identity name." });
      return;
    }

    const formData = new FormData();
    formData.append("user_id", String(DEV_USER_ID));
    formData.append("display_name", displayName.trim());
    formData.append("file", file);

    try {
      setBusy(true);
      setResult(null);

      const data = await registerIdentity(formData);

      if (data.registration_id) {
        localStorage.setItem(
          "veriself_identity_id",
          String(data.registration_id)
        );
      }

      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();

    const storedIdentityId = localStorage.getItem("veriself_identity_id");
    const identityId = Number(storedIdentityId);

    if (!identityId) {
      setResult({ error: "Register an identity first before verification." });
      return;
    }

    if (!file) {
      setResult({ error: "Choose an image file to compare against reference." });
      return;
    }

    const formData = new FormData();
    formData.append("identity_id", String(identityId));
    formData.append("file", file);

    try {
      setBusy(true);
      setResult(null);

      const data = await verifyIdentity(formData);
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.main
      className="page-shell identity-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <section className="page-heading identity-heading">
        <p className="page-kicker">Identity profile</p>
        <h1 className="page-title">Create your reference profile</h1>
        <p className="page-description">
          Save a private reference portrait, then compare another image when you need a closer look. Results are signals for your review, not a final verdict.
        </p>
      </section>

      {currentIdentityId && (
        <motion.div
          className="matte-status-strip"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white font-mono">
                ACTIVE IDENTITY PROFILE #{currentIdentityId}
              </div>
              <div className="text-[11px] text-emerald-300/80">
                Enrolled and actively protected against unauthorized web reproduction.
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded">
            ACTIVE
          </span>
        </motion.div>
      )}

      <div className="identity-enrollment-grid">
        <motion.section
          className="lg:col-span-6 matte-panel identity-form-panel"
          whileHover={{ borderColor: "rgba(16, 185, 129, 0.25)" }}
          transition={{ duration: 0.2 }}
        >
          <form className="identity-form" onSubmit={handleRegister}>
            <div>
              <label className="identity-field-label">
                Identity Profile Label
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Primary Facial Signature"
                className="identity-name-input"
              />
            </div>

            <div>
              <label className="identity-field-label">
                Biometric Reference Portrait
              </label>
              <label className="identity-upload">
                <UploadCloud className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  {file ? file.name : "Click to select clear front-facing portrait"}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  Supported formats: JPG, PNG, WEBP (Min 160x160 px)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="identity-actions">
              <motion.button
                type="submit"
                disabled={busy}
                className="matte-primary-button flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={!busy ? { scale: 1.02 } : {}}
                whileTap={!busy ? { scale: 0.98 } : {}}
              >
                {busy ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-slate-950" />
                    Extracting Embeddings…
                  </>
                ) : (
                  <>
                    <Fingerprint size={15} />
                    Enroll Digital Identity
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleVerify}
                disabled={busy}
                className="matte-secondary-button disabled:opacity-40"
                whileHover={!busy ? { scale: 1.02 } : {}}
                whileTap={!busy ? { scale: 0.98 } : {}}
              >
                <Scan size={15} />
                Verify Against Baseline
              </motion.button>
            </div>
          </form>
        </motion.section>

        {/* Diagnostics & Verification Feedback */}
        <section className="lg:col-span-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                className="matte-panel identity-feedback-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
                    {result.error ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {result.error ? "ENROLLMENT FAILED" : "TELEMETRY RESPONSE"}
                  </div>
                  {result.registration_id && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      ID #{result.registration_id}
                    </span>
                  )}
                </div>

                {result.error ? (
                  <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono">
                    {result.error}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
                        <span className="text-[10px] text-slate-500 uppercase font-mono">Status</span>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5">
                          {result.status || "SUCCESS"}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
                        <span className="text-[10px] text-slate-500 uppercase font-mono">Similarity / Confidence</span>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">
                          {result.similarity_score !== undefined
                            ? `${(result.similarity_score * 100).toFixed(1)}%`
                            : "100% (Baseline)"}
                        </div>
                      </div>
                    </div>

                    <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-[11px] text-slate-300 font-mono border border-slate-800">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="matte-empty-panel identity-empty-panel p-12 flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Fingerprint size={42} className="text-slate-700 mb-3" />
                <div className="text-sm font-semibold text-slate-300">Biometric Baseline Awaiting Image</div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Provide an authorized portrait to calculate facial geometric landmarks and generate cryptographic hash tokens.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </motion.main>
  );
}
