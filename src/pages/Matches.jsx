import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMatchHistory, verifyMatch } from "../services/api";
import RiskBadge from "../components/RiskBadge";
import { Search, RefreshCw, Link2 } from "lucide-react";

export default function Matches() {
  const identityId = Number(localStorage.getItem("veriself_identity_id"));
  const [candidateUrl, setCandidateUrl] = useState("");
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!identityId) return;
    try {
      setHistory(await getMatchHistory(identityId));
    } catch (e) {
      setResult({ error: e.message });
    }
  }

  useEffect(() => {
    load();
  }, [identityId]);

  async function submit(e) {
    e.preventDefault();
    if (!identityId) return setResult({ error: "Enroll a digital identity first." });
    if (!candidateUrl.trim()) return;
    try {
      setBusy(true);
      setResult(null);
      const res = await verifyMatch(identityId, candidateUrl.trim(), false);
      setResult(res);
      setCandidateUrl("");
      await load();
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.main
      className="page-shell"
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Heading */}
      <section className="page-heading">
        <p className="page-kicker">Similarity Engine</p>
        <h1 className="page-title">Perceptual Match Verification</h1>
        <p className="page-description">
          Cross-examine public candidate image URLs using perceptual hash (pHash),
          FaceNet embedding cosine similarity, and multi-factor manipulation weighting.
        </p>
      </section>

      {/* Verification Form */}
      <motion.form
        onSubmit={submit}
        className="card"
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
        whileHover={{ borderColor: "var(--accent)" }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Link2
            style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", width: 16, height: 16,
              color: "var(--subtle)", pointerEvents: "none",
            }}
          />
          <input
            value={candidateUrl}
            onChange={(e) => setCandidateUrl(e.target.value)}
            placeholder="https://suspected-clone.example/media/sample.jpg"
            className="field-input"
            style={{ paddingLeft: 40 }}
          />
        </div>
        <motion.button
          type="submit"
          disabled={busy}
          className="button-primary"
          style={{
            borderRadius: 10, fontSize: 13, padding: "0 20px",
            minHeight: 44, display: "flex", alignItems: "center",
            gap: 8, whiteSpace: "nowrap", opacity: busy ? 0.5 : 1,
          }}
          whileHover={!busy ? { scale: 1.02 } : {}}
          whileTap={!busy ? { scale: 0.98 } : {}}
        >
          {busy ? (
            <>
              <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
              Verifying…
            </>
          ) : (
            <>
              <Search size={15} />
              Cross-Verify Match
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="card"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid var(--line)", paddingBottom: 12,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink)", fontFamily: "monospace" }}>
                VERIFICATION DIAGNOSIS
              </span>
              {result.risk_level && <RiskBadge level={result.risk_level} />}
            </div>

            {result.error ? (
              <div style={{
                padding: "12px 16px", borderRadius: 10,
                border: "1px solid rgba(239,68,68,0.3)",
                background: "rgba(239,68,68,0.08)",
                color: "#f87171", fontSize: 13, fontFamily: "monospace",
              }}>
                {result.error}
              </div>
            ) : (
              <pre style={{
                maxHeight: 280, overflow: "auto", borderRadius: 10,
                border: "1px solid var(--line)", background: "var(--surface-2)",
                padding: 16, fontSize: 12, fontFamily: "monospace",
                color: "var(--ink-soft)", margin: 0,
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match History */}
      <section>
        <p className="section-label">
          Verified Match History ({history.length})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {history.map((i, idx) => (
            <motion.div
              key={i.id}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <p style={{ wordBreak: "break-all", fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 8, margin: 0, flex: 1, minWidth: 0 }}>
                  <Link2 size={14} style={{ color: "#06b6d4", flexShrink: 0 }} />
                  <span>{i.candidate_url}</span>
                </p>
                <RiskBadge level={i.risk_level} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--muted)", fontFamily: "monospace", borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                <span>Classification: <strong style={{ color: "var(--ink-soft)" }}>{i.classification}</strong></span>
                <span style={{ color: "var(--line-strong)" }}>·</span>
                <span>Combined Score: <strong style={{ color: "var(--accent)" }}>{i.combined_score}</strong></span>
              </div>
            </motion.div>
          ))}

          {!history.length && (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <Search style={{ width: 32, height: 32, color: "var(--subtle)", margin: "0 auto 12px" }} />
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", margin: "0 0 6px" }}>No cross-verification runs logged</p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                Submit a suspicious candidate image URL above to generate telemetry.
              </p>
            </div>
          )}
        </div>
      </section>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.main>
  );
}
