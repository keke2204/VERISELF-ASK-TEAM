import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileImage,
  Video,
  AlertTriangle,
  Sliders,
  Info,
  RefreshCw,
  Scan,
} from "lucide-react";
import RiskBadge from "../components/RiskBadge";
import StatCard from "../components/StatCard";
import LoadingState from "../components/LoadingState";
import { analyzeImage, analyzeVideo } from "../services/api";

export default function Manipulation() {
  const [mode, setMode] = useState("image"); // "image" | "video"
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
    setResult(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setResult(null);
    setError("");
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(`Please select a ${mode === "image" ? "photo" : "video"} file to inspect.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const response =
        mode === "image"
          ? await analyzeImage(formData)
          : await analyzeVideo(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || "Failed to analyze media file.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setResult(null);
    setError("");
  };

  const formatSignalName = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <main className="page-shell space-y-6">
      {/* Header */}
      <section className="page-heading">
        <p className="page-kicker">Deepfake & Media Forensics</p>
        <h1 className="page-title">Forensic Manipulation Detection</h1>
        <p className="page-description">
          Detect synthetic media anomalies, frequency domain disruptions, compression artifacts, and temporal instability across suspicious imagery and video.
        </p>
      </section>

      {/* Mode Selector Tabs with Framer Motion layoutId */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "image", label: "Image Forensic Inspection", icon: FileImage },
          { id: "video", label: "Video Temporal Inspection", icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleModeSwitch(tab.id)}
              className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                isActive ? "text-emerald-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="manipulationModePill"
                  className="absolute inset-0 rounded-xl bg-emerald-500/15 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={15} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <motion.div
          className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload & Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <motion.form
            onSubmit={handleAnalyze}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 space-y-4 shadow-xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Payload Upload ({mode.toUpperCase()})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {mode === "image" ? "JPG / PNG / WEBP" : "MP4 / MOV / WEBM"}
              </span>
            </div>

            <motion.label
              htmlFor="media-upload-input"
              className="relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-xl p-7 text-center cursor-pointer transition-all bg-slate-950/40 group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <UploadCloud
                size={32}
                className="text-emerald-400 group-hover:scale-110 transition-transform mb-2.5 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
              <span className="text-xs font-semibold text-slate-200">
                {selectedFile ? selectedFile.name : `Select or drag ${mode} asset`}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 font-mono">
                Processed locally; memory buffers erased after extraction
              </span>
              <input
                id="media-upload-input"
                type="file"
                className="hidden"
                accept={
                  mode === "image"
                    ? "image/jpeg,image/png,image/webp"
                    : "video/mp4,video/quicktime,video/x-matroska,video/webm"
                }
                onChange={handleFileChange}
              />
            </motion.label>

            {/* Media Preview with scanline effect */}
            {previewUrl && (
              <motion.div
                className="relative rounded-xl border border-slate-800 bg-slate-950 p-2 overflow-hidden flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-[10px] text-slate-400 pb-1.5 self-start px-1 font-mono flex items-center justify-between w-full">
                  <span>Target Loaded: {selectedFile?.name}</span>
                  <span className="text-emerald-400">Ready</span>
                </div>
                {mode === "image" ? (
                  <img
                    src={previewUrl}
                    alt="Inspection preview"
                    className="max-h-60 rounded object-contain w-auto shadow-md"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-60 rounded w-full bg-black shadow-md"
                  />
                )}
              </motion.div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <motion.button
                type="submit"
                disabled={analyzing || !selectedFile}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs py-3.5 px-4 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={!analyzing && selectedFile ? { scale: 1.02 } : {}}
                whileTap={!analyzing && selectedFile ? { scale: 0.98 } : {}}
              >
                {analyzing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin text-slate-950" />
                    Neural Inference Running…
                  </>
                ) : (
                  <>
                    <Scan size={15} />
                    Run Deepfake Forensics
                  </>
                )}
              </motion.button>

              {(selectedFile || result) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/60 text-slate-300 text-xs py-3.5 px-4 font-semibold transition"
                  title="Reset"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.form>

          {/* Explainability Info Callout */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Info size={14} className="text-emerald-400" />
              Multimodal Forensic Verification
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Evaluates observable forensic anomalies—edge discontinuity, high-frequency energy disruption, noise consistency, and temporal inter-frame variance—rather than opaque black-box assertions.
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {analyzing && (
              <motion.div
                key="analyzing"
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 flex flex-col items-center justify-center text-center min-h-[380px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingState label="Deconstructing 2D Fourier Spectra & Discrete Cosine Transforms…" />
              </motion.div>
            )}

            {!analyzing && !result && (
              <motion.div
                key="empty"
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 flex flex-col items-center justify-center text-center min-h-[380px] text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Sliders size={40} className="text-slate-700 mb-3" />
                <div className="text-sm font-semibold text-slate-300">Awaiting Forensic Target</div>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Upload an image or video above to trigger frequency domain, noise residual, and deepfake heuristic extraction.
                </p>
              </motion.div>
            )}

            {!analyzing && result && (
              <motion.div
                key="results"
                className="space-y-4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* Primary Assessment Card */}
                <div className="rounded-2xl border border-emerald-500/25 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs text-emerald-400 uppercase tracking-widest font-mono font-semibold">
                        Forensic Classification
                      </div>
                      <div className="text-xl font-bold text-white mt-1">
                        {result.classification || "Analysis Complete"}
                      </div>
                    </div>
                    <RiskBadge level={result.risk_level} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard
                      title="Risk Score"
                      value={`${result.manipulation_score !== undefined ? Math.round(result.manipulation_score * 100) : result.manipulation_percentage}%`}
                      hint="Probability index"
                    />
                    <StatCard
                      title="Risk Level"
                      value={result.risk_level}
                      hint="Threat grade"
                    />
                    <StatCard
                      title="Media Type"
                      value={result.media_type ? result.media_type.toUpperCase() : mode.toUpperCase()}
                      hint={mode === "video" ? `${result.frame_count || 0} frames` : "Single asset"}
                    />
                    <StatCard
                      title="Inference Engine"
                      value={result.model_type || "Forensic Hybrid"}
                      hint="Multimodal model"
                    />
                  </div>

                  {result.message && (
                    <div className="mt-4 rounded-xl bg-slate-950/80 p-4 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                      <span className="font-semibold text-emerald-400">Diagnosis: </span>
                      {result.message}
                    </div>
                  )}
                </div>

                {/* Forensic Signals Breakdown */}
                {result.signals && Object.keys(result.signals).length > 0 && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                        Extracted Spectral & Spatial Signals
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Normalized Disruption [0.0 - 1.0]
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {Object.entries(result.signals).map(([signalKey, score], idx) => {
                        const numericScore = typeof score === "number" ? score : parseFloat(score) || 0;
                        const percentage = Math.min(100, Math.max(0, Math.round(numericScore * 100)));
                        const isHigh = percentage > 60;
                        const isMedium = percentage > 35 && percentage <= 60;

                        return (
                          <div key={signalKey} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-200 font-medium">
                                {formatSignalName(signalKey)}
                              </span>
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isHigh
                                    ? "text-rose-400"
                                    : isMedium
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {percentage}% ({numericScore.toFixed(3)})
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <motion.div
                                className={`h-full rounded-full ${
                                  isHigh
                                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                    : isMedium
                                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                    : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.08, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Detected Forensic Artifacts */}
                {result.artifacts && result.artifacts.length > 0 && (
                  <motion.div
                    className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-2.5 backdrop-blur-xl"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono">
                      <AlertTriangle size={16} />
                      DETECTED FORGERY MARKERS
                    </div>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                      {result.artifacts.map((art, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {art}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
