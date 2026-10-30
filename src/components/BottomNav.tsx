import React from 'react';
import { Swords, Trophy, Wallet, Crosshair, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const BottomNav: React.FC = () => {
  const { user, activeTab, setActiveTab, setOpenProfileModal, setWalletInitialTab, setOpenWalletModal } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'tournaments' ? 'text-red-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Swords className="h-5 w-5" />
          <span>Tourneys</span>
        </button>

        <button
          onClick={() => setActiveTab('mymatches')}
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'mymatches' ? 'text-red-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Crosshair className="h-5 w-5" />
          <span>My Matches</span>
        </button>

        <button
          onClick={() => {
            setWalletInitialTab('deposit');
            setActiveTab('wallet');
          }}
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'wallet' ? 'text-red-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Wallet className="h-5 w-5" />
          <span>Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'leaderboard' ? 'text-red-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Trophy className="h-5 w-5" />
          <span>Ranks</span>
        </button>

        {user?.role === 'admin' ? (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center gap-1 w-14 py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'admin' ? 'text-red-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Admin</span>
          </button>
        ) : (
          <button
            onClick={() => setOpenProfileModal(true)}
            className="flex flex-col items-center justify-center gap-1 w-14 py-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </button>
        )}
      </div>
    </nav>
  );
};
