/**
 * Reck Companion - Permission Center
 * Global & per-device access boundary configurations (Allowed, Limited, Ask Every Time, Blocked).
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import { PermissionLevel } from '../../types';
import {
  Key,
  ArrowLeft,
  Mic,
  Bell,
  HardDrive,
  Cpu,
  Terminal,
  Shield,
  Laptop,
  Check
} from 'lucide-react';

export const PermissionCenterView: React.FC = () => {
  const { devices, updateDevicePermission, setActiveScreen } = useReck();
  const [selectedDeviceTab, setSelectedDeviceTab] = useState(devices[0]?.id || 'dev_pc_home');

  const selectedDevice = devices.find(d => d.id === selectedDeviceTab) || devices[0];

  const globalPermissions = [
    { name: 'Microphone & Speech', desc: 'Real-time audio listening & Call Reck sessions', level: 'ALLOWED', icon: Mic },
    { name: 'Push Notifications', desc: 'Immediate delivery of high-risk approval requests', level: 'ALLOWED', icon: Bell },
    { name: 'Encrypted Local Cache', desc: 'Temporary sandboxed artifact storage', level: 'ALLOWED', icon: HardDrive },
    { name: 'Biometric Cryptographic Enclave', desc: 'Signing action-scoped tokens', level: 'ALLOWED', icon: Shield }
  ];

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
            Permission Center
          </h2>
          <p className="font-mono text-[10px] text-cyan-400">
            Capability Scopes & Per-Device Gates
          </p>
        </div>
      </div>

      {/* Global Companion Permissions */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
          THIS PHONE (MOBILE COMPANION CORE)
        </span>
        <div className="space-y-2">
          {globalPermissions.map((perm, idx) => {
            const Icon = perm.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{perm.name}</span>
                    <span className="text-[11px] text-slate-400 block">{perm.desc}</span>
                  </div>
                </div>

                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {perm.level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Device Remote Permissions */}
      <div className="space-y-2 pt-2">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
          PER-DEVICE REMOTE SCOPES
        </span>

        {/* Device selector tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {devices.map(dev => (
            <button
              key={dev.id}
              onClick={() => setSelectedDeviceTab(dev.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                selectedDeviceTab === dev.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {dev.name}
            </button>
          ))}
        </div>

        {/* Selected Device Permission Controls */}
        <div className="space-y-2">
          {selectedDevice.permissions.length > 0 ? (
            selectedDevice.permissions.map(perm => (
              <div
                key={perm.id}
                className="p-3 rounded-2xl bg-slate-900/50 border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex-1 pr-2">
                  <span className="font-semibold text-slate-200 block">{perm.name}</span>
                  <span className="text-[11px] text-slate-400 block">{perm.description}</span>
                </div>

                <select
                  value={perm.level}
                  onChange={e => updateDevicePermission(selectedDevice.id, perm.id, e.target.value as PermissionLevel)}
                  className="bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-cyan-300 focus:outline-none"
                >
                  <option value="ALLOWED">ALLOWED</option>
                  <option value="LIMITED">LIMITED</option>
                  <option value="ASK_EVERY_TIME">ASK EVERY TIME</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic p-3">
              No custom permissions configured for this device node.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
