import axios from 'axios';

const api = axios.create({
  baseURL: 'https://careercompassai-pang.onrender.com/api', // adjust base URL accordingly
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
