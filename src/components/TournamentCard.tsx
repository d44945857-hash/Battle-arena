import React, { useState } from 'react';
import { Trophy, Users, Clock, Key, ChevronDown, ChevronUp, Shield, Zap, CheckCircle2 } from 'lucide-react';
import type { Tournament } from '../types/index.ts';

interface TournamentCardProps {
  tournament: Tournament;
  onJoinClick: (tournament: Tournament) => void;
  onViewRoomClick: (tournament: Tournament) => void;
  onViewResultsClick: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onJoinClick,
  onViewRoomClick,
  onViewResultsClick,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const isFull = tournament.slotsFilled >= tournament.maxSlots;
  const isRegistered = Boolean((tournament as any).isUserRegistered);
  const userSlot = (tournament as any).userSlot;
  const canViewRoom = Boolean(tournament.roomId && tournament.roomPass);

  // Format date and time
  const matchDate = new Date(tournament.matchTime);
  const isToday = new Date().toDateString() === matchDate.toDateString();
  const timeFormatted = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = isToday ? `Today at ${timeFormatted}` : `${matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeFormatted}`;

  // Fill percentage
  const fillPercent = Math.min(100, Math.round((tournament.slotsFilled / tournament.maxSlots) * 100));

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/70 transition-all hover:border-neutral-700 hover:shadow-xl hover:shadow-red-950/20">
      <div>
        {/* Card Header & Banner */}
        <div className="relative h-40 w-full overflow-hidden bg-neutral-950">
          {tournament.bannerUrl ? (
            <img
              src={tournament.bannerUrl}
              alt={tournament.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img
              src="/src/assets/images/ff_tournament_hero_1793320526416.jpg"
              alt={tournament.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

          {/* Top Info Bar inside Banner */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 rounded-md bg-neutral-950/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              {tournament.status === 'live' && (
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  LIVE MATCH
                </span>
              )}
              {tournament.status === 'upcoming' && (
                <span className="text-red-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  UPCOMING
                </span>
              )}
              {tournament.status === 'completed' && (
                <span className="text-neutral-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  FINISHED
                </span>
              )}
            </div>

            {/* Match Type text */}
            <div className="rounded-md bg-neutral-950/85 px-2.5 py-1 text-[11px] font-bold text-neutral-200 uppercase tracking-wider backdrop-blur-sm">
              {tournament.matchType}
            </div>
          </div>

          {/* Bottom Banner Title Overlay */}
          <div className="absolute bottom-2.5 left-3 right-3">
            {/* Clean unboxed metadata with separators */}
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
              <span className="text-amber-400">{tournament.mode}</span>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-300">{tournament.map}</span>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-400">{tournament.version}</span>
            </div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-white truncate drop-shadow-sm mt-0.5">
              {tournament.title}
            </h2>
          </div>
        </div>

        {/* Card Body Key Metrics */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Prize Pool</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="font-heading text-lg font-extrabold text-amber-400 tabular-nums">
                  ₹{tournament.prizePool.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Entry Fee</p>
              <p className="font-heading text-lg font-extrabold text-white tabular-nums mt-0.5">
                {tournament.entryFee === 0 ? (
                  <span className="text-emerald-400">FREE ENTRY</span>
                ) : (
                  <span>₹{tournament.entryFee}</span>
                )}
              </p>
            </div>
          </div>

          {/* Slots & Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-neutral-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-neutral-400" />
                Slots: <span className="text-neutral-200 tabular-nums">{tournament.slotsFilled} / {tournament.maxSlots}</span>
              </span>
              <span className="text-neutral-400 tabular-nums font-mono text-[11px]">
                {tournament.maxSlots - tournament.slotsFilled} slots left
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className={`h-full transition-all duration-300 ${
                  fillPercent >= 90 ? 'bg-red-500' : 'bg-gradient-to-r from-red-600 to-amber-500'
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* Match Schedule */}
          <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800/60 pt-3">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              {dateFormatted}
            </span>
            {tournament.prizeBreakdown.perKill > 0 && (
              <span className="font-semibold text-red-400">
                +₹{tournament.prizeBreakdown.perKill}/Kill
              </span>
            )}
          </div>

          {/* Toggleable Details: Prize Breakdown & Rules */}
          {showDetails && (
            <div className="space-y-3 pt-3 border-t border-neutral-800/80 text-xs">
              <div>
                <p className="font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider text-[11px]">Prize Breakdown</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-neutral-950/80 p-2 border border-neutral-800/80">
                    <p className="text-[10px] text-amber-400 font-bold">1st Place</p>
                    <p className="font-bold text-white tabular-nums">₹{tournament.prizeBreakdown.rank1}</p>
                  </div>
                  <div className="rounded bg-neutral-950/80 p-2 border border-neutral-800/80">
                    <p className="text-[10px] text-neutral-400 font-bold">2nd Place</p>
                    <p className="font-bold text-white tabular-nums">₹{tournament.prizeBreakdown.rank2 || 0}</p>
                  </div>
                  <div className="rounded bg-neutral-950/80 p-2 border border-neutral-800/80">
                    <p className="text-[10px] text-amber-600 font-bold">3rd Place</p>
                    <p className="font-bold text-white tabular-nums">₹{tournament.prizeBreakdown.rank3 || 0}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold text-neutral-300 mb-1 uppercase tracking-wider text-[11px]">Tournament Rules</p>
                <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px]">
                  {tournament.rules.map((rule, idx) => (
                    <li key={idx} className="leading-snug">{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-0">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-center gap-1 py-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-3"
        >
          {showDetails ? (
            <>Hide Rules & Prizes <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>View Rules & Prizes <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>

        {/* Primary Action Button */}
        {tournament.status === 'completed' ? (
          <button
            onClick={() => onViewResultsClick(tournament)}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-800/90 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-700 active:scale-95"
          >
            View Match Results & Winners
          </button>
        ) : isRegistered ? (
          <div className="space-y-2">
            {canViewRoom ? (
              <button
                onClick={() => onViewRoomClick(tournament)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-950/30 transition-all hover:from-amber-500 hover:to-yellow-400 active:scale-95"
              >
                <Key className="h-4 w-4" />
                View Room ID & Password
              </button>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 py-2.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Joined · Slot #{userSlot || 'Assigned'} (Room opens 15m prior)
              </div>
            )}
          </div>
        ) : isFull ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600"
          >
            Tournament Full (Slots Filled)
          </button>
        ) : (
          <button
            onClick={() => onJoinClick(tournament)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition-all hover:from-red-500 hover:to-orange-500 active:scale-95"
          >
            <Zap className="h-4 w-4" />
            {tournament.entryFee === 0 ? 'Join Free Tournament' : `Join Match · ₹${tournament.entryFee}`}
          </button>
        )}
      </div>
    </div>
  );
};
