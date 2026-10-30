import React from 'react';
import { Filter, Sparkles, Swords, MapPin } from 'lucide-react';
import type { TournamentMode } from '../types/index.ts';

interface TournamentFilterProps {
  status: string;
  setStatus: (s: string) => void;
  mode: string;
  setMode: (m: string) => void;
  feeType: string;
  setFeeType: (f: string) => void;
  map: string;
  setMap: (m: string) => void;
  totalCount: number;
}

export const TournamentFilter: React.FC<TournamentFilterProps> = ({
  status,
  setStatus,
  mode,
  setMode,
  feeType,
  setFeeType,
  map,
  setMap,
  totalCount,
}) => {
  const modes: ('all' | TournamentMode)[] = ['all', 'Battle Royale', 'Clash Squad', 'Solo', 'Duo', 'Squad'];
  const maps = ['all', 'Bermuda', 'Purgatory', 'Kalahari'];

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4">
      {/* Primary Status Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-neutral-950/80 rounded-lg border border-neutral-800/80 overflow-x-auto max-w-full">
          <button
            onClick={() => setStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              status === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Tournaments
          </button>
          <button
            onClick={() => setStatus('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              status === 'upcoming'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setStatus('live')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              status === 'live'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Live Now
          </button>
          <button
            onClick={() => setStatus('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              status === 'completed'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Fee Type Toggle */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950/80 rounded-lg border border-neutral-800/80">
          <button
            onClick={() => setFeeType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              feeType === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Fees
          </button>
          <button
            onClick={() => setFeeType('free')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              feeType === 'free' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Free Entry
          </button>
          <button
            onClick={() => setFeeType('paid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              feeType === 'paid' ? 'bg-red-950/80 text-red-300 border border-red-800/40' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Paid Tourneys
          </button>
        </div>
      </div>

      {/* Modes & Maps Secondary Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1 shrink-0">
            <Swords className="h-3 w-3" /> Mode:
          </span>
          {modes.map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap shrink-0 ${
                mode === m
                  ? 'bg-neutral-800 text-red-400 border border-neutral-700'
                  : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
              }`}
            >
              {m === 'all' ? 'All Modes' : m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1 shrink-0">
            <MapPin className="h-3 w-3" /> Map:
          </span>
          <select
            value={map}
            onChange={(e) => setMap(e.target.value)}
            className="rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs font-medium text-neutral-300 focus:outline-none focus:border-red-500"
          >
            {maps.map(mp => (
              <option key={mp} value={mp}>
                {mp === 'all' ? 'All Maps' : mp}
              </option>
            ))}
          </select>
          <span className="text-xs text-neutral-500 tabular-nums ml-2">
            ({totalCount} matches)
          </span>
        </div>
      </div>
    </div>
  );
};
