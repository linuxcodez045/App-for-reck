/**
 * Reck Companion - Secondary Navigation Drawer
 * Accessible via profile / header menu; provides access to Memory, Automations, Trust Center, Permissions, and Settings.
 */

import React from 'react';
import { useReck, ActiveScreen } from '../../context/ReckContext';
import {
  X,
  Brain,
  Zap,
  Shield,
  Key,
  Layers,
  User,
  Settings,
  Activity,
  Compass,
  WifiOff,
  RefreshCw,
  QrCode
} from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose }) => {
  const {
    setActiveScreen,
    userProfile,
    isNetworkOffline,
    toggleNetworkOffline,
    setIsPairingModalOpen,
    refreshData
  } = useReck();

  if (!isOpen) return null;

  const navigateTo = (screen: ActiveScreen) => {
    setActiveScreen(screen);
    onClose();
  };

  const menuSections = [
    {
      title: 'Ecosystem Intelligence',
      items: [
        { id: 'memory' as ActiveScreen, label: 'Reck Memory', sub: 'Permanent knowledge & active context', icon: Brain },
        { id: 'automations' as ActiveScreen, label: 'Automations & Reminders', sub: 'Recurring, upcoming, & watching rules', icon: Zap },
        { id: 'integrations' as ActiveScreen, label: 'Connected Services', sub: 'Google, GitHub, Spotify, & Slack', icon: Layers }
      ]
    },
    {
      title: 'Security & Hardware Trust',
      items: [
        { id: 'trustCenter' as ActiveScreen, label: 'Trust Center', sub: 'E2EE certificates & audit log', icon: Shield },
        { id: 'permissionCenter' as ActiveScreen, label: 'Permission Center', sub: 'Global & per-device access limits', icon: Key },
        { id: 'diagnostics' as ActiveScreen, label: 'Diagnostics & Test Suite', sub: 'Latency, telemetry, & test runner', icon: Activity }
      ]
    },
    {
      title: 'Configuration',
      items: [
        { id: 'account' as ActiveScreen, label: 'Account Profile', sub: userProfile?.email || 'sharmavashu179@gmail.com', icon: User },
        { id: 'settings' as ActiveScreen, label: 'Companion Settings', sub: 'Language (Hinglish/EN/HI), voice, appearance', icon: Settings },
        { id: 'onboarding' as ActiveScreen, label: 'Onboarding Sequence', sub: 'Review 11-step mobile initialization', icon: Compass }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xs h-full bg-[#0b0e14] border-l border-white/10 flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center font-display font-bold text-cyan-400">
              R
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white leading-tight">
                {userProfile?.name || 'Vashu Sharma'}
              </h3>
              <p className="font-mono text-[10px] text-cyan-400/80">
                TRUSTED COMPANION
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Utility Actions */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/5 bg-slate-900/40">
          <button
            onClick={() => {
              setIsPairingModalOpen(true);
              onClose();
            }}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-200 transition-colors"
          >
            <QrCode size={14} className="text-cyan-400" />
            <span>Pair Device</span>
          </button>

          <button
            onClick={() => {
              toggleNetworkOffline();
              onClose();
            }}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border text-xs transition-colors ${
              isNetworkOffline
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-200'
            }`}
          >
            <WifiOff size={14} className={isNetworkOffline ? 'text-rose-400' : 'text-slate-400'} />
            <span>{isNetworkOffline ? 'Go Online' : 'Simulate Offline'}</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 p-3 space-y-5">
          {menuSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest px-2">
                {sec.title}
              </span>
              <div className="space-y-0.5 mt-1">
                {sec.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className="w-full flex items-start space-x-3 p-2 rounded-xl hover:bg-white/5 text-left transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {item.sub}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Reck Mobile v1.0.0</span>
          <button
            onClick={() => {
              refreshData();
              onClose();
            }}
            className="flex items-center space-x-1 text-cyan-400 hover:underline"
          >
            <RefreshCw size={11} />
            <span>Sync Mesh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
