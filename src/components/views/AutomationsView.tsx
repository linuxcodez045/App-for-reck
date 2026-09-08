/**
 * Reck Companion - Automations & Reminders Center
 * Categories: NOW, UPCOMING, RECURRING, WATCHING.
 * Displays scheduled workflows, trigger conditions, and reminder executions.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import {
  Zap,
  Clock,
  RotateCw,
  Eye,
  Check,
  Plus,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Laptop,
  Bell
} from 'lucide-react';

export const AutomationsView: React.FC = () => {
  const { automations, toggleAutomation, setActiveScreen } = useReck();
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'RECURRING' | 'WATCHING'>('ALL');

  const filtered = automations.filter(
    a => filter === 'ALL' || a.type === filter
  );

  return (
    <div className="flex-1 w-full px-4 pt-3 pb-8 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveScreen('home')}
            className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-display font-bold text-lg text-white">
              Automations & Reminders
            </h2>
            <p className="font-mono text-[10px] text-cyan-400">
              Autonomous Mesh Triggers & Scrapes
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('New automation rule builder opened.')}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition-all"
        >
          <Plus size={14} />
          <span>New Rule</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {(['ALL', 'UPCOMING', 'RECURRING', 'WATCHING'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-900/60 text-slate-400 border border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {filtered.map(auto => {
          const isRecurring = auto.type === 'RECURRING';
          const isWatching = auto.type === 'WATCHING';
          const isUpcoming = auto.type === 'UPCOMING';

          return (
            <div
              key={auto.id}
              className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2.5 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-xl ${
                      isWatching
                        ? 'bg-amber-500/15 text-amber-400'
                        : isRecurring
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'bg-blue-500/15 text-blue-300'
                    }`}
                  >
                    {isWatching ? <Eye size={16} /> : isRecurring ? <RotateCw size={16} /> : <Clock size={16} />}
                  </div>

                  <div>
                    <span className="font-display font-bold text-sm text-white block">
                      {auto.title}
                    </span>
                    <span className="font-mono text-[10px] text-cyan-400 block">
                      {auto.scheduleDescription}
                    </span>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => toggleAutomation(auto.id, !auto.enabled)}
                  className={`p-1 transition-colors ${auto.enabled ? 'text-cyan-400' : 'text-slate-600'}`}
                  title={auto.enabled ? 'Disable automation' : 'Enable automation'}
                >
                  {auto.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                {auto.actionSummary}
              </p>

              {auto.conditionDescription && (
                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                  <Eye size={12} />
                  <span>Condition: {auto.conditionDescription}</span>
                </div>
              )}

              <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Executes on: <strong className="text-slate-300">{auto.targetDevice}</strong></span>
                {auto.nextRun && <span>Next: {auto.nextRun}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
