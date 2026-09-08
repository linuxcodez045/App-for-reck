/**
 * Reck Companion - Memory & Active Context Center
 * Categories: ABOUT YOU, PREFERENCES, PROJECTS, WORKFLOWS, DEVICES, LONG-TERM.
 * Distinguishes persistent memory from transient active context. Supports add/edit/delete.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import { MemoryCategory, MemoryItem } from '../../types';
import {
  Brain,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  ArrowLeft,
  Clock,
  CheckCircle2,
  FolderKanban,
  User,
  Sliders,
  Laptop,
  Compass
} from 'lucide-react';

export const MemoryView: React.FC = () => {
  const {
    memoryItems,
    saveMemoryItem,
    deleteMemoryItem,
    activeContext,
    setActiveScreen
  } = useReck();

  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'ALL'>('ALL');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('PREFERENCES');

  const categories: { id: MemoryCategory; label: string; icon: any }[] = [
    { id: 'ABOUT_YOU', label: 'About You', icon: User },
    { id: 'PREFERENCES', label: 'Preferences', icon: Sliders },
    { id: 'PROJECTS', label: 'Projects', icon: FolderKanban },
    { id: 'WORKFLOWS', label: 'Workflows', icon: Layers },
    { id: 'DEVICES', label: 'Devices', icon: Laptop },
    { id: 'LONG_TERM', label: 'Long-Term', icon: Compass }
  ];

  const filteredItems = memoryItems.filter(
    item => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    await saveMemoryItem({
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
      confidence: 1.0,
      isPersistent: true,
      source: 'Mobile User Entry'
    });

    setNewKey('');
    setNewValue('');
    setIsAddingItem(false);
  };

  return (
    <div className="flex-1 w-full px-4 pt-3 pb-8 space-y-4 animate-in fade-in duration-200">
      {/* Header with back navigation */}
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
              Reck Memory
            </h2>
            <p className="font-mono text-[10px] text-cyan-400">
              Persistent Knowledge & Active Context
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingItem(!isAddingItem)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition-all"
        >
          <Plus size={14} />
          <span>Add Knowledge</span>
        </button>
      </div>

      {/* SECTION 26: ACTIVE TEMPORARY CONTEXT (Visually distinct from persistent memory) */}
      {activeContext && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900/50 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>ACTIVE TEMPORARY CONTEXT</span>
            </span>
            <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded">
              Episodic Session
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-950/40 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Current Focus</span>
              <span className="text-white truncate block">{activeContext.currentProject}</span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Supervisor Device</span>
              <span className="text-cyan-300 truncate block">Reck Companion Mobile</span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Active Artifact</span>
              <span className="text-slate-300 truncate block">{activeContext.relevantFile}</span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Environment</span>
              <span className="text-emerald-400 truncate block">5G E2EE Link</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Form */}
      {isAddingItem && (
        <form onSubmit={handleCreateMemory} className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-in slide-in-from-top-2">
          <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
            Teach Reck Something New
          </h4>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400">Category</label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as MemoryCategory)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400">Concept / Key</label>
            <input
              type="text"
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              placeholder='e.g., "Favorite IDE", "Thesis Topic"'
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400">Knowledge Content</label>
            <textarea
              rows={2}
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="Provide exact details for Reck to remember..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="flex-1 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newKey.trim() || !newValue.trim()}
              className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold disabled:opacity-40"
            >
              Store Memory
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'bg-slate-900/60 text-slate-400 border border-white/5'
          }`}
        >
          All ({memoryItems.length})
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-900/60 text-slate-400 border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Memory Items List */}
      <div className="space-y-2.5">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 transition-all space-y-1.5 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded uppercase">
                  {item.category.replace('_', ' ')}
                </span>
                <span className="font-display font-bold text-xs text-white">
                  {item.key}
                </span>
              </div>

              <button
                onClick={() => deleteMemoryItem(item.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete memory"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {item.value}
            </p>

            <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Learned from: {item.source}</span>
              <span>Updated {item.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
