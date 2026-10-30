import React from 'react';
import { Flame, Bell, Wallet, User as UserIcon, Shield, ChevronDown, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const Header: React.FC = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    setOpenAuthModal,
    setOpenWalletModal,
    setWalletInitialTab,
    setOpenNotificationsModal,
    setOpenProfileModal,
    setOpenPwaModal,
    unreadCount,
    quickSwitch,
  } = useAuth();

  const totalBalance = (user?.depositBalance || 0) + (user?.winningBalance || 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single element, no attached pills) */}
        <button
          onClick={() => setActiveTab('tournaments')}
          className="flex items-center gap-2.5 text-left text-lg font-black tracking-tight text-neutral-100 transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 via-red-500 to-orange-500 shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-heading tracking-wider text-neutral-100">FF BATTLE</span>
            <span className="ml-1.5 font-heading tracking-wider text-red-500">ARENA</span>
          </div>
        </button>

        {/* Zone 2: Clean 4–5 single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'tournaments' ? 'text-red-400 font-semibold' : ''
            }`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab('mymatches')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'mymatches' ? 'text-red-400 font-semibold' : ''
            }`}
          >
            My Matches
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'leaderboard' ? 'text-red-400 font-semibold' : ''
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => {
              setWalletInitialTab('deposit');
              setActiveTab('wallet');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'wallet' ? 'text-red-400 font-semibold' : ''
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-red-400 ${
              activeTab === 'admin' ? 'text-red-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-red-500" />
            Admin Panel
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & User Utility Zone */}
        <div className="flex items-center gap-3 shrink-0">
          {/* APK / Mobile App Install Button */}
          <button
            onClick={() => setOpenPwaModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-400 hover:border-red-500 hover:bg-red-950/80 transition-colors whitespace-nowrap shrink-0"
            title="Download & Install Mobile App (APK)"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Get App (APK)</span>
            <span className="sm:hidden">App</span>
          </button>

          {user ? (
            <>
              {/* Wallet quick button */}
              <button
                onClick={() => {
                  setWalletInitialTab('deposit');
                  setOpenWalletModal(true);
                }}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-red-500/50 hover:bg-neutral-800/90 whitespace-nowrap shrink-0"
                title="Click to Add Money or Withdraw"
              >
                <Wallet className="h-3.5 w-3.5 text-amber-500" />
                <span className="tabular-nums font-mono text-amber-400">₹{totalBalance.toLocaleString()}</span>
                <span className="rounded bg-red-600/20 px-1 py-0.5 text-[10px] text-red-400 font-medium">+ Add</span>
              </button>

              {/* Notification bell */}
              <button
                onClick={() => setOpenNotificationsModal(true)}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile button */}
              <button
                onClick={() => setOpenProfileModal(true)}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 p-1 pr-2.5 transition-colors hover:border-neutral-700 text-neutral-200"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-6 w-6 rounded-md bg-neutral-800 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-800 text-[10px] font-bold text-neutral-300">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden text-xs font-medium lg:inline max-w-[100px] truncate">{user.username}</span>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setOpenAuthModal(true)}
              className="rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-red-900/30 transition-transform active:scale-95 hover:from-red-500 hover:to-orange-500 whitespace-nowrap shrink-0"
            >
              Login / Register
            </button>
          )}

          {/* Quick Role Switcher for seamless test review */}
          <div className="hidden xl:flex items-center gap-1 border-l border-neutral-800 pl-3">
            <button
              onClick={() => quickSwitch('user')}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                user?.role === 'user' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Gamer Mode
            </button>
            <button
              onClick={() => quickSwitch('admin')}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                user?.role === 'admin' ? 'bg-red-950/80 text-red-300 border border-red-800/40' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Admin Mode
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
