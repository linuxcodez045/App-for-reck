/**
 * Reck Companion - Account & Identity Profile
 * Separates user account identity from individual device trust & permissions.
 */

import React from 'react';
import { useReck } from '../../context/ReckContext';
import {
  User,
  ArrowLeft,
  Mail,
  Shield,
  Smartphone,
  Laptop,
  LogOut,
  Key,
  CheckCircle2
} from 'lucide-react';

export const AccountView: React.FC = () => {
  const { userProfile, devices, setActiveScreen } = useReck();

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
            User Account
          </h2>
          <p className="font-mono text-[10px] text-cyan-400">
            Identity & Authentication Provider
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-display font-bold text-lg text-cyan-300">
          {userProfile?.name?.charAt(0) || 'V'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-base text-white truncate">
            {userProfile?.name || 'Vashu Sharma'}
          </h3>
          <p className="font-mono text-xs text-slate-400 truncate">
            {userProfile?.email || 'sharmavashu179@gmail.com'}
          </p>
          <span className="inline-block font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-1">
            Google Workspace SSO Verified
          </span>
        </div>
      </div>

      {/* Identity ≠ Device Authorization Notice (Section 6 & 29) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-1 text-xs">
        <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider block font-bold">
          CORE SECURITY PRINCIPLE
        </span>
        <p className="text-slate-300 leading-relaxed">
          Account sign-in establishes your human identity. It does <em>not</em> grant blanket control over physical desktop devices. Control is gated per-device by cryptographic trust certificates and biometric step-up challenges.
        </p>
      </div>

      {/* Linked Devices Summary */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
          REGISTERED DEVICE ENCLAVES ({devices.length})
        </span>
        <div className="space-y-2">
          {devices.map(d => (
            <div
              key={d.id}
              className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-2.5">
                {d.deviceType === 'mobile' ? (
                  <Smartphone size={15} className="text-cyan-400" />
                ) : (
                  <Laptop size={15} className="text-cyan-400" />
                )}
                <div>
                  <span className="text-white font-medium block">{d.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 block">{d.osVersion}</span>
                </div>
              </div>

              <span
                className={`text-[10px] font-mono uppercase font-semibold ${
                  d.trustState === 'trusted' ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {d.trustState}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out button */}
      <div className="pt-4">
        <button
          onClick={() => alert('Signed out of Reck Companion account session.')}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 border border-white/5 text-slate-300 text-xs font-mono transition-all"
        >
          <LogOut size={14} />
          <span>Sign Out of Mobile Companion</span>
        </button>
      </div>
    </div>
  );
};
