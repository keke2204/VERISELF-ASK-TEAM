import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createMonitoringTarget,
  getMonitoringResults,
  getMonitoringTargets,
  scanMonitoringTarget,
} from "../services/api";
import { Radar, Plus, Globe, RefreshCw, CheckCircle2 } from "lucide-react";

export default function Monitoring() {
  const userId = 1;
  const [url, setUrl] = useState("");
  const [targets, setTargets] = useState([]);
  const [results, setResults] = useState({});
  const [message, setMessage] = useState("");
  const [scanningId, setScanningId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setTargets(await getMonitoringTargets(userId));
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addTarget(e) {
    e.preventDefault();
    if (!url.trim()) return;
    try {
      await createMonitoringTarget(userId, url.trim());
      setUrl("");
      setMessage("Target domain registered for automated scraping.");
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  }

  async function scan(id) {
    try {
      setScanningId(id);
      const s = await scanMonitoringTarget(id);
      const r = await getMonitoringResults(id);
      setResults((c) => ({ ...c, [id]: r }));
      setMessage(s.reason || `Scan completed: ${s.candidates_found} candidates discovered.`);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setScanningId(null);
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
        <p className="page-kicker">Autonomous Surveillance</p>
        <h1 className="page-title">Public Web Watchdog</h1>
        <p className="page-description">
          Add public web endpoints, social profiles, or domain roots to continuously crawl,
          extract candidate media assets, and verify identity match signatures.
        </p>
      </section>

      {/* Target input form */}
      <motion.form
        onSubmit={addTarget}
        className="card"
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
        whileHover={{ borderColor: "var(--accent)" }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Globe
              style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", width: 16, height: 16,
                color: "var(--subtle)", pointerEvents: "none",
              }}
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://public-image-gallery.example/feed"
              className="field-input"
              style={{ paddingLeft: 40 }}
            />
          </div>
          <motion.button
            type="submit"
            className="button-primary"
            style={{ borderRadius: 10, fontSize: 13, padding: "0 20px", minHeight: 44, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} />
            Register Target
          </motion.button>
        </div>
      </motion.form>

      {/* Status banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid rgba(16,185,129,0.3)",
              background: "rgba(16,185,129,0.08)",
              color: "var(--accent)",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle2 size={15} />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Targets List */}
      <section>
        <p className="section-label">
          Monitored Web Endpoints ({targets.length})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {targets.map((t, idx) => (
            <motion.div
              key={t.id}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", wordBreak: "break-all", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                    <Globe size={15} style={{ color: "#06b6d4", flexShrink: 0 }} />
                    <span>{t.target_url}</span>
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace", margin: 0 }}>
                    Endpoint #{t.id} · Status: <span style={{ color: "var(--accent)", textTransform: "uppercase" }}>{t.status}</span>
                  </p>
                </div>

                <motion.button
                  onClick={() => scan(t.id)}
                  disabled={scanningId === t.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", borderRadius: 8,
                    border: "1px solid rgba(6,182,212,0.35)",
                    background: "rgba(6,182,212,0.08)",
                    color: "#06b6d4",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    opacity: scanningId === t.id ? 0.6 : 1,
                    whiteSpace: "nowrap",
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {scanningId === t.id ? (
                    <>
                      <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
                      Crawling…
                    </>
                  ) : (
                    <>
                      <Radar size={14} />
                      Probe &amp; Scan
                    </>
                  )}
                </motion.button>
              </div>

              {/* Scan results */}
              {results[t.id] && results[t.id].length > 0 && (
                <motion.div
                  style={{ borderTop: "1px solid var(--line)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="section-label" style={{ margin: 0 }}>
                    Discovered Candidate Assets ({results[t.id].length})
                  </p>
                  {results[t.id].map((item) => (
                    <div
                      key={item.id}
                      className="card-inner"
                      style={{ display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      <p style={{ wordBreak: "break-all", color: "var(--ink-soft)", fontSize: 12, margin: 0, fontFamily: "monospace" }}>{item.candidate_url}</p>
                      <p style={{ color: "var(--muted)", fontSize: 11, margin: 0 }}>Source: {item.page_url}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}

          {!targets.length && !loading && (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <Radar style={{ width: 32, height: 32, color: "var(--subtle)", margin: "0 auto 12px" }} />
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", margin: "0 0 6px" }}>No endpoints under surveillance</p>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
                Add a URL above to initialize continuous scraping.
              </p>
            </div>
          )}
        </div>
      </section>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.main>
  );
}
