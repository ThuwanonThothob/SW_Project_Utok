const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
  return data;
}

function authHeaders(token, json = true) {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  health: () => request("/health"),
  networkInfo: () => request("/network-info"),
  provinces: () => request("/provinces"),
  reports: () => request("/reports"),
  broadcasts: () => request("/broadcasts"),
  login: (email, password) => request("/auth/login", { method: "POST", headers: authHeaders(null), body: JSON.stringify({ email, password }) }),
  register: (payload) => request("/auth/register", { method: "POST", headers: authHeaders(null), body: JSON.stringify(payload) }),
  me: (token) => request("/auth/me", { headers: authHeaders(token, false) }),
  updateProfile: (payload, token) => request("/auth/profile", { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(payload) }),
  myReports: (token) => request("/auth/my-reports", { headers: authHeaders(token, false) }),
  createReport: (formData, token) => request("/reports", { method: "POST", headers: authHeaders(token, false), body: formData }),
  deleteReport: (id, token) => request(`/reports/${id}`, { method: "DELETE", headers: authHeaders(token, false) }),
  updateReportStatus: (id, status, token) => request(`/reports/${id}/status`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ status }) }),
  updateProvince: (id, risk, score, token) => request(`/provinces/${id}/risk`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ risk, score }) }),
  createBroadcast: (payload, token) => request("/broadcasts", { method: "POST", headers: authHeaders(token), body: JSON.stringify(payload) }),
  deleteBroadcast: (id, token) => request(`/broadcasts/${id}`, { method: "DELETE", headers: authHeaders(token, false) }),
  testNotification: (payload, token) => request("/broadcasts/test-notification", { method: "POST", headers: authHeaders(token), body: JSON.stringify(payload) }),
  aiTriage: (payload) => request("/ai/triage", { method: "POST", headers: authHeaders(null), body: JSON.stringify(payload) }),
  news: () => request("/news"),
  refreshNews: () => request("/news/refresh", { method: "POST", headers: authHeaders(null) }),
  eventsUrl: `${API_URL}/events`,
};
