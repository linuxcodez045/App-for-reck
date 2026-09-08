/**
 * Reck Companion - Mobile App Header
 * Displays ecosystem connection status, current target device, and quick navigation drawer trigger.
 */

import React from 'react';
import { useReck } from '../../context/ReckContext';
import { ShieldCheck, Wifi, WifiOff, Cpu, Menu, Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const {
    isNetworkOffline,
    toggleNetworkOffline,
    activeContext,
    devices,
    approvals,
    notifications,
    setActiveScreen
  } = useReck();

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const onlineDevicesCount = devices.filter(d => d.isOnline).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#07090e]/85 backdrop-blur-md border-b border-white/[0.06] px-4 py-2.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Reck Logo & Ecosystem Status Pill */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveScreen('home')}
            className="flex items-center space-x-2 text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-display font-bold text-xs tracking-wider group-hover:border-cyan-400/60 transition-colors">
              R
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-wide text-white block leading-tight">
                RECK
              </span>
              <span className="font-mono text-[9px] text-cyan-400/80 tracking-widest uppercase block leading-none">
                COMPANION
              </span>
            </div>
          </button>

          {/* Device Hub Connection Pill (Clickable to simulate offline/online) */}
          <button
            onClick={toggleNetworkOffline}
            title={isNetworkOffline ? 'Hub Offline. Click to reconnect.' : 'Connected to Device Hub. Click to test offline mode.'}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[10px] font-mono transition-all ${
              isNetworkOffline
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
            }`}
          >
            {isNetworkOffline ? (
              <>
                <WifiOff size={10} className="text-rose-400" />
                <span>OFFLINE</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>HUB LINKED</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Actions (Active devices, Notifications, Side menu) */}
        <div className="flex items-center space-x-2">
          {/* Active Device mesh count */}
          <button
            onClick={() => setActiveScreen('devices')}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-900/60 border border-white/5 hover:border-white/15 text-slate-300 text-xs font-mono transition-colors"
          >
            <Cpu size={12} className="text-cyan-400" />
            <span>{onlineDevicesCount} Active</span>
          </button>

          {/* Pending Approval indicator or Notification bell */}
          <button
            onClick={() => setActiveScreen('notifications')}
            className="relative p-2 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300 hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#07090e]" />
            )}
          </button>

          {/* Menu Drawer */}
          <button
            onClick={onOpenMenu}
            className="p-2 rounded-lg bg-slate-900/60 border border-white/5 text-slate-300 hover:text-white transition-colors"
            aria-label="Open secondary destinations"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
