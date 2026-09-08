/**
 * Reck Companion - Trusted Devices & Device Constellation View
 * Visualizes the spatial device mesh topology (Constellation) alongside detailed device node cards.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import { Device } from '../../types';
import {
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Wifi,
  WifiOff,
  Battery,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const DevicesView: React.FC = () => {
  const {
    devices,
    setSelectedDeviceId,
    setIsPairingModalOpen,
    setIsRemoteCommandModalOpen
  } = useReck();

  const [activeTab, setActiveTab] = useState<'constellation' | 'list'>('constellation');

  const getDeviceIcon = (type: Device['deviceType']) => {
    switch (type) {
      case 'desktop':
        return Monitor;
      case 'laptop':
        return Laptop;
      case 'tablet':
        return Tablet;
      case 'mobile':
      default:
        return Smartphone;
    }
  };

  const onlineCount = devices.filter(d => d.isOnline).length;

  return (
    <div className="flex-1 w-full px-4 pt-3 pb-8 space-y-5 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            Trusted Mesh
          </h2>
          <p className="font-mono text-[11px] text-slate-400">
            {onlineCount} of {devices.length} Devices Online • E2EE Linked
          </p>
        </div>

        <button
          onClick={() => setIsPairingModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 text-cyan-300 font-sans text-xs font-semibold transition-all active:scale-95"
        >
          <Plus size={14} />
          <span>Pair Device</span>
        </button>
      </div>

      {/* Mode Switcher: Constellation Topology vs Detailed List */}
      <div className="p-1 rounded-xl bg-slate-900/80 border border-white/10 flex items-center">
        <button
          onClick={() => setActiveTab('constellation')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'constellation'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Device Constellation (Spatial)
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            activeTab === 'list'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Device Node List ({devices.length})
        </button>
      </div>

      {/* 1. DEVICE CONSTELLATION GRAPH */}
      {activeTab === 'constellation' && (
        <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900/70 to-slate-950/90 border border-white/10 p-4 overflow-hidden">
          {/* Subtle starfield / grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />

          {/* Hub Node at Top */}
          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu size={22} className="text-cyan-300 animate-pulse" />
            </div>
            <span className="font-mono text-xs font-bold text-white mt-1.5 tracking-wider">
              RECK HUB
            </span>
            <span className="text-[10px] font-mono text-cyan-400/70">
              Central Telemetry Router
            </span>
          </div>

          {/* SVG Connecting Vectors */}
          <div className="my-2 flex justify-center">
            <svg width="280" height="40" viewBox="0 0 280 40" fill="none" className="overflow-visible">
              <path
                d="M 140 0 L 140 20 L 40 20 L 40 40"
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 140 0 L 140 40"
                stroke="rgba(6, 182, 212, 0.6)"
                strokeWidth="1.5"
              />
              <path
                d="M 140 0 L 140 20 L 240 20 L 240 40"
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>

          {/* Planetary Orbit Nodes: Home PC, Work Laptop, Companion Phone */}
          <div className="grid grid-cols-3 gap-2 relative z-10 pt-1">
            {devices.slice(0, 3).map(dev => {
              const Icon = getDeviceIcon(dev.deviceType);
              const isExecuting = dev.currentReckState === 'EXECUTING';

              return (
                <button
                  key={dev.id}
                  onClick={() => setSelectedDeviceId(dev.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all active:scale-95 group ${
                    dev.isOnline
                      ? 'bg-slate-900/80 border-white/10 hover:border-cyan-500/40 hover:bg-slate-800/80'
                      : 'bg-slate-950/40 border-white/5 opacity-50'
                  }`}
                >
                  <div
                    className={`relative p-2.5 rounded-xl mb-1.5 transition-colors ${
                      isExecuting
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                        : dev.isOnline
                        ? 'bg-white/5 text-slate-200 group-hover:text-cyan-400'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    <Icon size={18} />
                    {dev.isOnline && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#07090e]" />
                    )}
                  </div>

                  <span className="text-xs font-semibold text-white truncate max-w-[85px]">
                    {dev.name.replace(' (This Phone)', '')}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
                    {dev.isOnline ? dev.currentReckState : 'Offline'}
                  </span>

                  {isExecuting && (
                    <span className="mt-1 text-[9px] font-mono text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded">
                      Busy Task
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Tap any node for telemetry & commands</span>
            <span className="text-cyan-400 font-semibold">ChaCha20 E2EE</span>
          </div>
        </div>
      )}

      {/* 2. DETAILED DEVICE LIST */}
      <div className="space-y-3">
        {devices.map(device => {
          const Icon = getDeviceIcon(device.deviceType);
          const isRevoked = device.trustState === 'revoked';

          return (
            <div
              key={device.id}
              onClick={() => setSelectedDeviceId(device.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                isRevoked
                  ? 'bg-rose-950/10 border-rose-500/20 opacity-60'
                  : 'bg-slate-900/50 border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      isRevoked
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : device.isOnline
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-slate-800/60 text-slate-400 border border-white/5'
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {device.name}
                      </h4>
                      {device.isCurrentDevice && (
                        <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                          THIS DEVICE
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {device.osVersion} • {device.lastSeen}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isRevoked
                        ? 'bg-rose-500/20 text-rose-300'
                        : device.isOnline
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isRevoked ? 'bg-rose-400' : device.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                    <span>{isRevoked ? 'REVOKED' : device.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </span>

                  {device.batteryLevel !== undefined && (
                    <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                      <Battery size={11} className="text-emerald-400" />
                      <span>{device.batteryLevel}%</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Task State and Capabilities snippet */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[11px]">
                    State: <strong className="text-cyan-300">{device.currentReckState}</strong>
                  </span>
                  {device.currentTaskId && (
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Running Task
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-slate-300 group-hover:text-white font-mono text-xs">
                  <span>Inspect</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
