const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("veriself_access_token");
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") message = data.detail;
      else if (data.detail) message = JSON.stringify(data.detail);
    } catch {}
    throw new Error(message);
  }
  return response.json();
}
export const login = (username, password) => request("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });

export const getHealth = () => request("/health");
export const registerIdentity = (formData) => request("/identity/register", { method: "POST", body: formData });
export const verifyIdentity = (formData) => request("/identity/verify", { method: "POST", body: formData });
export const analyzeImage = (formData) => request("/manipulation/analyze-image", { method: "POST", body: formData });
export const analyzeVideo = (formData) => request("/manipulation/analyze-video", { method: "POST", body: formData });
export const getMonitoringTargets = (userId) => request(`/monitoring/targets/${userId}`);
export const createMonitoringTarget = (userId, targetUrl) => request("/monitoring/targets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: Number(userId), target_url: targetUrl }) });
export const scanMonitoringTarget = (targetId) => request(`/monitoring/targets/${targetId}/scan`, { method: "POST" });
export const getMonitoringResults = (targetId) => request(`/monitoring/results/${targetId}`);
export const verifyMatch = (identityId, candidateUrl, authorized = false) => request("/matches/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identity_id: Number(identityId), candidate_url: candidateUrl, authorized }) });
export const getMatchHistory = (identityId) => request(`/matches/history/${identityId}`);
export const assessRisk = (matchId) => request(`/risk/assess/${matchId}`, { method: "POST" });
export const getFindings = (identityId) => request(`/risk/findings/${identityId}`);
export const getRiskSummary = (identityId) => request(`/risk/summary/${identityId}`);
export const getAlerts = (identityId) => request(`/alerts/${identityId}`);
export const updateAlertStatus = (alertId, status) => request(`/alerts/${alertId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: status.toUpperCase() }) });
export const getEvidence = (identityId) => request(`/evidence/${identityId}`);
export const generateLegalNotice = (findingId) => request(`/legal-response/generate/${findingId}`, { method: "POST" });
export const getLegalResponses = (identityId) => request(`/legal-response/${identityId}`);
export const protectMedia = (formData) => request("/protection/protect", { method: "POST", body: formData });
export const verifyProtectedMedia = (formData) => request("/protection/verify", { method: "POST", body: formData });
export const getProtectionHistory = (identityId) => request(`/protection/history/${identityId}`);
export async function downloadProtectedMedia(protectionId) {
  const response = await fetch(`${API_BASE}/protection/download/${protectionId}`);
  if (!response.ok) throw new Error(`Unable to download protected media: ${response.status}`);
  return response.blob();
}
export { API_BASE };
