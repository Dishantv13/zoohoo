import axios from 'axios';

const authApi = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
});

export const authAPI = {
  register: (data) => authApi.post('/register', data),
  login: (data) => authApi.post('/login', data),
  getCurrentUser: () => authApi.get('/me'),
};

export default authApi;