/**
 * Reck Companion - Mobile Bottom Navigation
 * Compact, tactile 4-tab bar with quick contextual launcher for Voice / Call Reck.
 */

import React from 'react';
import { useReck, ActiveScreen } from '../../context/ReckContext';
import { Home, CheckSquare, Laptop, Bell, PhoneCall, MessageSquare } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeScreen, setActiveScreen, approvals, notifications, startCallReck } = useReck();

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const tabs: { id: ActiveScreen; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'devices', label: 'Devices', icon: Laptop },
    { id: 'notifications', label: 'Activity', icon: Bell }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto px-4 pb-4 pt-1 bg-gradient-to-t from-[#07090e] via-[#07090e]/95 to-transparent pointer-events-auto">
      <div className="relative flex items-center justify-between px-3 py-2 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Navigation Tabs */}
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;

          let badgeCount = 0;
          if (tab.id === 'tasks') {
            badgeCount = pendingApprovalsCount;
          } else if (tab.id === 'notifications') {
            badgeCount = unreadNotificationsCount;
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveScreen(tab.id)}
              className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-cyan-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-amber-500 text-[9px] font-mono font-bold text-slate-950 flex items-center justify-center">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-sans tracking-wide mt-1">
                {tab.label}
              </span>

              {/* Active Tab Accent Line */}
              {isActive && (
                <div className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-white/10 my-auto" />

        {/* Quick Voice / Call Reck Trigger Button */}
        <button
          onClick={startCallReck}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 active:scale-95 transition-all group"
          title="Start secure Call Reck session"
        >
          <PhoneCall size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono font-semibold tracking-wide">
            CALL
          </span>
        </button>
      </div>
    </nav>
  );
};
