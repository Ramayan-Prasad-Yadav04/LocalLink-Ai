import axios from 'axios';

// Use environment variable or default to backend host/port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Intercept requests to attach JWT authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('floodwatch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      // Token expired or invalid
      localStorage.removeItem('floodwatch_token');
      localStorage.removeItem('floodwatch_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  async login(username, password) {
    const res = await apiClient.post('/api/auth/login', { username, password });
    return res.data;
  },

  async getCurrentUser() {
    const res = await apiClient.get('/api/auth/me');
    return res.data;
  },

  // Telemetry & Prediction
  async getLiveSensors() {
    const res = await apiClient.get('/api/sensors/live');
    return res.data;
  },

  async getSensorHistory() {
    const res = await apiClient.get('/api/sensors/history');
    return res.data;
  },

  async getPrediction() {
    const res = await apiClient.get('/api/prediction');
    return res.data;
  },

  async getRisk() {
    const res = await apiClient.get('/api/risk');
    return res.data;
  },

  // Geospatial Map
  async getMapSensors() {
    const res = await apiClient.get('/api/map/sensors');
    return res.data;
  },

  async getMapShelters() {
    const res = await apiClient.get('/api/map/shelters');
    return res.data;
  },

  async getEvacuationRoute() {
    const res = await apiClient.get('/api/evacuation/route');
    return res.data;
  },

  // Alerts
  async getAlerts() {
    const res = await apiClient.get('/api/alerts');
    return res.data;
  },

  async acknowledgeAlert(alertId) {
    const res = await apiClient.post('/api/alerts/acknowledge', { alert_id: alertId });
    return res.data;
  },

  // Demo Mode & Simulation Control
  async setSimulationScenario(scenario) {
    const res = await apiClient.post('/api/simulation/scenario', { scenario });
    return res.data;
  },

  async resetSimulation() {
    const res = await apiClient.post('/api/simulation/reset');
    return res.data;
  },

  async getHealth() {
    const res = await apiClient.get('/api/health');
    return res.data;
  }
};
