/**
 * Reck Companion - Connected Services & Integrations View
 * Manages Google, Gmail, Calendar, GitHub, and Spotify links with real-time sync states.
 */

import React from 'react';
import { useReck } from '../../context/ReckContext';
import {
  Layers,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Key
} from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { integrations, setActiveScreen } = useReck();

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
            Connected Services
          </h2>
          <p className="font-mono text-[10px] text-cyan-400">
            Ecosystem Integrations & Data Feeds
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Reck aggregates context across your personal tools with strict token sandboxing and zero telemetry leakage.
      </p>

      {/* Services List */}
      <div className="space-y-3">
        {integrations.map(integ => (
          <div
            key={integ.id}
            className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-white">
                  {integ.name}
                </h4>
                <p className="font-mono text-[11px] text-slate-400">
                  {integ.accountEmail}
                </p>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                  integ.status === 'CONNECTED'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {integ.status}
              </span>
            </div>

            {/* Scopes badge list */}
            <div className="flex flex-wrap gap-1">
              {integ.scopes.map((s, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono text-cyan-300/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] text-slate-400">
                Last synced: {integ.lastSynced}
              </span>

              <button
                onClick={() => alert(`Synchronized ${integ.name} data channel.`)}
                className="flex items-center space-x-1 font-mono text-xs text-cyan-400 hover:underline"
              >
                <RefreshCw size={11} />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
