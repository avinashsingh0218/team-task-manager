import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api.get('/api/auth/me')
        .then((res) => {
          setUser(res.data);
        })
        .catch((err) => {
          console.error('Token invalid:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });

      const { access_token, user: userData } = res.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ SIGNUP
  const signup = async (name, email, password) => {
    try {
      const res = await api.post('/api/auth/signup', {
        name,
        email,
        password,
      });

      const { access_token, user: userData } = res.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}