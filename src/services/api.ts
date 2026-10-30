import type {
  User,
  Tournament,
  Transaction,
  WithdrawalRequest,
  Notification,
  Announcement,
  LeaderboardPlayer
} from '../types/index.ts';

const USER_ID_KEY = 'ff_arena_user_id';
const ADMIN_KEY_VALUE = 'FF_ADMIN_SECRET_2026';

export const getStoredUserId = (): string => {
  return localStorage.getItem(USER_ID_KEY) || 'user_viper';
};

export const setStoredUserId = (userId: string) => {
  localStorage.setItem(USER_ID_KEY, userId);
};

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getStoredUserId(),
    'x-admin-key': ADMIN_KEY_VALUE,
  };
};

export const api = {
  // Auth
  async sendOtp(identifier: string) {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ identifier }),
    });
    return res.json();
  },

  async verifyOtp(payload: { identifier: string; otp: string; username?: string; ffUid?: string }) {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.user) {
      setStoredUserId(data.user.id);
    }
    return data;
  },

  async quickSwitch(role: 'admin' | 'user') {
    const res = await fetch('/api/auth/quick-switch', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (data.user) {
      setStoredUserId(data.user.id);
    }
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateProfile(payload: { username?: string; ffUid?: string; ffIgn?: string; avatar?: string }) {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Tournaments
  async getTournaments(params?: { status?: string; mode?: string; feeType?: string; map?: string }): Promise<{ tournaments: Tournament[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`/api/tournaments?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getTournament(id: string): Promise<{ tournament: Tournament }> {
    const res = await fetch(`/api/tournaments/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async joinTournament(id: string, payload: { ffUid: string; teamName?: string }) {
    const res = await fetch(`/api/tournaments/${id}/join`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async leaveTournament(id: string) {
    const res = await fetch(`/api/tournaments/${id}/leave`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Wallet
  async getWallet(): Promise<{
    depositBalance: number;
    winningBalance: number;
    totalBalance: number;
    transactions: Transaction[];
    withdrawals: WithdrawalRequest[];
  }> {
    const res = await fetch('/api/wallet', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async deposit(payload: { amount: number; upiReference?: string; paymentMethod?: string }) {
    const res = await fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async withdraw(payload: { amount: number; upiId: string; bankAccount?: string }) {
    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Leaderboard & Winners
  async getLeaderboard(): Promise<{ leaderboard: LeaderboardPlayer[] }> {
    const res = await fetch('/api/leaderboard', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getRecentWinners(): Promise<{ winners: any[] }> {
    const res = await fetch('/api/winners/recent', {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Announcements & Notifications
  async getAnnouncements(): Promise<{ announcements: Announcement[] }> {
    const res = await fetch('/api/announcements', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getNotifications(): Promise<{ notifications: Notification[] }> {
    const res = await fetch('/api/notifications', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Admin APIs
  async getAdminOverview() {
    const res = await fetch('/api/admin/overview', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/admin/users', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async toggleBlockUser(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}/toggle-block`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async createTournament(payload: any) {
    const res = await fetch('/api/admin/tournaments', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateTournament(id: string, payload: any) {
    const res = await fetch(`/api/admin/tournaments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteTournament(id: string) {
    const res = await fetch(`/api/admin/tournaments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async uploadResults(id: string, results: { slotNumber: number; rank: number; kills: number }[]) {
    const res = await fetch(`/api/admin/tournaments/${id}/results`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ results }),
    });
    return res.json();
  },

  async distributePrizes(id: string) {
    const res = await fetch(`/api/admin/tournaments/${id}/distribute-prizes`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAdminWithdrawals(): Promise<{ withdrawals: WithdrawalRequest[] }> {
    const res = await fetch('/api/admin/withdrawals', {
      headers: getHeaders(),
    });
    return res.json();
  },

  async handleWithdrawal(id: string, action: 'APPROVE' | 'REJECT', remarks?: string) {
    const res = await fetch(`/api/admin/withdrawals/${id}/action`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, remarks }),
    });
    return res.json();
  },

  async broadcastNotification(title: string, message: string) {
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, message }),
    });
    return res.json();
  },
};
