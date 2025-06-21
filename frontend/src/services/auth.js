import api from './api';

export function useAuth() {
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const login = async (credentials) => {
    const { data } = await api.post('/api/login', credentials);
    localStorage.setItem('token', data.access_token);
  };

  const logout = () => {
    localStorage.removeItem('token');
  };

  return { isAuthenticated, login, logout };
}