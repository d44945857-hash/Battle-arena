import React, { useState } from 'react';
import { X, Flame, Shield, Smartphone, Mail, Key, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api, setStoredUserId } from '../services/api.ts';
import { signInWithGoogle } from '../services/firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { refreshUser, quickSwitch } = useAuth();

  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [username, setUsername] = useState('');
  const [ffUid, setFfUid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser.email) {
        const res = await api.verifyOtp({
          identifier: fbUser.email,
          otp: '778899',
          username: fbUser.displayName || undefined,
        });
        if (res.user) {
          setStoredUserId(res.user.id);
          await refreshUser();
          onClose();
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.sendOtp(identifier.trim());
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setStep('otp');
        setOtp('778899'); // Pre-fill test OTP for immediate frictionless testing
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.verifyOtp({
        identifier: identifier.trim(),
        otp: otp.trim(),
        username: username.trim() || undefined,
        ffUid: ffUid.trim() || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        await refreshUser();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Brand */}
        <div className="text-center space-y-1 mb-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-950/40">
            <Flame className="h-6 w-6" />
          </div>
          <h2 className="font-heading text-2xl font-black text-white mt-3">
            FF BATTLE <span className="text-red-500">ARENA</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Sign in to join tournaments, win cash prizes, and withdraw via UPI.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-800/80 bg-red-950/60 p-3 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Official Firebase Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:border-neutral-500 hover:bg-neutral-800"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google (Firebase)
        </button>

        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <span className="relative bg-neutral-950 px-2 text-[10px] uppercase font-bold text-neutral-500">
            Or use Mobile OTP / Email
          </span>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Toggle phone vs email */}
            <div className="flex items-center gap-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('phone');
                  setIdentifier('');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors ${
                  authMode === 'phone' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setIdentifier('');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-colors ${
                  authMode === 'email' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Email Login
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                {authMode === 'phone' ? 'Mobile Number' : 'Email Address'}
              </label>
              <input
                type={authMode === 'phone' ? 'tel' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={authMode === 'phone' ? 'e.g. 9876543210' : 'e.g. player@gmail.com'}
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:from-red-500 hover:to-orange-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Sending OTP...' : 'Get Verification Code'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold uppercase tracking-wider text-neutral-300">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-red-400 hover:underline"
                >
                  Change {authMode}
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="778899"
                required
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-center font-mono text-lg font-black tracking-widest text-amber-400 focus:border-red-500 focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500 text-center">
                Demo verification code: <strong className="text-neutral-300">778899</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Esports Gamer Username (Optional)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Shadow_Striker"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Free Fire Player UID (Optional)
              </label>
              <input
                type="text"
                value={ffUid}
                onChange={(e) => setFfUid(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="e.g. 784920152"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-mono text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !otp.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:from-red-500 hover:to-orange-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify & Enter Arena'}
            </button>
          </form>
        )}

        {/* Quick Demo Switcher Section */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 space-y-2">
          <p className="text-[11px] text-center font-bold uppercase tracking-wider text-neutral-500">
            Instant Test Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                await quickSwitch('user');
                onClose();
              }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/80 py-2 text-xs font-bold text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
            >
              🎮 Demo Gamer
            </button>
            <button
              type="button"
              onClick={async () => {
                await quickSwitch('admin');
                onClose();
              }}
              className="rounded-xl border border-red-900/50 bg-red-950/40 py-2 text-xs font-bold text-red-300 hover:border-red-700 hover:text-white transition-colors"
            >
              🛡️ Arena Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
