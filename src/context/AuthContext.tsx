import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Notification } from '../types/index.ts';
import { api, setStoredUserId } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  activeTab: 'tournaments' | 'mymatches' | 'leaderboard' | 'wallet' | 'admin';
  setActiveTab: (tab: 'tournaments' | 'mymatches' | 'leaderboard' | 'wallet' | 'admin') => void;
  openAuthModal: boolean;
  setOpenAuthModal: (open: boolean) => void;
  openWalletModal: boolean;
  setOpenWalletModal: (open: boolean) => void;
  walletInitialTab: 'deposit' | 'withdraw' | 'history';
  setWalletInitialTab: (tab: 'deposit' | 'withdraw' | 'history') => void;
  openNotificationsModal: boolean;
  setOpenNotificationsModal: (open: boolean) => void;
  openProfileModal: boolean;
  setOpenProfileModal: (open: boolean) => void;
  openPwaModal: boolean;
  setOpenPwaModal: (open: boolean) => void;
  notifications: Notification[];
  unreadCount: number;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  logout: () => void;
  quickSwitch: (role: 'admin' | 'user') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tournaments' | 'mymatches' | 'leaderboard' | 'wallet' | 'admin'>('tournaments');
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const [walletInitialTab, setWalletInitialTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [openNotificationsModal, setOpenNotificationsModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openPwaModal, setOpenPwaModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      if (res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshUser(), refreshNotifications()]);
      setIsLoading(false);
    };
    init();

    // Poll notifications every 20 seconds
    const interval = setInterval(refreshNotifications, 20000);
    return () => clearInterval(interval);
  }, [refreshUser, refreshNotifications]);

  const logout = () => {
    localStorage.removeItem('ff_arena_user_id');
    setUser(null);
    setOpenAuthModal(true);
  };

  const quickSwitch = async (role: 'admin' | 'user') => {
    try {
      setIsLoading(true);
      const res = await api.quickSwitch(role);
      if (res.user) {
        setUser(res.user);
        setStoredUserId(res.user.id);
        await refreshNotifications();
        if (role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('tournaments');
        }
      }
    } catch (err) {
      console.error('Failed to quick switch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        activeTab,
        setActiveTab,
        openAuthModal,
        setOpenAuthModal,
        openWalletModal,
        setOpenWalletModal,
        walletInitialTab,
        setWalletInitialTab,
        openNotificationsModal,
        setOpenNotificationsModal,
        openProfileModal,
        setOpenProfileModal,
        openPwaModal,
        setOpenPwaModal,
        notifications,
        unreadCount,
        refreshUser,
        refreshNotifications,
        logout,
        quickSwitch,
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
