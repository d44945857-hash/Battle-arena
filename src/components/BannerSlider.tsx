import React from 'react';
import { ShieldCheck, Zap, Trophy, Flame, ChevronRight, Radio } from 'lucide-react';
import type { Announcement } from '../types/index.ts';

interface BannerSliderProps {
  announcements: Announcement[];
  onExploreClick: () => void;
  onOpenWallet: () => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  announcements,
  onExploreClick,
  onOpenWallet,
}) => {
  const activeAnnouncement = announcements[0] || {
    id: 'ann_def',
    title: '🔥 Season 14 Grand Championship Announced',
    content: 'Registration for the ₹50,000 Mega Championship begins this weekend.',
    badge: 'MAJOR EVENT',
    date: 'Today',
    active: true,
  };

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/60 shadow-2xl">
      {/* Background Graphic & Scrim */}
      <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
        <img
          src="/src/assets/images/ff_tournament_hero_1793320526416.jpg"
          alt="Free Fire Battle Arena Championship"
          className="h-full w-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Measured gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/60 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-10">
          {/* Metadata line without pills (clean unboxed text with separators) */}
          <div className="flex items-center gap-2 text-xs font-medium text-red-400 mb-2">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-red-400">
              <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
              Live Esports Arena
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-300">Daily Cash Cups</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-amber-400 font-semibold">Free & Paid Modes</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white max-w-2xl text-wrap-balance leading-tight drop-shadow-md">
            Dominate The Arena. Win Real Cash.
          </h1>

          <p className="mt-2 max-w-xl text-xs sm:text-sm text-neutral-300 leading-relaxed drop-shadow">
            Official Free Fire Battle Royale, Clash Squad, and Solo tournaments with verified custom room IDs, automated slot allocation, and instant UPI payouts.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreClick}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-900/40 transition-all hover:from-red-500 hover:to-orange-500 active:scale-95 whitespace-nowrap"
            >
              <Flame className="h-4 w-4" />
              Join Tournaments
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/90 px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-200 transition-colors hover:border-neutral-500 hover:bg-neutral-800 active:scale-95 whitespace-nowrap"
            >
              Add Money via UPI
            </button>
          </div>
        </div>
      </div>

      {/* Announcements ticker strip */}
      <div className="flex items-center border-t border-neutral-800/80 bg-neutral-950/90 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-500 shrink-0 mr-3">
          <Zap className="h-3.5 w-3.5" />
          <span>Notice</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee text-neutral-300 font-medium">
            <span className="text-amber-400 font-semibold mr-2">[{activeAnnouncement.badge}]</span>
            {activeAnnouncement.title} — {activeAnnouncement.content}
          </div>
        </div>
      </div>

      {/* Trust & Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-neutral-800/80 border-t border-neutral-800/80 bg-neutral-900/40 text-center">
        <div className="p-3 sm:p-4">
          <p className="text-lg sm:text-xl font-bold font-heading text-neutral-100 tabular-nums">100%</p>
          <p className="text-[11px] sm:text-xs text-neutral-400">Verified Custom Rooms</p>
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-lg sm:text-xl font-bold font-heading text-red-400 tabular-nums">₹5,00,000+</p>
          <p className="text-[11px] sm:text-xs text-neutral-400">Prize Pool Distributed</p>
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-lg sm:text-xl font-bold font-heading text-amber-400 tabular-nums">Instant</p>
          <p className="text-[11px] sm:text-xs text-neutral-400">24/7 UPI Withdrawals</p>
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-lg sm:text-xl font-bold font-heading text-emerald-400 tabular-nums">Anti-Cheat</p>
          <p className="text-[11px] sm:text-xs text-neutral-400">Hardware & Screen Lock</p>
        </div>
      </div>
    </div>
  );
};
