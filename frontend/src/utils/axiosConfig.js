import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
    baseURL: apiBaseUrl,
    timeout: 15000,
});

export const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  apiBaseUrl.replace(/\/api\/?$/, '');

export default instance;
