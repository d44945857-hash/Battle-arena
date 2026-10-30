import React, { useState } from 'react';
import { Download, Smartphone, X, Check, ShieldCheck, Flame } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const res = await install();
      if (res) {
        onClose();
      }
    } catch (err) {
      console.error('Install error:', err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Brand */}
        <div className="text-center space-y-2 mb-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-lg shadow-red-950/40">
            <Flame className="h-7 w-7" />
          </div>
          <h2 className="font-heading text-2xl font-black text-white mt-2">
            Install Android Mobile App
          </h2>
          <p className="text-xs text-neutral-400">
            Install <strong className="text-white">FF BATTLE ARENA</strong> directly onto your Android device home screen as an app without opening the browser.
          </p>
        </div>

        {/* Benefits List */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2.5 text-xs text-neutral-300 mb-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Check className="h-4 w-4 shrink-0" />
            <span>Full-screen esports gaming experience (No URL bar)</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Check className="h-4 w-4 shrink-0" />
            <span>Instant push notifications for Custom Room ID & Password</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Check className="h-4 w-4 shrink-0" />
            <span>Fast 1-tap UPI wallet deposits & cashout tracking</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Check className="h-4 w-4 shrink-0" />
            <span>Ultra lightweight (~2MB) with zero lag</span>
          </div>
        </div>

        {isInstalled ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-center text-xs font-semibold text-emerald-400">
            App is already installed on this device!
          </div>
        ) : isInstallable ? (
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:from-red-500 hover:to-orange-500 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {installing ? 'Installing App...' : 'Download & Install App (APK)'}
          </button>
        ) : isIOS ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 text-xs text-neutral-300 space-y-2">
            <p className="font-semibold text-amber-400">iOS Safari Installation:</p>
            <ol className="list-decimal list-inside space-y-1 text-neutral-400">
              <li>Tap the <strong className="text-white">Share</strong> button in Safari toolbar.</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 text-xs text-neutral-300 space-y-2">
              <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4" />
                How to install on Android Chrome:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 leading-relaxed">
                <li>Open this URL in <strong className="text-white">Chrome on Android</strong>.</li>
                <li>Tap the <strong className="text-white">three dots (⋮)</strong> in Chrome menu.</li>
                <li>Tap <strong className="text-red-400">"Install app"</strong> or <strong className="text-red-400">"Add to Home screen"</strong>.</li>
                <li>An official WebAPK will be placed on your phone screen!</li>
              </ol>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                alert('App Link Copied to clipboard! Open in Chrome to install.');
              }}
              className="w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-700 transition-colors"
            >
              Copy App URL For Android
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
