import React, { useState } from 'react';
import { X, Copy, Check, Key, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { Tournament } from '../types/index.ts';

interface RoomCredentialsModalProps {
  tournament: Tournament | null;
  onClose: () => void;
}

export const RoomCredentialsModal: React.FC<RoomCredentialsModalProps> = ({ tournament, onClose }) => {
  const [copiedField, setCopiedField] = useState<'id' | 'pass' | null>(null);

  if (!tournament) return null;

  const roomId = tournament.roomId || 'PENDING';
  const roomPass = tournament.roomPass || 'PENDING';
  const userSlot = (tournament as any).userSlot || 'Check Roster';

  const handleCopy = (text: string, field: 'id' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <Key className="h-4 w-4" />
            Official Custom Room Lobby
          </div>

          <h2 className="font-heading text-xl font-bold text-white">
            {tournament.title}
          </h2>

          {/* Credentials Display Card */}
          <div className="rounded-xl border border-amber-500/40 bg-neutral-900/90 p-4 space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Custom Room ID</p>
                <p className="font-mono text-2xl font-black text-amber-400 tracking-wider mt-0.5">{roomId}</p>
              </div>
              <button
                onClick={() => handleCopy(roomId, 'id')}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                {copiedField === 'id' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-neutral-400" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-neutral-800 pt-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Room Password</p>
                <p className="font-mono text-2xl font-black text-white tracking-wider mt-0.5">{roomPass}</p>
              </div>
              <button
                onClick={() => handleCopy(roomPass, 'pass')}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                {copiedField === 'pass' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-neutral-400" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-neutral-800 pt-3 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Your Allocated Slot:</span>
              <span className="font-heading font-black text-emerald-400 text-sm">
                SLOT #{userSlot}
              </span>
            </div>
          </div>

          {/* Step-by-Step Join Instructions */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3.5 text-xs text-neutral-300 space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              How to Join in Free Fire Mobile:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed">
              <li>Launch Free Fire on your mobile device.</li>
              <li>Tap Mode Selection (Battle Royale) &gt; Select <strong className="text-neutral-200">Custom</strong>.</li>
              <li>Tap Search, paste Room ID <strong className="text-amber-400">{roomId}</strong> and enter Password <strong className="text-white">{roomPass}</strong>.</li>
              <li>Sit directly in your designated <strong className="text-emerald-400">Slot #{userSlot}</strong>.</li>
              <li>Do not leave your slot. Match starts precisely at scheduled time.</li>
            </ol>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-900/40 p-2.5 text-[11px] text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>Sharing Room ID or Password with non-registered players will result in account ban.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-700 transition-colors"
          >
            Close Lobby Card
          </button>
        </div>
      </div>
    </div>
  );
};
