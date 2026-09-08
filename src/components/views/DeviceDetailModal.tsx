/**
 * Reck Companion - Device Detail Screen / Modal
 * Displays telemetry, capabilities, scoped permissions, remote command trigger, rename & revocation.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import {
  X,
  Laptop,
  Terminal,
  Shield,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
  Radio,
  Clock
} from 'lucide-react';

export const DeviceDetailModal: React.FC = () => {
  const {
    selectedDeviceId,
    setSelectedDeviceId,
    devices,
    setIsRemoteCommandModalOpen,
    renameDevice,
    revokeDevice,
    updateDevicePermission
  } = useReck();

  const device = devices.find(d => d.id === selectedDeviceId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  if (!device) return null;

  const handleStartRename = () => {
    setNameInput(device.name);
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (nameInput.trim()) {
      renameDevice(device.id, nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleRevoke = async () => {
    await revokeDevice(device.id);
    setConfirmRevoke(false);
    setSelectedDeviceId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] bg-[#0c1017] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Laptop size={18} />
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="bg-slate-900 border border-cyan-500/40 px-2 py-0.5 rounded text-sm text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveRename}
                    className="text-xs text-cyan-400 font-mono hover:underline"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="font-display font-bold text-base text-white">
                    {device.name}
                  </h3>
                  <button
                    onClick={handleStartRename}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}
              <p className="font-mono text-[10px] text-slate-400">
                {device.osVersion} • {device.reckVersion}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedDeviceId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Status and Network Stats Card */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                TELEMETRY STATE
              </span>
              <div className="flex items-center space-x-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    device.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                <span className="font-mono text-xs font-semibold text-white">
                  {device.isOnline ? 'Online & Linked' : 'Offline'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-cyan-400">
                Reck: {device.currentReckState}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                HARDWARE TRUST
              </span>
              <div className="flex items-center space-x-1.5">
                <Shield size={12} className="text-cyan-400" />
                <span className="font-mono text-xs font-semibold uppercase text-cyan-200">
                  {device.trustState}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                IP: {device.ipAddress || '192.168.1.142'}
              </p>
            </div>
          </div>

          {/* Primary Action Button: Dispatch Remote Command */}
          {device.isOnline && (
            <button
              onClick={() => {
                setSelectedDeviceId(null);
                setIsRemoteCommandModalOpen(true);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-98"
            >
              <Terminal size={14} />
              <span>Send Remote Command to {device.name}</span>
            </button>
          )}

          {/* Device Capabilities Section */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
              HARDWARE CAPABILITIES ({device.capabilities.length})
            </span>
            <div className="space-y-1.5">
              {device.capabilities.map(cap => (
                <div
                  key={cap.id}
                  className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="text-white font-medium block">{cap.name}</span>
                    <span className="text-[11px] text-slate-400 block">{cap.description}</span>
                  </div>
                  {cap.requiresStepUp && (
                    <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0 ml-2">
                      Step-Up
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Per-Device Permissions (Section 28) */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
              PER-DEVICE PERMISSIONS & SCOPES
            </span>
            <div className="space-y-1.5">
              {device.permissions.map(perm => (
                <div
                  key={perm.id}
                  className="p-2.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-slate-200 font-medium block truncate">{perm.name}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{perm.description}</span>
                  </div>

                  <select
                    value={perm.level}
                    onChange={e => updateDevicePermission(device.id, perm.id, e.target.value)}
                    className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-cyan-300 focus:outline-none"
                  >
                    <option value="ALLOWED">ALLOWED</option>
                    <option value="LIMITED">LIMITED</option>
                    <option value="ASK_EVERY_TIME">ASK EVERY TIME</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Visually Separated Dangerous Actions (Section 11) */}
          <div className="pt-3 border-t border-rose-500/20 space-y-2">
            <span className="font-mono text-[10px] text-rose-400 uppercase tracking-widest block">
              DANGER ZONE
            </span>

            {confirmRevoke ? (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2 text-xs">
                <p className="text-rose-200">
                  Are you sure you want to revoke <strong>{device.name}</strong>? It will immediately lose all permissions and E2EE session keys.
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRevoke}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-colors"
                  >
                    Confirm Revoke
                  </button>
                  <button
                    onClick={() => setConfirmRevoke(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmRevoke(true)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-mono transition-all"
              >
                <Trash2 size={13} />
                <span>Revoke Device Access</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
