/**
 * Reck Companion - Main Mobile Home Screen
 * Follows the strict product hierarchy:
 *  1. THE RECK CORE (Computational structure, tap to speak / activate)
 *  2. Current Reck State Readout
 *  3. High-Priority Pending Approval (if any)
 *  4. Current Task / Activity
 *  5. Trusted Desktop Status
 *  6. Contextual Quick Actions (Talk, Call, Remote Command)
 *  7. Recent Reck Activity
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import { ReckCore } from '../core/ReckCore';
import {
  ShieldAlert,
  ArrowRight,
  Laptop,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  PhoneCall,
  Terminal,
  Activity,
  FileText,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    reckState,
    setReckState,
    devices,
    tasks,
    approvals,
    openBiometricApproval,
    setActiveScreen,
    setSelectedTaskId,
    setSelectedDeviceId,
    setIsRemoteCommandModalOpen,
    startCallReck,
    dispatchRemoteCommand,
    audioLevel
  } = useReck();

  const [quickInput, setQuickInput] = useState('');

  // Primary active items
  const pendingApproval = approvals.find(a => a.status === 'PENDING');
  const activeTask = tasks.find(t => t.status === 'ACTIVE') || tasks[0];
  const primaryDesktop = devices.find(d => d.deviceType === 'desktop' && d.isOnline) || devices[0];

  const handleCoreTap = () => {
    if (reckState === 'IDLE') {
      setReckState('LISTENING');
      // Transition to full voice session or chat
      setTimeout(() => {
        setActiveScreen('chat');
      }, 600);
    } else if (reckState === 'LISTENING' || reckState === 'SPEAKING') {
      setReckState('IDLE');
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const text = quickInput.trim();
    setQuickInput('');
    dispatchRemoteCommand(primaryDesktop?.id || 'dev_pc_home', text);
  };

  return (
    <div className="flex-1 w-full px-4 pt-2 pb-6 space-y-5 animate-in fade-in duration-300">
      {/* 1 & 2. THE RECK CORE & STATE READOUT */}
      <section className="flex flex-col items-center justify-center pt-2 pb-1 relative">
        <ReckCore
          state={reckState}
          size="lg"
          audioLevel={audioLevel}
          interactive={true}
          onClick={handleCoreTap}
          showStateLabel={true}
        />

        <div className="mt-3 text-center">
          <button
            onClick={handleCoreTap}
            className="text-[11px] font-mono tracking-widest text-cyan-400/80 hover:text-cyan-300 uppercase py-1 px-3 rounded-full bg-white/[0.03] border border-white/5 transition-all"
          >
            {reckState === 'IDLE' ? 'Tap Core to Converse' : 'Tap to Pause'}
          </button>
        </div>
      </section>

      {/* 3. HIGH-PRIORITY PENDING APPROVAL BANNER */}
      {pendingApproval && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-slate-900/60 border border-amber-500/40 p-4 shadow-lg shadow-amber-950/20 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-amber-400">
              <ShieldAlert size={18} className="animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-wider uppercase">
                SECURE APPROVAL REQUIRED
              </span>
            </div>
            <span className="font-mono text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              {pendingApproval.riskLevel} RISK
            </span>
          </div>

          <div className="mt-2.5">
            <h4 className="font-display font-bold text-sm text-white">
              {pendingApproval.action}: <span className="font-mono text-cyan-300 font-normal">{pendingApproval.target}</span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {pendingApproval.reason}
            </p>
            <div className="mt-2 flex items-center space-x-2 text-[11px] font-mono text-slate-400">
              <span>Target: <span className="text-white">{pendingApproval.targetDeviceName}</span></span>
              <span>•</span>
              <span>Source: {pendingApproval.requestedBy}</span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex items-center justify-between">
            <button
              onClick={() => setActiveScreen('tasks')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Review Details
            </button>
            <button
              onClick={() => openBiometricApproval(pendingApproval)}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-semibold text-xs transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Lock size={13} />
              <span>VERIFY & APPROVE</span>
            </button>
          </div>
        </section>
      )}

      {/* 4. CURRENT TASK / IMPORTANT ACTIVITY */}
      {activeTask && (
        <section className="rounded-2xl bg-slate-900/50 border border-white/10 p-4 relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px] text-cyan-400 tracking-wider uppercase font-semibold">
                CURRENT RECK TASK
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {activeTask.progressPercent}%
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                {activeTask.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {activeTask.description}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedTaskId(activeTask.id);
                setActiveScreen('tasks');
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 ml-2 shrink-0 transition-colors"
              aria-label="View task details"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Step Progress Visual Bar */}
          <div className="mt-3 space-y-1.5">
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${activeTask.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Running on {activeTask.targetDevice}</span>
              <span>Step {activeTask.currentStepIndex + 1} of {activeTask.steps.length}</span>
            </div>
          </div>
        </section>
      )}

      {/* 5. TRUSTED DESKTOP STATUS */}
      {primaryDesktop && (
        <section className="rounded-2xl bg-slate-900/40 border border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Laptop size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-display font-semibold text-xs text-white">
                  {primaryDesktop.name}
                </h4>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {primaryDesktop.osVersion} • {primaryDesktop.location || 'Linked'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedDeviceId(primaryDesktop.id);
              setActiveScreen('devices');
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-mono text-slate-300 transition-colors"
          >
            <span>Inspect</span>
            <ArrowRight size={12} />
          </button>
        </section>
      )}

      {/* 6. CONTEXTUAL QUICK ACTIONS (Talk, Call, Remote Command) */}
      <section className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => setActiveScreen('chat')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all group active:scale-95"
        >
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform">
            <Sparkles size={16} />
          </div>
          <span className="text-xs font-semibold text-white">Talk to Reck</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Text Chat</span>
        </button>

        <button
          onClick={startCallReck}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all group active:scale-95"
        >
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform">
            <PhoneCall size={16} />
          </div>
          <span className="text-xs font-semibold text-white">Call Reck</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">E2EE Voice</span>
        </button>

        <button
          onClick={() => setIsRemoteCommandModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all group active:scale-95"
        >
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 mb-1.5 group-hover:scale-110 transition-transform">
            <Terminal size={16} />
          </div>
          <span className="text-xs font-semibold text-white">Remote Action</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Dispatch to PC</span>
        </button>
      </section>

      {/* Quick Remote Command Input Field */}
      <section className="rounded-2xl bg-slate-900/60 border border-white/10 p-2.5 flex items-center">
        <form onSubmit={handleQuickSubmit} className="flex items-center w-full space-x-2">
          <Terminal size={15} className="text-slate-400 shrink-0 ml-1.5" />
          <input
            type="text"
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            placeholder='e.g., "PC par Chrome kholo" or "Open Spotify"'
            className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            aria-label="Send command"
          >
            <Send size={14} />
          </button>
        </form>
      </section>

      {/* 7. RECENT RECK ACTIVITY STREAM */}
      <section className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
            RECENT RECK ACTIVITY
          </span>
          <button
            onClick={() => setActiveScreen('notifications')}
            className="text-[11px] font-mono text-cyan-400 hover:underline"
          >
            All Activity
          </button>
        </div>

        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-slate-900/30 border border-white/5 flex items-start space-x-3 text-xs">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-slate-200 font-medium block">
                Work Laptop build completed (48 test suites passed)
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                22 minutes ago • Automated CI Trigger
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/30 border border-white/5 flex items-start space-x-3 text-xs">
            <Clock size={15} className="text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-slate-200 font-medium block">
                Home PC started synthesis for School Report
              </span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                35 minutes ago • Desktop Core
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
