// Central API wrapper.
// Every call to the backend goes through here so cookie handling,
// error shaping, and the base URL are defined once.
//
// Theme: Interoperability — a single client-side contract with the REST API.

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Base fetch: always sends cookies, parses JSON, throws on !ok
async function request(path, { method = 'GET', body, ...opts } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    credentials: 'include',              // send httpOnly cookie cross-origin
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const err = new Error((data && data.message) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// --- Auth ---
export const authApi = {
  register: (username, password) =>
    request('/api/auth/register', { method: 'POST', body: { username, password } }),
  login: (username, password) =>
    request('/api/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
};

// --- Scores ---
export const scoreApi = {
  submit: (score) =>
    request('/api/scores', { method: 'POST', body: { score } }),
  myScores: (page = 1, pageSize = 20) =>
    request(`/api/scores/me?page=${page}&pageSize=${pageSize}`),
  myHighScore: () => request('/api/scores/me/highscore'),
  leaderboard: (limit = 10) => request(`/api/scores/leaderboard?limit=${limit}`),
  stats: () => request('/api/scores/stats'),
};

// --- Banana API (proxied through our backend to avoid CORS on the upstream) ---
// The upstream http://marcconrad.com/uob/banana/api.php 301-redirects and
// does not send the CORS headers browsers require, so we call our own
// backend which proxies server-to-server.
// Reference: server/src/routes/bananaRoutes.js
export const bananaApi = {
  fetchEquation: () => request('/api/banana/question'),
};