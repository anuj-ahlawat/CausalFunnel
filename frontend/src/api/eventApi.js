import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export const fetchSessions = async () => {
  try {
    const { data } = await api.get('/sessions');
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchSessionEvents = async (sessionId) => {
  try {
    const { data } = await api.get(`/sessions/${sessionId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchHeatmapData = async (pageUrl) => {
  try {
    const { data } = await api.get('/heatmap', {
      params: { url: pageUrl },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchPages = async () => {
  try {
    const { data } = await api.get('/pages');
    return data;
  } catch (error) {
    throw error;
  }
};

export default api;
