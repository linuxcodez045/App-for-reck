/**
 * Reck Companion - Biometric Step-Up Authentication Modal
 * Implements action-scoped approval with biometric sensor engagement (Fingerprint / Face ID),
 * cryptographic signed token generation, and 4-digit PIN fallback.
 */

import React, { useState, useEffect } from 'react';
import { useReck } from '../../context/ReckContext';
import { biometricService } from '../../services/biometricService';
import {
  X,
  Fingerprint,
  Scan,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';

export const BiometricApprovalModal: React.FC = () => {
  const {
    isBiometricModalOpen,
    setIsBiometricModalOpen,
    activeApprovalForBiometrics,
    executeApproval
  } = useReck();

  const [authStep, setAuthStep] = useState<'review' | 'scanning' | 'pin_fallback' | 'success' | 'failed'>('review');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [remainingTime, setRemainingTime] = useState(900); // 15 minutes in seconds

  const bioType = biometricService.getBiometricType();

  useEffect(() => {
    if (isBiometricModalOpen) {
      setAuthStep('review');
      setPin('');
      setErrorMessage('');
    }
  }, [isBiometricModalOpen]);

  // Countdown timer simulation
  useEffect(() => {
    if (!isBiometricModalOpen) return;
    const interval = setInterval(() => {
      setRemainingTime(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isBiometricModalOpen]);

  if (!isBiometricModalOpen || !activeApprovalForBiometrics) return null;

  const approval = activeApprovalForBiometrics;
  const isExpired = remainingTime <= 0;

  const handleVerifyBiometric = async () => {
    if (isExpired) {
      setErrorMessage('This security approval request has expired.');
      setAuthStep('failed');
      return;
    }

    setAuthStep('scanning');
    setErrorMessage('');

    try {
      const res = await biometricService.authenticateForAction(
        approval.action,
        approval.target
      );

      if (res.success) {
        setAuthStep('success');
        setTimeout(async () => {
          await executeApproval(approval.id, true);
        }, 800);
      } else {
        setErrorMessage(res.error || 'Biometric recognition failed. Try PIN.');
        setAuthStep('failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sensor error');
      setAuthStep('failed');
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    setAuthStep('scanning');
    try {
      const res = await biometricService.authenticateForAction(
        approval.action,
        approval.target,
        true,
        pin
      );

      if (res.success) {
        setAuthStep('success');
        setTimeout(async () => {
          await executeApproval(approval.id, true, pin);
        }, 800);
      } else {
        setErrorMessage('Invalid PIN. Use default "1234" for test environment.');
        setAuthStep('failed');
      }
    } catch (err: any) {
      setErrorMessage('Verification failed');
      setAuthStep('failed');
    }
  };

  const handleDecline = async () => {
    await executeApproval(approval.id, false);
    setIsBiometricModalOpen(false);
  };

  const formatTimer = () => {
    const m = Math.floor(remainingTime / 60);
    const s = remainingTime % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c1017] border border-amber-500/40 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-amber-500/20 bg-amber-950/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Hardware Step-Up Verification
              </h3>
              <p className="font-mono text-[10px] text-amber-300">
                Action-Scoped Authorization Token
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBiometricModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {authStep === 'review' && (
            <div className="space-y-4">
              {/* Target & Action Details Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">EXACT ACTION</span>
                  <span className="font-bold text-white uppercase">{approval.action}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">TARGET RESOURCE</span>
                  <span className="font-mono text-cyan-300 font-bold truncate max-w-[200px]">
                    {approval.target}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">TARGET DEVICE</span>
                  <span className="font-mono text-white flex items-center space-x-1">
                    <Laptop size={12} className="text-cyan-400" />
                    <span>{approval.targetDeviceName}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">REQUESTING SOURCE</span>
                  <span className="text-slate-300">{approval.requestedBy}</span>
                </div>
              </div>

              {/* Justification / Reason */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest block font-bold">
                  SECURITY JUSTIFICATION
                </span>
                <p className="text-amber-200/90 leading-relaxed">
                  {approval.reason}
                </p>
              </div>

              {/* Expiration Timer Banner */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <Clock size={13} />
                  <span>Expires in {formatTimer()}</span>
                </div>
                <span>Scope: 1 Operation</span>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={handleDecline}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Decline Action
                </button>

                <button
                  onClick={handleVerifyBiometric}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                >
                  {bioType === 'FACE_ID' ? <Scan size={15} /> : <Fingerprint size={15} />}
                  <span>Verify with {bioType === 'FACE_ID' ? 'Face ID' : 'Fingerprint'}</span>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setAuthStep('pin_fallback')}
                  className="text-[11px] font-mono text-cyan-400/80 hover:underline"
                >
                  Use Security PIN Fallback
                </button>
              </div>
            </div>
          )}

          {/* Scanning / Biometric Sensor Animation */}
          {authStep === 'scanning' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-24 h-24 rounded-full border-2 border-cyan-400/30 flex items-center justify-center animate-pulse">
                <div className="absolute inset-2 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                {bioType === 'FACE_ID' ? (
                  <Scan size={36} className="text-cyan-300" />
                ) : (
                  <Fingerprint size={36} className="text-cyan-300" />
                )}
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white">
                  Hardware Enclave Challenge...
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Signing action payload for {approval.targetDeviceName}
                </p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {authStep === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-display font-bold text-base text-white">
                Biometric Approval Signed
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Transmitting scoped token to {approval.targetDeviceName}...
              </p>
            </div>
          )}

          {/* PIN Fallback Step */}
          {authStep === 'pin_fallback' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <KeyRound size={28} className="mx-auto text-cyan-400" />
                <h4 className="font-display font-bold text-sm text-white">
                  Enter 4-Digit Security PIN
                </h4>
                <p className="text-xs text-slate-400">
                  Fallback for hardware biometric step-up (Demo PIN: 1234)
                </p>
              </div>

              <div className="flex justify-center">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-36 text-center text-2xl tracking-[0.4em] font-mono bg-slate-900 border border-white/20 rounded-xl py-2 text-white focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <p className="text-center text-xs text-rose-400 font-mono">
                  {errorMessage}
                </p>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthStep('review')}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pin.length !== 4}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors"
                >
                  Authorize PIN
                </button>
              </div>
            </form>
          )}

          {/* Failed Step */}
          {authStep === 'failed' && (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400">
                <AlertCircle size={28} />
              </div>
              <h4 className="font-display font-bold text-sm text-white">
                Authorization Failed
              </h4>
              <p className="text-xs text-rose-300 font-mono">
                {errorMessage || 'Failed to authenticate.'}
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setAuthStep('review')}
                  className="px-4 py-1.5 rounded-xl bg-white/10 text-white text-xs font-mono"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
