import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import type { Transaction, WithdrawalRequest } from '../types/index.ts';

interface WalletViewProps {
  initialTab?: 'deposit' | 'withdraw' | 'history';
  onClose?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ initialTab = 'deposit', onClose }) => {
  const { user, refreshUser } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'deposit' | 'withdraw' | 'history'>(initialTab);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [upiReference, setUpiReference] = useState<string>('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('PhonePe');

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank'>('upi');

  // Transactions & Withdrawals
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const officialUpiVpa = 'ffbattlearena@esports';

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWallet();
      setTransactions(data.transactions || []);
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const totalBalance = (user?.depositBalance || 0) + (user?.winningBalance || 0);

  // Quick deposit chips
  const depositChips = [10, 20, 30, 50, 100, 200, 500, 1000];

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customAmount) || depositAmount;
    if (amount < 10) {
      setStatusMessage({ type: 'error', text: 'Minimum deposit amount is ₹10.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.deposit({
        amount,
        upiReference: upiReference.trim() || `UPI${Date.now().toString().slice(-8)}`,
        paymentMethod: selectedUpiApp,
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setStatusMessage({ type: 'success', text: `₹${amount} deposited successfully into your wallet!` });
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#eab308', '#ef4444'],
        });
        setUpiReference('');
        await refreshUser();
        await loadWalletData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Payment processing failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount < 100) {
      setStatusMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹100.' });
      return;
    }
    if (amount > 50000) {
      setStatusMessage({ type: 'error', text: 'Maximum withdrawal limit per transaction is ₹50,000.' });
      return;
    }

    if (amount > (user?.winningBalance || 0)) {
      setStatusMessage({
        type: 'error',
        text: `You only have ₹${user?.winningBalance || 0} in Winning Balance. Deposits cannot be directly withdrawn as per anti-fraud rules.`,
      });
      return;
    }

    if (withdrawMethod === 'upi' && (!upiId.trim() || !upiId.includes('@'))) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid UPI ID (e.g. mobile@upi).' });
      return;
    }

    if (withdrawMethod === 'bank' && !bankAccount.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter account number and IFSC.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await api.withdraw({
        amount,
        upiId: withdrawMethod === 'upi' ? upiId.trim() : 'Bank Transfer',
        bankAccount: withdrawMethod === 'bank' ? bankAccount.trim() : undefined,
      });

      if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Withdrawal request for ₹${amount} submitted! Admin will verify and transfer funds via UPI.`,
        });
        setWithdrawAmount('');
        await refreshUser();
        await loadWalletData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Withdrawal submission failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(officialUpiVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Balances Dashboard Card */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Gaming Balance</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight mt-1">
              ₹{totalBalance.toLocaleString()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('deposit')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'deposit'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Add Money
            </button>
            <button
              onClick={() => setActiveSubTab('withdraw')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeSubTab === 'withdraw'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Breakdown row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-800/80 pt-4">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">Deposit Balance</span>
              <span className="text-[10px] font-semibold text-neutral-500 uppercase">For Tournament Entries</span>
            </div>
            <p className="font-heading text-xl font-bold text-neutral-100 tabular-nums mt-1">
              ₹{(user?.depositBalance || 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-300">Winning Balance</span>
              <span className="text-[10px] font-bold text-amber-500 uppercase">Withdrawable via UPI</span>
            </div>
            <p className="font-heading text-xl font-bold text-amber-400 tabular-nums mt-1">
              ₹{(user?.winningBalance || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => {
            setActiveSubTab('deposit');
            setStatusMessage(null);
          }}
          className={`pb-2 text-sm font-semibold transition-colors ${
            activeSubTab === 'deposit'
              ? 'border-b-2 border-red-500 text-red-400'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Add Money (UPI)
        </button>
        <button
          onClick={() => {
            setActiveSubTab('withdraw');
            setStatusMessage(null);
          }}
          className={`pb-2 text-sm font-semibold transition-colors ${
            activeSubTab === 'withdraw'
              ? 'border-b-2 border-red-500 text-red-400'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Withdraw Winnings
        </button>
        <button
          onClick={() => {
            setActiveSubTab('history');
            setStatusMessage(null);
          }}
          className={`pb-2 text-sm font-semibold transition-colors ${
            activeSubTab === 'history'
              ? 'border-b-2 border-red-500 text-red-400'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Passbook & History
        </button>
      </div>

      {/* Feedback status message */}
      {statusMessage && (
        <div
          className={`flex items-start gap-2.5 rounded-xl border p-4 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'border-emerald-800/80 bg-emerald-950/50 text-emerald-300'
              : 'border-red-800/80 bg-red-950/50 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          )}
          <div className="flex-1">{statusMessage.text}</div>
        </div>
      )}

      {/* SUB-TAB 1: DEPOSIT / ADD MONEY */}
      {activeSubTab === 'deposit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Amount & Apps */}
          <div className="lg:col-span-7 space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h3 className="font-heading text-lg font-bold text-white">Select Deposit Amount</h3>

            {/* Chips */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {depositChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setDepositAmount(chip);
                    setCustomAmount(chip.toString());
                  }}
                  className={`rounded-xl border py-2 text-xs font-bold tabular-nums transition-all ${
                    Number(customAmount) === chip
                      ? 'border-red-500 bg-red-600/20 text-white shadow-sm'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  ₹{chip}
                </button>
              ))}
            </div>

            {/* Custom Amount input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Or Enter Custom Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount (min ₹10)"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-8 pr-4 py-2.5 font-mono text-base font-bold text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* UPI App Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Select UPI App / Payment Mode
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['PhonePe', 'Google Pay', 'Paytm', 'BHIM UPI'].map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setSelectedUpiApp(app)}
                    className={`rounded-xl border p-2 text-center text-xs font-semibold transition-all ${
                      selectedUpiApp === app
                        ? 'border-red-500 bg-red-950/40 text-red-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>

            {/* UTR / Ref ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex justify-between">
                <span>12-Digit UTR / Transaction Ref ID</span>
                <span className="text-[10px] text-neutral-500">Auto-filled or manual</span>
              </label>
              <input
                type="text"
                value={upiReference}
                onChange={(e) => setUpiReference(e.target.value)}
                placeholder="e.g. 408219482014"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleDepositSubmit}
              disabled={isLoading || !Number(customAmount)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:from-red-500 hover:to-orange-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Confirming Payment...' : `Complete Deposit of ₹${customAmount || '0'}`}
            </button>
          </div>

          {/* Right: UPI QR Code & Instructions */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 text-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Scan & Pay via any UPI App
              </span>
              <h4 className="font-heading text-base font-bold text-white mt-1">Official Tournament Escrow</h4>
            </div>

            {/* Dynamic simulated QR code */}
            <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-2xl border-2 border-neutral-700 bg-white p-3 shadow-inner">
              {/* High contrast QR simulation */}
              <div className="h-full w-full bg-neutral-950 rounded-lg flex flex-col items-center justify-center p-2 text-white">
                <QrCode className="h-28 w-28 text-white" />
                <span className="text-[10px] font-mono text-amber-400 mt-1">
                  ₹{customAmount || 100} · FF ARENA
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs">
                <span className="font-mono text-neutral-300">{officialUpiVpa}</span>
                <button
                  onClick={copyUpiId}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold"
                >
                  {copiedUpi ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedUpi ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400">
                0% Processing fee. Funds added instantly to your wallet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WITHDRAW WINNINGS */}
      {activeSubTab === 'withdraw' && (
        <div className="max-w-xl mx-auto space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Fast Cashout</span>
            <h3 className="font-heading text-xl font-bold text-white mt-0.5">Withdraw Tournament Winnings</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Winning balance available: <strong className="text-amber-400 font-mono">₹{(user?.winningBalance || 0).toLocaleString()}</strong>
            </p>
          </div>

          {/* Method selector */}
          <div className="flex items-center gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setWithdrawMethod('upi')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                withdrawMethod === 'upi' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              UPI ID (GPay / PhonePe / Paytm)
            </button>
            <button
              type="button"
              onClick={() => setWithdrawMethod('bank')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                withdrawMethod === 'bank' ? 'bg-amber-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Bank IMPS Transfer
            </button>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex justify-between">
                <span>Withdrawal Amount (₹)</span>
                <span className="text-[10px] text-neutral-500">Min ₹100 · Max ₹50,000</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">₹</span>
                <input
                  type="number"
                  min="100"
                  max="50000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount (₹100 - ₹50,000)"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-8 pr-4 py-2.5 font-mono text-base font-bold text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {withdrawMethod === 'upi' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Your UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Account Number & IFSC Code
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="A/C: 1234567890 | IFSC: HDFC0001234"
                  required
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 text-xs text-neutral-400 space-y-1">
              <p className="flex items-center gap-1 font-semibold text-neutral-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Anti-Fraud Verification:
              </p>
              <p className="text-[11px]">
                Withdrawals are audited against match kill logs. Approved transfers hit your UPI account within 10–30 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !Number(withdrawAmount) || Number(withdrawAmount) > (user?.winningBalance || 0)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 py-3 text-sm font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-950/40 hover:from-amber-500 hover:to-yellow-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Submitting Request...' : `Request Withdrawal of ₹${withdrawAmount || '0'}`}
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: PASSBOOK & HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-white">Transaction Passbook</h3>
            <button
              onClick={loadWalletData}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Pending / Active Withdrawals Tracker */}
          {withdrawals.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Withdrawal Requests</p>
              <div className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
                {withdrawals.map((wd) => (
                  <div key={wd.id} className="flex items-center justify-between p-3.5 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-white tabular-nums text-sm">
                          ₹{wd.amount}
                        </span>
                        <span className="text-neutral-400">to {wd.upiId}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Requested: {new Date(wd.requestedAt).toLocaleString()}
                        {wd.adminRemarks && ` · ${wd.adminRemarks}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px]">
                      {wd.status === 'PENDING' && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Clock className="h-3.5 w-3.5" /> Pending Review
                        </span>
                      )}
                      {wd.status === 'APPROVED' && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Dispatched
                        </span>
                      )}
                      {wd.status === 'REJECTED' && (
                        <span className="flex items-center gap-1 text-red-400">
                          <XCircle className="h-3.5 w-3.5" /> Rejected (Refunded)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Transactions List */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">All Wallet Activity</p>
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center text-xs text-neutral-500">
                No transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'DEPOSIT' || tx.type === 'PRIZE_WIN' || tx.type === 'REFUND';
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3.5 text-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isCredit ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-400'
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-200">{tx.description}</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-heading font-black tabular-nums text-sm ${
                            isCredit ? 'text-emerald-400' : 'text-neutral-200'
                          }`}
                        >
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </p>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
