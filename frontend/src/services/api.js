// API client for Yuva Energy backend
const API_BASE = '/api/v1';

export const getAuthToken = () => {
  const token = localStorage.getItem('yuva_token');
  if (!token || token === 'undefined' || token === 'null') return null;
  return token;
};
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('yuva_token', token);
  else localStorage.removeItem('yuva_token');
};
export const removeAuthToken = () => {
  localStorage.removeItem('yuva_token');
  localStorage.removeItem('yuva_user');
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('yuva_user');
    if (!user || user === 'undefined' || user === 'null') return null;
    return JSON.parse(user);
  } catch {
    return null;
  }
};
export const setCurrentUser = (user) => {
  if (user) localStorage.setItem('yuva_user', JSON.stringify(user));
  else localStorage.removeItem('yuva_user');
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/me'),

  // Farms & Fields
  listFarms: () => request('/farms'),
  createFarm: (data) => request('/farms', { method: 'POST', body: JSON.stringify(data) }),
  listFields: (farmId) => request(farmId ? `/fields?farm_id=${farmId}` : '/fields'),
  createField: (data) => request('/fields', { method: 'POST', body: JSON.stringify(data) }),

  // Crops & Cycles
  listCrops: () => request('/crops'),
  listCropCycles: (fieldId) => request(`/crop-cycles?field_id=${fieldId}`),
  createCropCycle: (data) => request('/crop-cycles', { method: 'POST', body: JSON.stringify(data) }),

  // Ingestion & Sync
  syncField: (fieldId, domains = ['WEATHER', 'SOIL', 'SATELLITE']) =>
    request(`/ingestion/fields/${fieldId}/sync`, { method: 'POST', body: JSON.stringify({ domains }) }),
  getFieldFreshness: (fieldId) => request(`/ingestion/fields/${fieldId}/freshness`),
  listIngestionRuns: (limit = 10) => request(`/ingestion/runs?limit=${limit}`),

  // Agronomic Intelligence & Recommendations
  evaluateField: (fieldId) => request(`/recommendations/fields/${fieldId}/evaluate`, { method: 'POST' }),
  getWaterBalance: (fieldId) => request(`/recommendations/fields/${fieldId}/water-balance`),
  listRecommendations: () => request('/recommendations'),
  getRecommendation: (id) => request(`/recommendations/${id}`),
  submitFeedback: (recId, data) =>
    request(`/recommendations/${recId}/feedback`, { method: 'POST', body: JSON.stringify(data) }),

  // Analytics & Weather
  getWeatherSummary: (fieldId) => request(`/weather/fields/${fieldId}/summary`),
  getSoilProfile: (fieldId) => request(`/soil/fields/${fieldId}`),
  getDashboardAnalytics: (farmId) => request(farmId ? `/analytics/dashboard?farm_id=${farmId}` : '/analytics/dashboard')
};
