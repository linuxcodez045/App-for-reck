/**
 * Reck Companion - Remote Command Modal & Execution Pipeline
 * Dispatches natural language and quick-action commands to trusted PCs with a live visual transmission pipeline.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import {
  X,
  Terminal,
  Send,
  Laptop,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Play,
  Activity,
  Cpu
} from 'lucide-react';

export const RemoteCommandModal: React.FC = () => {
  const {
    isRemoteCommandModalOpen,
    setIsRemoteCommandModalOpen,
    devices,
    dispatchRemoteCommand,
    pipelineAnimation,
    clearPipelineAnimation
  } = useReck();

  const [commandText, setCommandText] = useState('');
  const [targetId, setTargetId] = useState('dev_pc_home');

  if (!isRemoteCommandModalOpen) return null;

  const targetDevice = devices.find(d => d.id === targetId) || devices[0];

  const quickPresets = [
    { label: 'Open Chrome', query: 'Open Chrome on Home PC' },
    { label: 'PC par Chrome kholo', query: 'PC par Chrome kholo' },
    { label: 'Resume Spotify', query: 'Open Spotify on Home PC' },
    { label: 'Status & Battery', query: 'What is my PC battery and status?' },
    { label: 'School Report Task', query: 'Start the report task on my computer' }
  ];

  const handleExecute = async (queryToRun?: string) => {
    const query = queryToRun || commandText;
    if (!query.trim()) return;
    setCommandText('');
    await dispatchRemoteCommand(targetId, query);
  };

  const handleClose = () => {
    clearPipelineAnimation();
    setIsRemoteCommandModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c1017] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Terminal size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Remote Device Command
              </h3>
              <p className="font-mono text-[10px] text-cyan-400">
                Routed via Reck Device Hub
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 space-y-4">
          {/* Target Device Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              TARGET DESTINATION
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id} className="bg-slate-950 text-slate-200">
                    {d.name} ({d.osVersion}) {d.isOnline ? '• Online' : '• Offline'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              QUICK COMMAND PRESETS
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExecute(preset.query)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-mono text-slate-300 hover:text-white transition-colors active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Natural Language Command Input */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              NATURAL LANGUAGE INSTRUCTION
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={commandText}
                onChange={e => setCommandText(e.target.value)}
                placeholder='e.g., "PC par Chrome kholo" or "Open Spotify"'
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={() => handleExecute()}
                disabled={!commandText.trim()}
                className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* LIVE PIPELINE TRANSMISSION VISUALIZATION (Section 13) */}
          {pipelineAnimation && (
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  ACTIVE COMMAND TRANSMISSION
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">
                  {pipelineAnimation.step}
                </span>
              </div>

              {/* Graphical Step Node Pipeline: Phone -> Reck -> Target Device */}
              <div className="flex items-center justify-between text-center font-mono text-[10px]">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                    P
                  </div>
                  <span className="text-slate-300 mt-1">This Phone</span>
                </div>

                <div className="flex-1 px-1">
                  <div className={`h-0.5 rounded-full ${pipelineAnimation.step === 'sending' ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-500'}`} />
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                    R
                  </div>
                  <span className="text-slate-300 mt-1">Reck Hub</span>
                </div>

                <div className="flex-1 px-1">
                  <div className={`h-0.5 rounded-full ${pipelineAnimation.step === 'routing' ? 'bg-cyan-400 animate-pulse' : pipelineAnimation.step === 'executing' || pipelineAnimation.step === 'done' ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                </div>

                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${pipelineAnimation.step === 'done' ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    D
                  </div>
                  <span className="text-slate-300 mt-1 truncate max-w-[70px]">{pipelineAnimation.targetDevice}</span>
                </div>
              </div>

              {/* Output Result */}
              {pipelineAnimation.result && (
                <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                  pipelineAnimation.result.status === 'SUCCESS'
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                }`}>
                  <div className="flex items-center space-x-1.5 font-mono text-[10px] font-bold mb-1">
                    {pipelineAnimation.result.status === 'SUCCESS' ? (
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={12} className="text-rose-400" />
                    )}
                    <span>{pipelineAnimation.result.status} • {pipelineAnimation.result.executionTimeMs}ms</span>
                  </div>
                  <p>{pipelineAnimation.result.output}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
