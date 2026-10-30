import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Flame, Crosshair, Award, Crown, CheckCircle2 } from 'lucide-react';
import type { LeaderboardPlayer } from '../types/index.ts';
import { api } from '../services/api.ts';

export const LeaderboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overall' | 'hallOfFame'>('overall');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [lbRes, winnersRes] = await Promise.all([
          api.getLeaderboard(),
          api.getRecentWinners(),
        ]);
        setPlayers(lbRes.leaderboard || []);
        setWinners(winnersRes.winners || []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const top3 = players.slice(0, 3);
  const remaining = players.slice(3);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Grandmaster':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/50';
      case 'Master':
        return 'text-red-400 bg-red-950/40 border-red-500/50';
      case 'Heroic':
        return 'text-purple-400 bg-purple-950/40 border-purple-500/50';
      default:
        return 'text-blue-400 bg-blue-950/40 border-blue-500/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Trophy Art */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            {/* Clean unboxed text with separator */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
              <span>Season 14 Champions</span>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-400">Official Leaderboard</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Elite Hall of Champions
            </h2>
            <p className="max-w-md text-xs text-neutral-400 leading-relaxed">
              Real-time rankings based on total verified tournament winnings, kill bounties, and battle royale victories.
            </p>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setActiveTab('overall')}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'overall'
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/30'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                Top Earners
              </button>
              <button
                onClick={() => setActiveTab('hallOfFame')}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'hallOfFame'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                Recent Match Winners
              </button>
            </div>
          </div>

          {/* Trophy Graphic */}
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-amber-500/30 bg-neutral-950 shadow-2xl">
            <img
              src="/src/assets/images/ff_trophy_cup_1793320528359.jpg"
              alt="Tournament Champions Trophy"
              className="h-full w-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent" />
          </div>
        </div>
      </div>

      {activeTab === 'overall' ? (
        <div className="space-y-6">
          {/* Podium for Top 3 */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* Rank 2 */}
              {top3[1] && (
                <div className="order-2 sm:order-1 flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-center relative group hover:border-neutral-700 transition-all">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neutral-800 px-3 py-0.5 text-xs font-bold text-neutral-300 border border-neutral-700">
                    #2 Runner Up
                  </div>
                  <div className="space-y-2 mt-2">
                    <img
                      src={top3[1].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[1].username}&backgroundColor=b91c1c`}
                      alt={top3[1].username}
                      className="mx-auto h-16 w-16 rounded-xl bg-neutral-800 object-cover border-2 border-neutral-700 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <h3 className="font-heading font-bold text-white text-base truncate">{top3[1].username}</h3>
                    <p className="font-mono text-xs text-neutral-400">UID: {top3[1].ffUid}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(top3[1].tier)}`}>
                      {top3[1].tier}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-800/80">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Winnings</p>
                    <p className="font-heading text-xl font-black text-amber-400 tabular-nums">
                      ₹{top3[1].totalWinnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 tabular-nums">
                      {top3[1].totalKills} Kills · {top3[1].matchesWon} Wins
                    </p>
                  </div>
                </div>
              )}

              {/* Rank 1 (Grand Champion) */}
              {top3[0] && (
                <div className="order-1 sm:order-2 flex flex-col justify-between rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-950/20 via-neutral-900/90 to-neutral-950 p-6 text-center relative shadow-2xl shadow-amber-950/20 transform sm:-translate-y-2">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-1 text-xs font-black text-black shadow-lg">
                    <Crown className="h-3.5 w-3.5 fill-black" /> #1 Champion
                  </div>
                  <div className="space-y-2 mt-2">
                    <img
                      src={top3[0].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[0].username}&backgroundColor=b91c1c`}
                      alt={top3[0].username}
                      className="mx-auto h-20 w-20 rounded-2xl bg-neutral-800 object-cover border-2 border-amber-400 shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                    <h3 className="font-heading font-black text-white text-lg truncate">{top3[0].username}</h3>
                    <p className="font-mono text-xs text-neutral-300">UID: {top3[0].ffUid}</p>
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTierColor(top3[0].tier)}`}>
                      {top3[0].tier}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-amber-900/40">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Total Cash Won</p>
                    <p className="font-heading text-2xl font-black text-amber-400 tabular-nums">
                      ₹{top3[0].totalWinnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-300 mt-1 tabular-nums font-semibold">
                      {top3[0].totalKills} Kills · {top3[0].matchesWon} Wins ({top3[0].winRate}% Win Rate)
                    </p>
                  </div>
                </div>
              )}

              {/* Rank 3 */}
              {top3[2] && (
                <div className="order-3 flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-center relative group hover:border-neutral-700 transition-all">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neutral-800 px-3 py-0.5 text-xs font-bold text-amber-600 border border-neutral-700">
                    #3 2nd Runner Up
                  </div>
                  <div className="space-y-2 mt-2">
                    <img
                      src={top3[2].avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[2].username}&backgroundColor=b91c1c`}
                      alt={top3[2].username}
                      className="mx-auto h-16 w-16 rounded-xl bg-neutral-800 object-cover border-2 border-neutral-700 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <h3 className="font-heading font-bold text-white text-base truncate">{top3[2].username}</h3>
                    <p className="font-mono text-xs text-neutral-400">UID: {top3[2].ffUid}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(top3[2].tier)}`}>
                      {top3[2].tier}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-800/80">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Winnings</p>
                    <p className="font-heading text-xl font-black text-amber-400 tabular-nums">
                      ₹{top3[2].totalWinnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 tabular-nums">
                      {top3[2].totalKills} Kills · {top3[2].matchesWon} Wins
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-neutral-800">
              <h3 className="font-heading text-base font-bold text-white">Full Esports Rankings</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/80 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Gamer Profile</th>
                    <th className="py-3 px-4">Free Fire UID</th>
                    <th className="py-3 px-4 text-center">Tier</th>
                    <th className="py-3 px-4 text-right">Kills</th>
                    <th className="py-3 px-4 text-right">Wins</th>
                    <th className="py-3 px-4 text-right">Total Winnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {players.map((player) => (
                    <tr key={player.userId} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-heading font-black tabular-nums text-sm">
                        {player.rank === 1 && <span className="text-amber-400 font-bold">🥇 #1</span>}
                        {player.rank === 2 && <span className="text-neutral-300 font-bold">🥈 #2</span>}
                        {player.rank === 3 && <span className="text-amber-600 font-bold">🥉 #3</span>}
                        {player.rank > 3 && <span className="text-neutral-400">#{player.rank}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}&backgroundColor=b91c1c`}
                            alt={player.username}
                            className="h-7 w-7 rounded-md bg-neutral-800 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-semibold text-white">{player.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400">{player.ffUid}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getTierColor(player.tier)}`}>
                          {player.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-red-400 font-semibold">
                        {player.totalKills}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-300">
                        {player.matchesWon}
                      </td>
                      <td className="py-3.5 px-4 text-right font-heading font-black tabular-nums text-amber-400 text-sm">
                        ₹{player.totalWinnings.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Hall of Fame: Past Tournament Winners */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white">Verified Tournament Results & Winners</h3>
            <span className="text-xs text-neutral-400">Admin Verified & Credited</span>
          </div>

          {winners.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center text-xs text-neutral-500">
              No tournament results declared yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {winners.map((win, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                        {win.mode} · {win.map}
                      </span>
                      <h4 className="font-heading text-base font-bold text-white mt-0.5">{win.tournamentTitle}</h4>
                      <p className="text-[11px] text-neutral-500">Played: {new Date(win.matchDate).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 text-xs font-black text-amber-400">
                      <Trophy className="h-3 w-3" />
                      Rank #{win.rank}
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{win.username}</p>
                      <p className="font-mono text-[11px] text-neutral-400">UID: {win.ffUid}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-neutral-500">{win.kills} Kills</p>
                      <p className="font-heading font-black text-amber-400 text-sm tabular-nums">
                        ₹{win.prizeWon.toLocaleString()} Won
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Prize credited to winner's wallet
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
