/**
 * Reck Companion - Activity & Notification Center
 * Handles deep-linked alerts for approvals, task completions, and device state changes.
 */

import React from 'react';
import { useReck } from '../../context/ReckContext';
import {
  Bell,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Clock,
  FileText,
  Trash2,
  ArrowRight
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    clearNotifications,
    setActiveScreen,
    setSelectedTaskId,
    setSelectedDeviceId
  } = useReck();

  const handleDeepLink = (notif: any) => {
    markNotificationRead(notif.id);
    if (notif.deepLink.screen === 'approvals') {
      setActiveScreen('tasks');
    } else if (notif.deepLink.screen === 'tasks') {
      if (notif.deepLink.params?.taskId) {
        setSelectedTaskId(notif.deepLink.params.taskId);
      }
      setActiveScreen('tasks');
    } else if (notif.deepLink.screen === 'devices') {
      if (notif.deepLink.params?.deviceId) {
        setSelectedDeviceId(notif.deepLink.params.deviceId);
      }
      setActiveScreen('devices');
    }
  };

  return (
    <div className="flex-1 w-full px-4 pt-3 pb-8 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            Activity & Alerts
          </h2>
          <p className="font-mono text-[11px] text-slate-400">
            Real-Time Push Feeds from Ecosystem
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="flex items-center space-x-1 text-xs font-mono text-slate-400 hover:text-white"
          >
            <Trash2 size={13} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No unread notifications in your feed.
          </div>
        ) : (
          notifications.map(n => {
            const isApproval = n.type === 'approval_required';

            return (
              <div
                key={n.id}
                onClick={() => handleDeepLink(n)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 group ${
                  isApproval
                    ? 'bg-amber-950/25 border-amber-500/40 hover:border-amber-500/60'
                    : n.read
                    ? 'bg-slate-900/30 border-white/5 opacity-70'
                    : 'bg-slate-900/60 border-white/10 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isApproval ? (
                      <ShieldAlert size={15} className="text-amber-400" />
                    ) : (
                      <CheckCircle2 size={15} className="text-cyan-400" />
                    )}
                    <h4 className="font-display font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                      {n.title}
                    </h4>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    {n.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {n.message}
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <span>Tap to inspect target context</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
