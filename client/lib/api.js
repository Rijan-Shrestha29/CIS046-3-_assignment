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

// --- Banana API (external, third-party, CORS-friendly) ---
// Docs: http://marcconrad.com/uob/banana/api.php
export const bananaApi = {
  // Returns { question: "https://.../tXXX.png", solution: 8 }
  fetchEquation: async () => {
    // Note: no credentials here — this is a third-party service
    const res = await fetch('http://marcconrad.com/uob/banana/api.php', {
      cache: 'no-store',   // every call should return a NEW equation
    });
    if (!res.ok) throw new Error('Failed to fetch equation');
    const data = await res.json();
    return data; // { question, solution }
  },
};