import axios from 'axios';
import { handleMockRequest } from './mockApiHandler';

// Determine if we're running in static hosting (e.g. GitHub Pages) where no live Express server exists
const isStaticHosting =
  window.location.hostname.includes('github.io') ||
  window.location.hostname.includes('vercel.app') ||
  import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // In static demo hosting, intercept immediately for instant, reliable interactive response
    if (isStaticHosting && !import.meta.env.VITE_API_URL) {
      try {
        const mockResponse = await handleMockRequest(config);
        config.adapter = () =>
          Promise.resolve({
            data: mockResponse.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          });
      } catch (mockError) {
        config.adapter = () => Promise.reject(mockError);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handles 401 and falls back to mock handler if backend server is unreachable
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend is down or unreachable (Network Error or 404), fall back to Mock Demo Handler
    if (
      (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404) &&
      !isStaticHosting
    ) {
      try {
        console.warn('Backend server unreachable; falling back to interactive demo storage.');
        const mockResponse = await handleMockRequest(error.config);
        return {
          data: mockResponse.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        };
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }

    if (error.response && error.response.status === 401) {
      const isAuthPage =
        window.location.hash.includes('/login') ||
        window.location.hash.includes('/register') ||
        window.location.pathname.includes('/login');
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
