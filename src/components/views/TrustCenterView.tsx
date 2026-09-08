/**
 * Reck Companion - Trust Center & Security Audit Screen
 * Displays cryptographic posture, trusted device summary, biometric keys, and audit history.
 */

import React from 'react';
import { useReck } from '../../context/ReckContext';
import {
  Shield,
  ShieldCheck,
  Key,
  Lock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCode,
  Laptop,
  Smartphone,
  Cpu
} from 'lucide-react';

export const TrustCenterView: React.FC = () => {
  const { auditLogs, devices, setActiveScreen, diagnostics } = useReck();

  return (
    <div className="flex-1 w-full px-4 pt-3 pb-8 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={() => setActiveScreen('home')}
          className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            Security & Trust Center
          </h2>
          <p className="font-mono text-[10px] text-cyan-400">
            Hardware Enclave & Audit Logs
          </p>
        </div>
      </div>

      {/* Trust Status Summary Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-cyan-950/20 border border-emerald-500/30 space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white">
              Ecosystem Integrity High
            </h4>
            <p className="font-mono text-[10px] text-emerald-300">
              Zero Unsigned Commands Permitted
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-slate-950/50 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">Mesh Cipher</span>
            <span className="text-white font-bold">ChaCha20-Poly1305</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">Biometric Enclave</span>
            <span className="text-emerald-400 font-bold">Hardware Active</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">Trusted Nodes</span>
            <span className="text-cyan-300 font-bold">{devices.filter(d => d.trustState === 'trusted').length} Devices</span>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 block">Key Fingerprint</span>
            <span className="text-slate-300 font-bold">{diagnostics?.e2eeFingerprint.substring(0, 9)}...</span>
          </div>
        </div>
      </div>

      {/* SECTION 40: RECENT SENSITIVE ACTIONS AUDIT HISTORY */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
          RECENT SENSITIVE ACTIONS AUDIT ({auditLogs.length})
        </span>

        <div className="space-y-2">
          {auditLogs.map(audit => (
            <div
              key={audit.id}
              className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-1.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {audit.status === 'APPROVED' ? (
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={15} className="text-rose-400 shrink-0" />
                  )}
                  <span className="font-display font-bold text-xs text-white">
                    {audit.action}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                    audit.status === 'APPROVED'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-rose-500/15 text-rose-300'
                  }`}
                >
                  {audit.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Target: <strong className="text-slate-200">{audit.target}</strong></span>
                <span>On {audit.targetDevice}</span>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5">
                <span>Verified: {audit.authenticatedWith}</span>
                <span>{audit.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
