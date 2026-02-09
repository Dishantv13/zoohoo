// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/auth';

// const api = axios.create({
//     baseURL: API_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// // Auth endpoints
// export const authAPI = {
//     register: (data) => api.post('/register', data),
//     login: (data) => api.post('/login', data),
//     getCurrentUser: () => api.get('/me'),
// };

// export default api;


import axios from 'axios';

const authApi = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
});

export const authAPI = {
  register: (data) => authApi.post('/register', data),
  login: (data) => authApi.post('/login', data),
  getCurrentUser: () => authApi.get('/me'),
};

