/**
 * Reck Companion - Mobile Device Shell
 * Provides an authentic mobile frame with status bar, notch/pill, and viewport toggle.
 */

import React, { useState, ReactNode } from 'react';
import { Smartphone, Maximize2, Wifi, BatteryMedium } from 'lucide-react';

interface DeviceFrameProps {
  children: ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [isFramed, setIsFramed] = useState(true);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen w-full bg-[#040508] flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 transition-colors">
      {/* Top Bar for Desktop Viewers: Switch between Mobile Frame & Responsive */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-semibold tracking-wider">RECK COMPANION MOBILE SHELL</span>
        </div>
        <button
          onClick={() => setIsFramed(!isFramed)}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all"
        >
          {isFramed ? <Maximize2 size={12} /> : <Smartphone size={12} />}
          <span>{isFramed ? 'Expand Full' : 'Phone Frame'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          isFramed
            ? 'max-w-[420px] h-[100vh] sm:h-[880px] bg-[#07090e] sm:rounded-[44px] sm:border-[5px] sm:border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10'
            : 'max-w-xl min-h-screen bg-[#07090e] border-x border-white/5'
        }`}
      >
        {/* Mobile Bezel Status Bar */}
        <div className="relative z-40 w-full px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none bg-[#07090e]/90 backdrop-blur-md">
          <span>{currentTime}</span>

          {/* Dynamic Island / Speaker Pill */}
          <div className="w-24 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center space-x-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          </div>

          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="text-[10px] font-bold tracking-tighter">5G</span>
            <Wifi size={12} />
            <BatteryMedium size={14} className="text-emerald-400" />
          </div>
        </div>

        {/* Viewport Content */}
        <div className="relative flex-1 w-full overflow-y-auto pb-24 overflow-x-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
