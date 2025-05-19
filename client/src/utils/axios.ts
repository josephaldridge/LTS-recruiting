import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE = process.env.REACT_APP_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Add a request interceptor to add the auth token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 