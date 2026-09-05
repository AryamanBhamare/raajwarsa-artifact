const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, auth = false } = options;

  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = localStorage.getItem('rw_admin_token');
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' })
};

export const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

/* ============ PUBLIC API ============ */

export async function fetchHome() {
  return api.get('/api/public/home');
}

export async function fetchArtifacts(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return api.get(`/api/public/artifacts?${q.toString()}`);
}

export async function fetchArtifact(slug) {
  return api.get(`/api/public/artifacts/${slug}`);
}

export async function fetchFeatured() {
  return api.get('/api/public/artifacts/featured');
}

export async function fetchCategories() {
  return api.get('/api/public/categories');
}

export async function fetchFilterOptions() {
  const [periods, materials, regions] = await Promise.all([
    api.get('/api/public/artifacts/filters/periods'),
    api.get('/api/public/artifacts/filters/materials'),
    api.get('/api/public/artifacts/filters/regions')
  ]);
  return { periods, materials, regions };
}

export async function submitInquiry(payload) {
  return api.post('/api/public/inquiries', payload);
}

export async function submitContact(payload) {
  return api.post('/api/public/contact', payload);
}

export async function submitOrder(payload) {
  return api.post('/api/public/orders', payload);
}

export async function fetchJournal(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  return api.get(`/api/public/journal?${q.toString()}`);
}

export async function fetchJournalLatest() {
  return api.get('/api/public/journal/latest');
}

export async function fetchJournalArticle(slug) {
  return api.get(`/api/public/journal/${slug}`);
}

/* ============ AUTH ============ */

export async function adminLogin(username, password) {
  const res = await api.post('/api/auth/admin/login', { username, password });
  if (res.token) {
    localStorage.setItem('rw_admin_token', res.token);
    localStorage.setItem('rw_admin_username', res.username || username);
  }
  return res;
}

export function adminLogout() {
  localStorage.removeItem('rw_admin_token');
  localStorage.removeItem('rw_admin_username');
}

export function getAdminToken() {
  return localStorage.getItem('rw_admin_token');
}

export function isAdminAuthed() {
  return Boolean(getAdminToken());
}

/* ============ ADMIN API ============ */

export const adminApi = {
  dashboard: () => api.get('/api/admin/dashboard', { auth: true }),
  artifacts: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v);
    });
    return api.get(`/api/admin/artifacts?${q.toString()}`, { auth: true });
  },
  artifact: (id) => api.get(`/api/admin/artifacts/${id}`, { auth: true }),
  createArtifact: (payload) => api.post('/api/admin/artifacts', payload, { auth: true }),
  updateArtifact: (id, payload) => api.put(`/api/admin/artifacts/${id}`, payload, { auth: true }),
  deleteArtifact: (id) => api.del(`/api/admin/artifacts/${id}`, { auth: true }),
  categories: () => api.get('/api/admin/categories', { auth: true }),
  createCategory: (payload) => api.post('/api/admin/categories', payload, { auth: true }),
  updateCategory: (id, payload) => api.put(`/api/admin/categories/${id}`, payload, { auth: true }),
  deleteCategory: (id) => api.del(`/api/admin/categories/${id}`, { auth: true }),
  inquiries: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v);
    });
    return api.get(`/api/admin/inquiries?${q.toString()}`, { auth: true });
  },
  inquiry: (id) => api.get(`/api/admin/inquiries/${id}`, { auth: true }),
  setInquiryStatus: (id, status) => api.put(`/api/admin/inquiries/${id}/status`, { status }, { auth: true }),
  saveInquiryNotes: (id, note) => api.put(`/api/admin/inquiries/${id}/notes`, { note }, { auth: true }),
  addInquiryNote: (id, note) => api.post(`/api/admin/inquiries/${id}/notes`, { note }, { auth: true }),
  journal: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v);
    });
    return api.get(`/api/admin/journal?${q.toString()}`, { auth: true });
  },
  journalArticle: (slug) => api.get(`/api/admin/journal/${slug}`, { auth: true }),
  createJournal: (payload) => api.post('/api/admin/journal', payload, { auth: true }),
  updateJournal: (id, payload) => api.put(`/api/admin/journal/${id}`, payload, { auth: true }),
  deleteJournal: (id) => api.del(`/api/admin/journal/${id}`, { auth: true }),
  media: () => api.get('/api/admin/media', { auth: true }),
  uploadMedia: (file, artifactId, altText, kind) => {
    const fd = new FormData();
    fd.append('file', file);
    if (artifactId) fd.append('artifactId', artifactId);
    if (altText) fd.append('altText', altText);
    if (kind) fd.append('kind', kind);
    return fetch(`${API_BASE}/api/admin/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAdminToken()}` },
      body: fd
    }).then(async (res) => {
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const error = new Error(data?.message || 'Upload failed');
        error.status = res.status;
        throw error;
      }
      return data;
    });
  },
  deleteMedia: (id) => api.del(`/api/admin/media/${id}`, { auth: true }),
  orders: () => api.get('/api/admin/orders', { auth: true }),
  setOrderStatus: (id, status) => api.patch(`/api/admin/orders/${id}/status?status=${encodeURIComponent(status)}`, null, { auth: true })
};