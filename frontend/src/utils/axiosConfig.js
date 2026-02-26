import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

export const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  apiBaseUrl.replace(/\/api\/?$/, '');

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (_error) {
    return null;
  }
};

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  if (error.message === 'Network Error') return 'Unable to reach server. Check your internet connection.';
  return error.message || fallback;
};

instance.interceptors.request.use((config) => {
  const user = parseStoredUser();
  if (user?.token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = String(error.response?.data?.message || '').toLowerCase();
    const authFailure =
      status === 401 ||
      status === 403 ||
      serverMessage.includes('not authorized') ||
      serverMessage.includes('user not found') ||
      serverMessage.includes('suspended');

    if (authFailure) {
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('bidpulse:auth-expired'));
    }

    return Promise.reject(error);
  }
);

export default instance;
