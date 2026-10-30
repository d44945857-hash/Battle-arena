import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { BannerSlider } from './components/BannerSlider.tsx';
import { RecentChampions } from './components/RecentChampions.tsx';
import { TournamentFilter } from './components/TournamentFilter.tsx';
import { TournamentCard } from './components/TournamentCard.tsx';
import { JoinModal } from './components/JoinModal.tsx';
import { RoomCredentialsModal } from './components/RoomCredentialsModal.tsx';
import { WalletView } from './components/WalletView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { MyMatchesView } from './components/MyMatchesView.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { PWAInstallModal } from './components/PWAInstallModal.tsx';
import { api } from './services/api.ts';
import type { Tournament, Announcement } from './types/index.ts';
import { Swords, RefreshCw, X } from 'lucide-react';

function MainApp() {
  const {
    user,
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
    refreshUser,
  } = useAuth();

  // Tournament list state
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [feeTypeFilter, setFeeTypeFilter] = useState('all');
  const [mapFilter, setMapFilter] = useState('all');

  // Modals for actions
  const [selectedTourneyForJoin, setSelectedTourneyForJoin] = useState<Tournament | null>(null);
  const [selectedTourneyForRoom, setSelectedTourneyForRoom] = useState<Tournament | null>(null);

  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      const [tRes, aRes] = await Promise.all([
        api.getTournaments({
          status: statusFilter,
          mode: modeFilter,
          feeType: feeTypeFilter,
          map: mapFilter,
        }),
        api.getAnnouncements(),
      ]);
      setTournaments(tRes.tournaments || []);
      setAnnouncements(aRes.announcements || []);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, [statusFilter, modeFilter, feeTypeFilter, mapFilter, user]);

  const handleOpenRoomForId = async (tourneyId: string) => {
    try {
      const res = await api.getTournament(tourneyId);
      if (res.tournament) {
        setSelectedTourneyForRoom(res.tournament);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 flex flex-col justify-between selection:bg-red-600/30">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {activeTab === 'tournaments' && (
          <div>
            {/* Esports Hero Banner & Announcements */}
            <BannerSlider
              announcements={announcements}
              onExploreClick={() => {
                const el = document.getElementById('tournaments-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenWallet={() => {
                setWalletInitialTab('deposit');
                setOpenWalletModal(true);
              }}
            />

            {/* Showcase Recent Champions */}
            <RecentChampions onViewLeaderboard={() => setActiveTab('leaderboard')} />

            {/* Filter bar */}
            <div id="tournaments-section">
              <TournamentFilter
                status={statusFilter}
                setStatus={setStatusFilter}
                mode={modeFilter}
                setMode={setModeFilter}
                feeType={feeTypeFilter}
                setFeeType={setFeeTypeFilter}
                map={mapFilter}
                setMap={setMapFilter}
                totalCount={tournaments.length}
              />
            </div>

            {/* Tournaments Grid */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
                <RefreshCw className="h-7 w-7 animate-spin text-red-500" />
                <p className="text-xs font-semibold uppercase tracking-wider">Syncing Arena Lobby...</p>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-neutral-500 border border-neutral-800">
                  <Swords className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">No Tournaments Found</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  No active tournament matches match your filter criteria. Try changing the mode, map, or status filter.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setModeFilter('all');
                    setFeeTypeFilter('all');
                    setMapFilter('all');
                  }}
                  className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onJoinClick={(t) => {
                      if (!user) {
                        setOpenAuthModal(true);
                      } else {
                        setSelectedTourneyForJoin(t);
                      }
                    }}
                    onViewRoomClick={(t) => setSelectedTourneyForRoom(t)}
                    onViewResultsClick={() => setActiveTab('leaderboard')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Matches View */}
        {activeTab === 'mymatches' && (
          <MyMatchesView
            onViewRoom={(t) => setSelectedTourneyForRoom(t)}
            onExploreTournaments={() => setActiveTab('tournaments')}
          />
        )}

        {/* Leaderboard View */}
        {activeTab === 'leaderboard' && <LeaderboardView />}

        {/* Wallet View */}
        {activeTab === 'wallet' && <WalletView initialTab={walletInitialTab} />}

        {/* Admin Panel */}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav />

      {/* Global Modals */}
      <JoinModal
        tournament={selectedTourneyForJoin}
        onClose={() => setSelectedTourneyForJoin(null)}
        onSuccess={async () => {
          await loadTournaments();
          await refreshUser();
        }}
      />

      <RoomCredentialsModal
        tournament={selectedTourneyForRoom}
        onClose={() => setSelectedTourneyForRoom(null)}
      />

      <AuthModal
        isOpen={openAuthModal}
        onClose={() => setOpenAuthModal(false)}
      />

      <ProfileModal
        isOpen={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
      />

      <NotificationsModal
        isOpen={openNotificationsModal}
        onClose={() => setOpenNotificationsModal(false)}
        onOpenRoomForTournament={handleOpenRoomForId}
      />

      <PWAInstallModal
        isOpen={openPwaModal}
        onClose={() => setOpenPwaModal(false)}
      />

      {/* Standalone Wallet Modal Triggered from Header */}
      {openWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            <button
              onClick={() => setOpenWalletModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <WalletView initialTab={walletInitialTab} onClose={() => setOpenWalletModal(false)} />
          </div>
        </div>
      )}

      {/* Quiet, Human Editorial Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 text-xs text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-neutral-200">FF BATTLE ARENA</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>Mobile Esports Platform</span>
          </div>

          <div className="flex items-center gap-6 text-neutral-400">
            <span>Fair Play Policy</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>Anti-Cheat Guard</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span>Instant UPI Gateway</span>
          </div>

          <p className="text-neutral-400 text-[11px]">
            © {new Date().getFullYear()} FF Battle Arena. Free Fire is a trademark of Garena.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
