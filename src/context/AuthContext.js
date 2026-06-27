import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

// ===== CRÉATION DU CONTEXTE =====
const AuthContext = createContext();

// ===== PROVIDER =====
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== CONNEXION =====
  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response.data.data;

      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setToken(token);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion.';
      return { success: false, message };
    }
  };

  // ===== INSCRIPTION =====
  const register = async (name, email, password) => {
    try {
      const response = await authService.register({ name, email, password });
      const { user, token } = response.data.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setToken(token);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'inscription.';
      return { success: false, message };
    }
  };

  // ===== DÉCONNEXION =====
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  // ===== MISE À JOUR PROFIL =====
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== HOOK PERSONNALISÉ =====
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};

export default AuthContext;