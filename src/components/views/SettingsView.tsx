/**
 * Reck Companion - Settings View
 * Manages language profiles (Hinglish / English / Hindi), voice synthesis, haptic feedback, and connectivity.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import {
  Settings,
  ArrowLeft,
  Languages,
  Mic,
  Volume2,
  Shield,
  Smartphone,
  Check,
  Moon,
  Wifi
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { userProfile, updateUserProfile, setActiveScreen } = useReck();

  const [language, setLanguage] = useState<'hinglish' | 'en' | 'hi'>(
    userProfile?.preferredLanguage || 'hinglish'
  );
  const [speechRate, setSpeechRate] = useState(1.0);
  const [haptics, setHaptics] = useState(true);

  const handleLanguageChange = (lang: 'hinglish' | 'en' | 'hi') => {
    setLanguage(lang);
    updateUserProfile({ preferredLanguage: lang });
  };

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
            Companion Settings
          </h2>
          <p className="font-mono text-[10px] text-cyan-400">
            Voice, Language & Interaction Behavior
          </p>
        </div>
      </div>

      {/* SECTION 31: VOICE / LANGUAGE SETTINGS */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
          LANGUAGE & MULTILINGUAL REASONING
        </span>
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
          <div className="flex items-center space-x-2 text-xs text-white">
            <Languages size={16} className="text-cyan-400" />
            <span className="font-bold">Conversational Dialect</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'hinglish' as const, label: 'Hinglish', desc: 'Hindi + English natural blend' },
              { id: 'en' as const, label: 'English', desc: 'Strict English technical phrasing' },
              { id: 'hi' as const, label: 'Hindi', desc: 'Devanagari conversational' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => handleLanguageChange(l.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  language === l.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white'
                    : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs">{l.label}</span>
                  {language === l.id && <Check size={12} className="text-cyan-400" />}
                </div>
                <span className="text-[9px] font-mono text-slate-400 block mt-1">
                  {l.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio & Speech Synthesis */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
          VOICE SYNTHESIS & ACOUSTICS
        </span>
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-white">
              <Volume2 size={16} className="text-cyan-400" />
              <span>Voice Playback Rate</span>
            </div>
            <span className="font-mono text-cyan-300 text-xs">{speechRate}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.05"
            value={speechRate}
            onChange={e => setSpeechRate(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-200">Haptic Tap Feedback</span>
            <input
              type="checkbox"
              checked={haptics}
              onChange={e => setHaptics(e.target.checked)}
              className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Visual Identity & Theme Note */}
      <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/5 text-xs space-y-1">
        <span className="font-mono text-[10px] text-slate-400 uppercase block">
          VISUAL IDENTITY ARCHETYPE
        </span>
        <p className="text-slate-300">
          Reck Computational Dark (OLED Black #07090E with Quantum Harmonic Core).
        </p>
      </div>
    </div>
  );
};
