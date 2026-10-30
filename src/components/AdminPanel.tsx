import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Users,
  Trophy,
  Wallet,
  Clock,
  Trash2,
  Edit2,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  RefreshCw,
  Send,
  Ban,
  Check
} from 'lucide-react';
import type { Tournament, User, WithdrawalRequest } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tournaments' | 'results' | 'withdrawals' | 'users' | 'broadcast'>('tournaments');

  // Stats
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalTournaments: 0,
    activeMatches: 0,
    completedMatches: 0,
    pendingWithdrawals: 0,
    totalPrizeDistributed: 0,
    totalRevenue: 0,
  });

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tournament creation modal / form state
  const [isCreatingTourney, setIsCreatingTourney] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMode, setNewMode] = useState<any>('Battle Royale');
  const [newMap, setNewMap] = useState<any>('Bermuda');
  const [newEntryFee, setNewEntryFee] = useState<number>(50);
  const [newPrizePool, setNewPrizePool] = useState<number>(2000);
  const [newMaxSlots, setNewMaxSlots] = useState<number>(48);
  const [newPerKill, setNewPerKill] = useState<number>(15);
  const [newMatchTime, setNewMatchTime] = useState<string>('');

  // Room Credentials modal
  const [editingTourney, setEditingTourney] = useState<Tournament | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');
  const [roomRevealedInput, setRoomRevealedInput] = useState(false);

  // Upload results state
  const [selectedTourneyForResults, setSelectedTourneyForResults] = useState<Tournament | null>(null);
  const [slotResults, setSlotResults] = useState<{ [slotNumber: number]: { rank: number; kills: number } }>({});

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, tourneyRes, usersRes, withRes] = await Promise.all([
        api.getAdminOverview(),
        api.getTournaments(),
        api.getAdminUsers(),
        api.getAdminWithdrawals(),
      ]);
      setStats(statsRes);
      setTournaments(tourneyRes.tournaments || []);
      setUsersList(usersRes.users || []);
      setWithdrawals(withRes.withdrawals || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsLoading(true);
    setMessage(null);

    const matchDate = newMatchTime ? new Date(newMatchTime).toISOString() : new Date(Date.now() + 60 * 60000).toISOString();

    try {
      const res = await api.createTournament({
        title: newTitle.trim(),
        mode: newMode,
        map: newMap,
        entryFee: Number(newEntryFee),
        prizePool: Number(newPrizePool),
        maxSlots: Number(newMaxSlots),
        perKillPrize: Number(newPerKill),
        matchTime: matchDate,
      });

      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: `Tournament "${newTitle}" created successfully!` });
        setIsCreatingTourney(false);
        setNewTitle('');
        await loadAllAdminData();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Creation failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTourney = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? Any paid entry fees will be refunded immediately.`)) return;

    try {
      const res = await api.deleteTournament(id);
      if (res.success) {
        setMessage({ type: 'success', text: `Tournament deleted and refunded.` });
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete tournament');
    }
  };

  const handleSaveRoomCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTourney) return;

    try {
      const res = await api.updateTournament(editingTourney.id, {
        roomId: roomIdInput.trim(),
        roomPass: roomPassInput.trim(),
        roomRevealed: roomRevealedInput,
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Room details updated! Notifications pushed to registered gamers.` });
        setEditingTourney(null);
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update credentials');
    }
  };

  const handleUploadResults = async () => {
    if (!selectedTourneyForResults) return;

    const payload = Object.entries(slotResults).map(([slotNum, val]) => ({
      slotNumber: Number(slotNum),
      rank: Number(val.rank),
      kills: Number(val.kills),
    }));

    if (payload.length === 0) {
      alert('Please fill results for at least one registered player.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.uploadResults(selectedTourneyForResults.id, payload);
      if (res.success) {
        setMessage({ type: 'success', text: 'Match scores & kills recorded! You can now verify and distribute prize money.' });
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save results');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistributePrizes = async (tourneyId: string) => {
    if (!confirm('Are you sure you want to approve and credit prize money directly into winners wallets?')) return;

    try {
      setIsLoading(true);
      const res = await api.distributePrizes(tourneyId);
      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to distribute prizes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawalAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    const remarks = prompt(action === 'APPROVE' ? 'Enter Bank IMPS Ref / UTR (Optional):' : 'Enter rejection reason:');
    try {
      setIsLoading(true);
      const res = await api.handleWithdrawal(id, action, remarks || undefined);
      if (res.success) {
        setMessage({ type: 'success', text: `Withdrawal request ${action.toLowerCase()}d.` });
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await api.toggleBlockUser(userId);
      if (res.success) {
        setMessage({ type: 'success', text: `Player status updated to ${res.user.status}.` });
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      setIsLoading(true);
      const res = await api.broadcastNotification(broadcastTitle, broadcastMessage);
      if (res.success) {
        setMessage({ type: 'success', text: 'Broadcast notification dispatched to all gamers!' });
        setBroadcastTitle('');
        setBroadcastMessage('');
      }
    } catch (err: any) {
      alert(err.message || 'Broadcast failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/20 border border-red-500/50 text-red-500">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Command Center</span>
            <h2 className="font-heading text-2xl font-black text-white uppercase tracking-tight">
              Arena Administrator Console
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllAdminData}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreatingTourney(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:from-red-500 hover:to-orange-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Tournament
          </button>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Total Gamers</p>
          <p className="font-heading text-2xl font-black text-white tabular-nums mt-0.5">{stats.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Total Tournaments</p>
          <p className="font-heading text-2xl font-black text-white tabular-nums mt-0.5">{stats.totalTournaments}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-500">Pending Cashouts</p>
          <p className="font-heading text-2xl font-black text-amber-400 tabular-nums mt-0.5">{stats.pendingWithdrawals}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">Prize Distributed</p>
          <p className="font-heading text-2xl font-black text-emerald-400 tabular-nums mt-0.5">₹{stats.totalPrizeDistributed.toLocaleString()}</p>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2.5 rounded-xl border p-4 text-xs font-medium ${
            message.type === 'success'
              ? 'border-emerald-800/80 bg-emerald-950/50 text-emerald-300'
              : 'border-red-800/80 bg-red-950/50 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{message.text}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-xl border border-neutral-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'tournaments' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Tournaments & Rooms ({tournaments.length})
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'results' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Upload Results & Winners
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'withdrawals' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Withdrawals ({withdrawals.filter(w => w.status === 'PENDING').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'users' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Player Anti-Fraud ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'broadcast' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Broadcast Alert
        </button>
      </div>

      {/* TAB 1: TOURNAMENTS & ROOMS */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          <div className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-xl">
            {tournaments.map((t) => (
              <div key={t.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-amber-400">{t.mode}</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="text-neutral-300">{t.map}</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="text-emerald-400">₹{t.prizePool} Prize</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="text-neutral-400">Entry: {t.entryFee === 0 ? 'FREE' : `₹${t.entryFee}`}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">{t.title}</h3>
                  <p className="text-xs text-neutral-400">
                    Slots: <strong className="text-white">{t.slotsFilled}/{t.maxSlots}</strong> · Match:{' '}
                    {new Date(t.matchTime).toLocaleString()} · Status: <span className="uppercase text-amber-400 font-bold">{t.status}</span>
                  </p>
                  {t.roomId && (
                    <p className="font-mono text-xs text-amber-400">
                      Room ID: {t.roomId} | Pass: {t.roomPass} | {t.roomRevealed ? 'REVEALED TO PLAYERS' : 'HIDDEN'}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingTourney(t);
                      setRoomIdInput(t.roomId || '');
                      setRoomPassInput(t.roomPass || '');
                      setRoomRevealedInput(t.roomRevealed || false);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-amber-500/50 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-950/60 transition-colors"
                  >
                    <Key className="h-3.5 w-3.5" />
                    Room ID & Pass
                  </button>

                  <button
                    onClick={() => handleDeleteTourney(t.id, t.title)}
                    className="flex items-center gap-1 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete & Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD RESULTS & WINNERS */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white">Select Tournament to Upload Results</h3>
            <select
              value={selectedTourneyForResults?.id || ''}
              onChange={(e) => {
                const tourney = tournaments.find((t) => t.id === e.target.value) || null;
                setSelectedTourneyForResults(tourney);
                if (tourney) {
                  const initial: any = {};
                  tourney.slots.forEach((s) => {
                    initial[s.slotNumber] = {
                      rank: s.rank || s.slotNumber,
                      kills: s.kills || 0,
                    };
                  });
                  setSlotResults(initial);
                }
              }}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">-- Choose Tournament --</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.mode} · {t.slotsFilled} Players)
                </option>
              ))}
            </select>
          </div>

          {selectedTourneyForResults && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-base font-bold text-white">
                    {selectedTourneyForResults.title}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Prize Breakdown: 1st: ₹{selectedTourneyForResults.prizeBreakdown.rank1} · 2nd: ₹{selectedTourneyForResults.prizeBreakdown.rank2 || 0} · 3rd: ₹{selectedTourneyForResults.prizeBreakdown.rank3 || 0} · +₹{selectedTourneyForResults.prizeBreakdown.perKill}/Kill
                  </p>
                </div>

                {selectedTourneyForResults.resultsDeclared && (
                  <button
                    onClick={() => handleDistributePrizes(selectedTourneyForResults.id)}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
                  >
                    Credit Winner Wallets
                  </button>
                )}
              </div>

              {selectedTourneyForResults.slots.length === 0 ? (
                <div className="text-xs text-neutral-400 p-4 text-center">
                  No registered players in this tournament yet.
                </div>
              ) : (
                <div className="space-y-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-3">Slot #</th>
                        <th className="py-2.5 px-3">Player Name</th>
                        <th className="py-2.5 px-3">Free Fire UID</th>
                        <th className="py-2.5 px-3 text-center">Rank</th>
                        <th className="py-2.5 px-3 text-center">Kills</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-neutral-200">
                      {selectedTourneyForResults.slots.map((s) => (
                        <tr key={s.slotNumber} className="hover:bg-neutral-800/40">
                          <td className="py-3 px-3 font-bold font-mono text-amber-400">#{s.slotNumber}</td>
                          <td className="py-3 px-3 font-semibold">{s.username}</td>
                          <td className="py-3 px-3 font-mono text-neutral-400">{s.ffUid}</td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={slotResults[s.slotNumber]?.rank || ''}
                              onChange={(e) =>
                                setSlotResults({
                                  ...slotResults,
                                  [s.slotNumber]: {
                                    ...slotResults[s.slotNumber],
                                    rank: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-16 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-center font-bold text-white"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={slotResults[s.slotNumber]?.kills || ''}
                              onChange={(e) =>
                                setSlotResults({
                                  ...slotResults,
                                  [s.slotNumber]: {
                                    ...slotResults[s.slotNumber],
                                    kills: Number(e.target.value),
                                  },
                                })
                              }
                              className="w-16 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-center font-bold text-red-400"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    onClick={handleUploadResults}
                    className="w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500 transition-colors"
                  >
                    Save Match Results & Declare Outcome
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WITHDRAWALS */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-white">Player UPI Withdrawal Requests</h3>
          <div className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">No withdrawal requests found.</div>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-base font-extrabold text-amber-400 tabular-nums">₹{w.amount}</span>
                      <span className="text-white font-semibold">{w.username}</span>
                      <span className="text-neutral-400">({w.upiId})</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Requested: {new Date(w.requestedAt).toLocaleString()}
                      {w.adminRemarks && ` · Remarks: ${w.adminRemarks}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {w.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'APPROVE')}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve & Dispatched
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                          className="flex items-center gap-1 rounded-lg bg-red-950/60 border border-red-800/80 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-900/60"
                        >
                          <Ban className="h-3.5 w-3.5" /> Reject (Refund)
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          w.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {w.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ANTI-FRAUD */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-bold text-white">Registered Player Accounts & Anti-Cheat Management</h3>
          <div className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
            {usersList.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}&backgroundColor=b91c1c`}
                    alt={u.username}
                    className="h-9 w-9 rounded-lg bg-neutral-800 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{u.username}</span>
                      <span className="font-mono text-neutral-400">UID: {u.ffUid}</span>
                      {u.role === 'admin' && (
                        <span className="rounded bg-red-950/80 border border-red-800/50 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Phone: {u.phone} · Deposit: ₹{u.depositBalance} · Winnings: ₹{u.winningBalance} · Kills: {u.totalKills}
                    </p>
                  </div>
                </div>

                <div>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleBlock(u.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                        u.status === 'blocked'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-950/80 border border-red-800/80 text-red-400 hover:bg-red-900/60'
                      }`}
                    >
                      {u.status === 'blocked' ? 'Unban Account' : 'Suspend / Ban'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Broadcast Esports Notification</h3>
            <p className="text-xs text-neutral-400">Send high-priority alert to all connected gamers.</p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Notification Title</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Server Maintenance or Flash Cash Cup!"
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Alert Message</label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your announcement..."
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-500 transition-colors w-full"
            >
              <Send className="h-4 w-4" />
              Send Global Broadcast
            </button>
          </form>
        </div>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      {isCreatingTourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-heading text-lg font-bold text-white">Create New Tournament</h3>
              <button onClick={() => setIsCreatingTourney(false)} className="text-neutral-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4 pt-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-300">Tournament Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Bermuda Friday Solo Cup #500"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-300">Match Mode</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white"
                  >
                    <option value="Battle Royale">Battle Royale</option>
                    <option value="Clash Squad">Clash Squad</option>
                    <option value="Solo">Solo</option>
                    <option value="Duo">Duo</option>
                    <option value="Squad">Squad</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-300">Map</label>
                  <select
                    value={newMap}
                    onChange={(e) => setNewMap(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="Nexterra">Nexterra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-300">Entry Fee (₹, 0 for free)</label>
                  <input
                    type="number"
                    min="0"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-300">Prize Pool (₹)</label>
                  <input
                    type="number"
                    min="10"
                    value={newPrizePool}
                    onChange={(e) => setNewPrizePool(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-300">Max Slots</label>
                  <input
                    type="number"
                    min="4"
                    max="100"
                    value={newMaxSlots}
                    onChange={(e) => setNewMaxSlots(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-300">Per Kill Bounty (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPerKill}
                    onChange={(e) => setNewPerKill(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-300">Scheduled Kick-off Date & Time</label>
                <input
                  type="datetime-local"
                  value={newMatchTime}
                  onChange={(e) => setNewMatchTime(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 font-bold uppercase text-white shadow-lg hover:from-red-500 hover:to-orange-500 transition-all mt-2"
              >
                Publish Tournament
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROOM CREDENTIALS MODAL */}
      {editingTourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-heading text-lg font-bold text-white">Custom Room Manager</h3>
              <button onClick={() => setEditingTourney(null)} className="text-neutral-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoomCredentials} className="space-y-4 pt-4 text-xs">
              <p className="text-neutral-400">
                Updating credentials will automatically notify all registered players.
              </p>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-300">Free Fire Custom Room ID</label>
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="e.g. 849201"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-300">Room Password</label>
                <input
                  type="text"
                  value={roomPassInput}
                  onChange={(e) => setRoomPassInput(e.target.value)}
                  placeholder="e.g. 7788"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="revealCheck"
                  checked={roomRevealedInput}
                  onChange={(e) => setRoomRevealedInput(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="revealCheck" className="font-semibold text-white">
                  Unlock and Reveal Room ID & Password to registered participants now
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 py-3 font-bold uppercase text-black hover:bg-amber-400 transition-colors mt-2"
              >
                Save & Broadcast Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
