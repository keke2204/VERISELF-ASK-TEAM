const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV
    ? "http://127.0.0.1:8000"
    : "https://veriself-ask-team-api.onrender.com")
).replace(/\/$/, "");

async function request(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});
  let response;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal,
      });

      if (![502, 503, 504].includes(response.status) || attempt === 2) break;
    } catch (error) {
      if (error.name === "AbortError") throw error;
      if (attempt === 2) break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
  }

  if (!response) {
    throw new Error(
      "The VeriSelf API is waking up or temporarily unavailable. Please wait a few seconds and try again."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    if (typeof data?.detail === "string") message = data.detail;
    else if (data?.detail) message = JSON.stringify(data.detail);
    if ([502, 503, 504].includes(response.status)) {
      message = "The VeriSelf API is waking up or temporarily unavailable. Please try again in a few seconds.";
    }
    throw new Error(message);
  }
  return data;
}

async function warmApi() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}/health`, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // Retry while the Render instance is waking.
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
  }
}

export const getHealth = () => request("/health");
export const registerIdentity = async (formData) => {
  await warmApi();
  return request("/identity/register", { method: "POST", body: formData });
};
export const verifyIdentity = async (formData) => {
  await warmApi();
  return request("/identity/verify", { method: "POST", body: formData });
};
export const analyzeImage = async (formData) => {
  await warmApi();
  return request("/manipulation/analyze-image", { method: "POST", body: formData });
};
export const analyzeVideo = async (formData) => {
  await warmApi();
  return request("/manipulation/analyze-video", { method: "POST", body: formData });
};
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
