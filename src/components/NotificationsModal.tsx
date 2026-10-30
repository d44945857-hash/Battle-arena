import React from 'react';
import { X, Bell, Key, Trophy, Wallet, Zap, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoomForTournament?: (tourneyId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenRoomForTournament,
}) => {
  const { notifications, refreshNotifications, setActiveTab, setWalletInitialTab, setOpenWalletModal } = useAuth();

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    try {
      await api.markNotificationRead(notif.id);
      await refreshNotifications();

      if (notif.type === 'ROOM_CREDS' && notif.tournamentId && onOpenRoomForTournament) {
        onClose();
        onOpenRoomForTournament(notif.tournamentId);
      } else if (notif.type === 'WALLET' || notif.type === 'WINNER') {
        onClose();
        setWalletInitialTab('history');
        setOpenWalletModal(true);
      } else if (notif.type === 'MATCH_START') {
        onClose();
        setActiveTab('mymatches');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ROOM_CREDS':
        return <Key className="h-4 w-4 text-amber-400" />;
      case 'WINNER':
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case 'WALLET':
        return <Wallet className="h-4 w-4 text-emerald-400" />;
      default:
        return <Zap className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-red-500" />
            <h3 className="font-heading text-lg font-bold text-white">Notifications Center</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
            <button onClick={onClose} className="text-neutral-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-xs transition-colors cursor-pointer ${
                  notif.read
                    ? 'border-neutral-800/60 bg-neutral-900/40 opacity-75 hover:opacity-100'
                    : 'border-red-900/40 bg-neutral-900/80 shadow-sm hover:border-red-500/50'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-950 border border-neutral-800">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold ${notif.read ? 'text-neutral-300' : 'text-white'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-neutral-500 pt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
