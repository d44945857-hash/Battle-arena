import React, { useState } from 'react';
import { X, User as UserIcon, Shield, Wallet, Trophy, Crosshair, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser, logout } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [ffUid, setFfUid] = useState(user?.ffUid || '');
  const [ffIgn, setFfIgn] = useState(user?.ffIgn || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const avatarSeeds = ['Viper', 'Ghost', 'Apex', 'Titan', 'Dragon', 'Ninja'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ffUid.trim() || !/^\d{8,11}$/.test(ffUid.trim())) {
      setErrorMsg('Free Fire UID must be 8 to 11 digits.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await api.updateProfile({
        username: username.trim(),
        ffUid: ffUid.trim(),
        ffIgn: ffIgn.trim(),
        avatar,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        await refreshUser();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const fallbackAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'Gamer'}&backgroundColor=b91c1c`;
  const effectiveAvatar = avatar || user?.avatar || fallbackAvatar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={effectiveAvatar}
              alt={user.username}
              className="h-14 w-14 rounded-xl bg-neutral-800 object-cover border-2 border-red-500 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-white">{user.username}</h3>
                {user.role === 'admin' && (
                  <span className="rounded bg-red-950 border border-red-800 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">
                    Admin
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-neutral-400">UID: {user.ffUid}</p>
              <p className="text-[11px] text-neutral-500">{user.email || user.phone}</p>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-500">Matches</p>
              <p className="font-heading text-base font-bold text-white tabular-nums">{user.matchesPlayed}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-red-400">Total Kills</p>
              <p className="font-heading text-base font-bold text-red-400 tabular-nums">{user.totalKills}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-400">Wins</p>
              <p className="font-heading text-base font-bold text-amber-400 tabular-nums">{user.matchesWon}</p>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-800/80 bg-red-950/60 p-3 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-800/80 bg-emerald-950/60 p-3 text-xs text-emerald-300">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Gamer profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-300">Select Esports Avatar</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {avatarSeeds.map((seed) => {
                  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=b91c1c`;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`h-10 w-10 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        avatar === url ? 'border-red-500 scale-105 shadow-md' : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={seed} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-300">Esports Display Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-300 flex justify-between">
                <span>Free Fire Player UID</span>
                <span className="text-[10px] text-neutral-500">8–11 Digits</span>
              </label>
              <input
                type="text"
                value={ffUid}
                onChange={(e) => setFfUid(e.target.value.replace(/\D/g, '').slice(0, 11))}
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 font-mono text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-300">In-Game Name (IGN)</label>
              <input
                type="text"
                value={ffIgn}
                onChange={(e) => setFfIgn(e.target.value)}
                placeholder="e.g. VIPER・99"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-2.5 font-bold uppercase text-white shadow-md hover:from-red-500 hover:to-orange-500 transition-all"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 font-semibold text-neutral-400 hover:text-white transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
