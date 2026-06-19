import axios from 'axios';
import { debugLog, normalizeHeatmapResponse } from '../utils/coordinates';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const fetchSessions = async () => {
  const { data } = await api.get('/sessions');
  return data;
};

export const fetchSessionEvents = async (sessionId) => {
  const { data } = await api.get(`/sessions/${sessionId}`);
  debugLog('frontend:session-events', data);
  return data;
};

export const fetchHeatmapData = async (pageUrl) => {
  const { data } = await api.get('/heatmap', { params: { url: pageUrl } });
  const normalized = normalizeHeatmapResponse(data, pageUrl);
  debugLog('frontend:heatmap', normalized);
  return normalized;
};

export const fetchPages = async () => {
  const { data } = await api.get('/pages');
  return data;
};

export default api;
