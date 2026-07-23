import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, isAuthenticated: true, user: action.payload, error: null };
    case 'AUTH_FAILURE':
      return { ...state, isLoading: false, isAuthenticated: false, user: null, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = useCallback(async () => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authService.getMe();
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data.data });
    } catch {
      dispatch({ type: 'AUTH_FAILURE', payload: null });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data.data.user });
      return res.data.data.user;
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message });
      throw error;
    }
  };

  const googleLogin = async (credential) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const res = await authService.googleLogin(credential);
      dispatch({ type: 'AUTH_SUCCESS', payload: res.data.data.user });
      return res.data.data.user;
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const register = async (data) => {
    const res = await authService.register(data);
    return res.data;
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, googleLogin, logout, register, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
