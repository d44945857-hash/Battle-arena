import React, { useState, useEffect } from 'react';
import { Crosshair, Clock, Key, Trophy, Users, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Tournament } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface MyMatchesViewProps {
  onViewRoom: (t: Tournament) => void;
  onExploreTournaments: () => void;
}

export const MyMatchesView: React.FC<MyMatchesViewProps> = ({ onViewRoom, onExploreTournaments }) => {
  const { user, refreshUser } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'completed'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTournaments();
      // Filter tournaments where the user is registered
      const myTourneys = res.tournaments.filter((t) => (t as any).isUserRegistered);
      setTournaments(myTourneys);
    } catch (err) {
      console.error('Failed to load my matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [user]);

  const handleLeaveTournament = async (t: Tournament) => {
    if (!confirm(`Are you sure you want to cancel your slot for "${t.title}"? Your entry fee will be refunded.`)) {
      return;
    }

    try {
      const res = await api.leaveTournament(t.id);
      if (res.success) {
        setActionMessage(res.message);
        setTimeout(() => setActionMessage(null), 4000);
        await refreshUser();
        await loadMatches();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration');
    }
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (filter === 'upcoming') {
      return t.status === 'upcoming' || t.status === 'live';
    }
    return t.status === 'completed';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-red-500">Player Match Center</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            My Registered Matches
          </h2>
        </div>

        {/* Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              filter === 'upcoming' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Active & Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              filter === 'completed' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Past History
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-800/80 bg-emerald-950/60 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Matches List */}
      {filteredTournaments.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-neutral-500 border border-neutral-800">
            <Crosshair className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold text-white">
              {filter === 'upcoming' ? 'No Active Tournament Registrations' : 'No Past Matches Recorded'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {filter === 'upcoming'
                ? 'Join upcoming Solo, Duo, or Squad tournaments to reserve your slot and win cash prizes.'
                : 'Completed tournament matches and kill scores will appear here.'}
            </p>
          </div>
          {filter === 'upcoming' && (
            <button
              onClick={onExploreTournaments}
              className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-red-950/40 hover:from-red-500 hover:to-orange-500 transition-all"
            >
              Browse Tournaments
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTournaments.map((t) => {
            const userSlot = (t as any).userSlot;
            const canViewRoom = Boolean(t.roomId && t.roomPass);
            const slotRecord = t.slots.find((s) => s.userId === user?.id);

            return (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl hover:border-neutral-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      {t.mode} · {t.map}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        t.status === 'live'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-500/50'
                          : t.status === 'upcoming'
                          ? 'bg-red-950/60 text-red-400 border-red-500/50'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {t.status === 'live' ? 'Match Live' : t.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">{t.title}</h3>
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 text-neutral-500" />
                      {new Date(t.matchTime).toLocaleString()}
                    </p>
                  </div>

                  {/* Slot & Credentials Banner */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Allocated Roster Slot:</span>
                      <span className="font-heading font-black text-emerald-400 text-sm">
                        SLOT #{userSlot || 'Assigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Prize Pool:</span>
                      <span className="font-bold text-amber-400 font-mono">₹{t.prizePool}</span>
                    </div>

                    {/* If completed, show player's result */}
                    {t.status === 'completed' && slotRecord && (
                      <div className="border-t border-neutral-800 pt-2 flex items-center justify-between font-bold">
                        <span className="text-neutral-300">
                          Result: Rank #{slotRecord.rank || 'N/A'} ({slotRecord.kills || 0} Kills)
                        </span>
                        <span className="text-amber-400 font-mono">
                          {slotRecord.prizeWon ? `₹${slotRecord.prizeWon} Won` : 'No Prize'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2">
                  {canViewRoom ? (
                    <button
                      onClick={() => onViewRoom(t)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-950/40 hover:bg-amber-400 transition-colors"
                    >
                      <Key className="h-4 w-4" />
                      View Room ID & Password
                    </button>
                  ) : t.status === 'upcoming' ? (
                    <>
                      <div className="flex-1 text-[11px] text-neutral-400">
                        Room opens 15m before kick-off
                      </div>
                      <button
                        onClick={() => handleLeaveTournament(t)}
                        className="rounded-xl border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors"
                      >
                        Cancel & Refund
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
