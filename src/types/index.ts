export type TournamentMode = 'Solo' | 'Duo' | 'Squad' | 'Clash Squad' | 'Battle Royale';
export type TournamentMap = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra';
export type TournamentStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
export type MatchType = 'Free Entry' | 'Paid Entry' | 'High Roller' | 'Grand Championship';

export interface User {
  id: string;
  email: string;
  phone: string;
  username: string;
  ffUid: string; // Free Fire Player UID
  ffIgn?: string; // In-Game Name
  avatar: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  depositBalance: number;
  winningBalance: number;
  totalKills: number;
  matchesPlayed: number;
  matchesWon: number;
  createdAt: string;
}

export interface TournamentSlot {
  slotNumber: number;
  userId: string;
  username: string;
  ffUid: string;
  teamName?: string;
  registeredAt: string;
  kills?: number;
  rank?: number;
  prizeWon?: number;
}

export interface PrizeBreakdown {
  rank1: number;
  rank2?: number;
  rank3?: number;
  perKill: number;
}

export interface Tournament {
  id: string;
  title: string;
  bannerUrl: string;
  mode: TournamentMode;
  map: TournamentMap;
  matchType: MatchType;
  entryFee: number;
  prizePool: number;
  prizeBreakdown: PrizeBreakdown;
  maxSlots: number;
  slotsFilled: number;
  slots: TournamentSlot[];
  matchTime: string; // ISO string
  status: TournamentStatus;
  rules: string[];
  roomId?: string;
  roomPass?: string;
  roomRevealed: boolean;
  version: string;
  resultsDeclared: boolean;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ENTRY_FEE' | 'PRIZE_WIN' | 'REFUND';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'REJECTED' | 'FAILED';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  tournamentId?: string;
  upiReference?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  upiId: string;
  bankAccount?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminRemarks?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface Notification {
  id: string;
  userId: string; // 'all' or specific userId
  title: string;
  message: string;
  type: 'MATCH_START' | 'ROOM_CREDS' | 'WALLET' | 'WINNER' | 'SYSTEM';
  read: boolean;
  tournamentId?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  badge: string;
  date: string;
  active: boolean;
}

export interface LeaderboardPlayer {
  rank: number;
  userId: string;
  username: string;
  ffUid: string;
  avatar: string;
  totalWinnings: number;
  totalKills: number;
  matchesWon: number;
  winRate: number;
  tier: 'Grandmaster' | 'Master' | 'Heroic' | 'Diamond';
}
