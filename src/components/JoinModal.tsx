import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Shield, Wallet, Users, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Tournament } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface JoinModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ tournament, onClose, onSuccess }) => {
  const { user, refreshUser, setOpenWalletModal, setWalletInitialTab, setOpenAuthModal } = useAuth();

  const [ffUid, setFfUid] = useState(user?.ffUid || '');
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [joinedSlot, setJoinedSlot] = useState<number | null>(null);

  if (!tournament) return null;

  const totalBalance = (user?.depositBalance || 0) + (user?.winningBalance || 0);
  const hasEnoughBalance = tournament.entryFee === 0 || totalBalance >= tournament.entryFee;
  const isMultiplayer = tournament.mode === 'Duo' || tournament.mode === 'Squad';

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setOpenAuthModal(true);
      return;
    }

    const trimmedUid = ffUid.trim();
    if (!trimmedUid || !/^\d{8,11}$/.test(trimmedUid)) {
      setErrorMsg('Please enter a valid 8 to 11 digit Free Fire Player UID.');
      return;
    }

    if (!hasEnoughBalance) {
      setErrorMsg(`Insufficient funds! Need ₹${tournament.entryFee - totalBalance} more to join.`);
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await api.joinTournament(tournament.id, {
        ffUid: trimmedUid,
        teamName: teamName.trim() || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setJoinedSlot(res.slotNumber);
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f97316', '#eab308'],
        });
        await refreshUser();
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join tournament. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {joinedSlot ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
              <CheckCircle className="h-9 w-9" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-black text-white">Slot Confirmed!</h2>
              <p className="text-sm text-neutral-300 mt-1">
                You are registered for <span className="text-white font-semibold">{tournament.title}</span>
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Assigned Slot:</span>
                <span className="font-heading font-extrabold text-amber-400 text-lg">#{joinedSlot}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Free Fire UID:</span>
                <span className="font-mono text-neutral-200">{ffUid}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">Room Details:</span>
                <span className="text-emerald-400 text-xs font-semibold">Will unlock 15m prior in My Matches</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/40 hover:from-red-500 hover:to-orange-500 transition-all"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
                {tournament.mode} · {tournament.map}
              </span>
              <h2 className="font-heading text-xl font-bold text-white mt-0.5">
                {tournament.title}
              </h2>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-red-800/80 bg-red-950/60 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            {/* Free Fire Player UID input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span>Free Fire Player UID (In-Game)</span>
                <span className="text-[10px] text-neutral-500">8–11 Digits</span>
              </label>
              <input
                type="text"
                value={ffUid}
                onChange={(e) => setFfUid(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="e.g. 784920152"
                required
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm font-mono text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
              />
              <p className="text-[11px] text-neutral-400">
                Ensure this matches your actual in-game UID so admin can verify kill scores.
              </p>
            </div>

            {/* Team Name for Duo / Squad */}
            {isMultiplayer && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Squad / Team Name (Optional)
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Toxic Strikers"
                  maxLength={30}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            )}

            {/* Financial summary & Wallet deduction */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-neutral-300">
                <span>Tournament Entry Fee:</span>
                <span className="font-bold font-mono text-white">
                  {tournament.entryFee === 0 ? 'FREE (₹0)' : `₹${tournament.entryFee}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span className="flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-amber-500" />
                  Your Wallet Balance:
                </span>
                <span className="font-mono tabular-nums text-neutral-200">
                  ₹{totalBalance.toLocaleString()}
                </span>
              </div>

              {!hasEnoughBalance && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-amber-400">
                  <span>Balance required: ₹{tournament.entryFee - totalBalance}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setWalletInitialTab('deposit');
                      setOpenWalletModal(true);
                    }}
                    className="font-bold underline text-red-400 hover:text-red-300"
                  >
                    + Add Money via UPI
                  </button>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !hasEnoughBalance}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all ${
                hasEnoughBalance && !isSubmitting
                  ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-red-950/40 hover:from-red-500 hover:to-orange-500 active:scale-95'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Zap className="h-4 w-4" />
              {isSubmitting ? 'Booking Slot...' : hasEnoughBalance ? 'Confirm & Book Slot' : 'Insufficient Balance'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
