import axios from 'axios';

const instance = axios.create({
    // VITE_API_URL will be set in Vercel later. 
    // If it's missing, it defaults to localhost for development.
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default instance;