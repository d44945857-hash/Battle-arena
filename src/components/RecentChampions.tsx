import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Crosshair, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.ts';

interface WinnerRecord {
  tournamentId: string;
  tournamentTitle: string;
  map: string;
  mode: string;
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  ffUid: string;
  kills: number;
  prizeWon: number;
  matchDate: string;
}

interface RecentChampionsProps {
  onViewLeaderboard: () => void;
}

export const RecentChampions: React.FC<RecentChampionsProps> = ({ onViewLeaderboard }) => {
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await api.getRecentWinners();
        setWinners(res.winners || []);
      } catch (err) {
        console.error('Failed to load recent champions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWinners();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-center text-xs text-neutral-500">
        Loading recent champions...
      </div>
    );
  }

  if (winners.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* Clean unboxed metadata separator */}
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              Verified Hall of Fame
            </span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="text-neutral-400">Prizes Paid Out</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Recent Champions
          </h2>
        </div>

        <button
          onClick={onViewLeaderboard}
          className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <span>Full Leaderboard</span>
          <ArrowRight className="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>

      {/* Champions Showcase Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {winners.map((champ, idx) => {
          const isRank1 = champ.rank === 1;
          const isRank2 = champ.rank === 2;

          return (
            <div
              key={`${champ.tournamentId}_${champ.userId}_${idx}`}
              className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all hover:scale-[1.01] hover:shadow-xl ${
                isRank1
                  ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 via-neutral-900/90 to-neutral-950 shadow-amber-950/20'
                  : 'border-neutral-800 bg-neutral-900/70 hover:border-neutral-700'
              }`}
            >
              {/* Top Row: Tournament Title & Map */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-neutral-400 font-medium truncate max-w-[200px]">
                    <span className="text-red-400 font-semibold">{champ.mode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{champ.map}</span>
                  </div>

                  {/* Rank Badge */}
                  <div
                    className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                      isRank1
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md'
                        : isRank2
                        ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                        : 'bg-amber-950/60 text-amber-500 border border-amber-900/40'
                    }`}
                  >
                    <Trophy className="h-3 w-3" />
                    <span>#{champ.rank}</span>
                  </div>
                </div>

                {/* Champion Avatar & Profile */}
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={champ.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${champ.username}&backgroundColor=b91c1c`}
                      alt={champ.username}
                      className={`h-14 w-14 rounded-2xl bg-neutral-800 object-cover shadow-lg ${
                        isRank1
                          ? 'border-2 border-amber-400 ring-2 ring-amber-500/30'
                          : 'border-2 border-neutral-700'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    {isRank1 && (
                      <div className="absolute -top-2 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-black shadow-md">
                        <Crown className="h-3 w-3 fill-black" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-black text-white text-base truncate">
                      {champ.username}
                    </h3>
                    <p className="font-mono text-xs text-neutral-400 truncate">
                      UID: {champ.ffUid}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {champ.tournamentTitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Prize Won & Kills */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-neutral-400">
                  <Crosshair className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-semibold text-neutral-200 tabular-nums">
                    {champ.kills}
                  </span>
                  <span>kills</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mr-1.5">Won:</span>
                  <span className="font-heading font-black text-amber-400 text-base tabular-nums">
                    ₹{champ.prizeWon.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
