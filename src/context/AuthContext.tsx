import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string; demoOtp: string }>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  toggleFavorite: (providerId: string) => Promise<void>;
  isFavorite: (providerId: string) => boolean;
  clearSearchHistory: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('locallink_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await api.getUserProfile();
        setUser(profile);
      } catch (err) {
        console.error('Error loading user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const requestOtp = async (phone: string) => {
    return await api.requestOtp(phone);
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    const res = await api.verifyOtp(phone, otp);
    setUser(res.user);
    setToken(res.token);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('locallink_token');
    setToken(null);
    // Reset to guest
    const guestUser: User = {
      id: 'usr-guest-' + Date.now(),
      name: 'Guest User',
      phone: '',
      email: '',
      role: 'citizen',
      favorites: [],
      searchHistory: [],
      bookings: []
    };
    setUser(guestUser);
  };

  const toggleFavorite = async (providerId: string) => {
    const updatedFavorites = await api.toggleFavorite(providerId);
    if (user) {
      setUser({ ...user, favorites: updatedFavorites });
    }
  };

  const isFavorite = (providerId: string): boolean => {
    return !!user?.favorites?.includes(providerId);
  };

  const clearSearchHistory = async () => {
    await api.clearSearchHistory();
    if (user) {
      setUser({ ...user, searchHistory: [] });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await api.updateUserProfile(data);
    setUser(updated);
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!token && !!user?.phone,
        token,
        loading,
        requestOtp,
        loginWithOtp,
        logout,
        toggleFavorite,
        isFavorite,
        clearSearchHistory,
        updateProfile,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
