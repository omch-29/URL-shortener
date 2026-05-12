// client/src/api.js
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  shorten: (originalUrl, customCode) =>
    request("/shorten", {
      method: "POST",
      body: JSON.stringify({ originalUrl, customCode: customCode || undefined }),
    }),
  getStats: (code) => request(`/stats/${code}`),
  getAll: (page = 1, limit = 10) => request(`/urls?page=${page}&limit=${limit}`),
  delete: (code) => request(`/urls/${code}`, { method: "DELETE" }),
};