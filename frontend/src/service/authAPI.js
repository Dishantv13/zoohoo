import axios from 'axios';

const authApi = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data) => authApi.post('/register', data),
  login: (data) => authApi.post('/login', data),
  getCurrentUser: () => authApi.get('/me'),
};

export default authApi;