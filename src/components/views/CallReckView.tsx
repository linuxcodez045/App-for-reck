/**
 * Reck Companion - Call Reck Voice Session Screen
 * Dedicated full-screen secure internet voice experience.
 * Features the dynamic Reck Core, live transcription, quantum E2EE status, and minimal controls.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import { ReckCore } from '../core/ReckCore';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  ShieldCheck,
  Laptop,
  Terminal,
  ArrowRight,
  Sparkles,
  Cpu
} from 'lucide-react';

export const CallReckView: React.FC = () => {
  const {
    reckState,
    voiceSession,
    audioLevel,
    endCallReck,
    toggleCallMute,
    toggleCallSpeaker,
    dispatchRemoteCommand,
    devices
  } = useReck();

  const [simulatedVoicePrompt, setSimulatedVoicePrompt] = useState('');

  const targetDevice = devices.find(d => d.id === 'dev_pc_home') || devices[0];

  // Format call duration
  const minutes = Math.floor(voiceSession.durationSeconds / 60);
  const seconds = voiceSession.durationSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleVoiceCommand = (command: string) => {
    dispatchRemoteCommand('dev_pc_home', command);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] flex flex-col justify-between p-6 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Top Security & Session Header */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-wider text-white">
                CALL RECK
              </span>
            </div>
            <p className="font-mono text-[10px] text-slate-400">
              {voiceSession.encryptionState}
            </p>
          </div>
        </div>

        {/* Call Timer */}
        <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 font-mono text-xs font-semibold text-cyan-400">
          {formattedTime}
        </div>
      </div>

      {/* Target Device Context Banner */}
      <div className="mt-4 px-3 py-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Laptop size={14} className="text-cyan-400" />
          <span className="text-slate-300 font-mono">Active Target: <strong className="text-white">{targetDevice.name}</strong></span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
          Mesh Connected
        </span>
      </div>

      {/* Centerpiece: The Large Reactive Reck Core */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <ReckCore
          state={reckState}
          size="xl"
          audioLevel={audioLevel}
          interactive={false}
          showStateLabel={true}
        />

        {/* Live Conversation Transcript Display */}
        <div className="mt-6 w-full text-center px-4 space-y-2 max-w-sm">
          {voiceSession.transcript ? (
            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 animate-in fade-in">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                YOU SPOKE
              </span>
              <p className="text-sm text-cyan-200 font-medium">
                "{voiceSession.transcript}"
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-mono italic">
              {voiceSession.isMuted
                ? 'Microphone muted. Tap unmute below to speak.'
                : 'Listening... Speak naturally or test voice queries below.'}
            </p>
          )}

          {voiceSession.assistantResponse && (
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {voiceSession.assistantResponse}
            </p>
          )}
        </div>

        {/* Quick Voice Command Prompts for Instant Testing */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => handleVoiceCommand('PC par Chrome kholo')}
            className="text-[11px] font-mono px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all active:scale-95"
          >
            "PC par Chrome kholo"
          </button>
          <button
            onClick={() => handleVoiceCommand('Open Spotify on Home PC')}
            className="text-[11px] font-mono px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all active:scale-95"
          >
            "Open Spotify"
          </button>
          <button
            onClick={() => handleVoiceCommand('What is my PC battery/status?')}
            className="text-[11px] font-mono px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all active:scale-95"
          >
            "PC status?"
          </button>
        </div>
      </div>

      {/* Minimal Bottom Controls (Mute, Speaker, End Session) */}
      <div className="pb-6 pt-2 flex items-center justify-center space-x-6">
        {/* Mute Toggle */}
        <button
          onClick={toggleCallMute}
          className={`p-4 rounded-2xl border transition-all active:scale-95 ${
            voiceSession.isMuted
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
          }`}
          aria-label={voiceSession.isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {voiceSession.isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* End Session Button (Distinct Red Pill) */}
        <button
          onClick={endCallReck}
          className="p-5 rounded-3xl bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-950/40 transition-all active:scale-95"
          aria-label="End Call Reck session"
        >
          <PhoneOff size={26} />
        </button>

        {/* Speaker Mode Toggle */}
        <button
          onClick={toggleCallSpeaker}
          className={`p-4 rounded-2xl border transition-all active:scale-95 ${
            voiceSession.isSpeakerOn
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
          }`}
          aria-label="Toggle speaker audio"
        >
          {voiceSession.isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </div>
    </div>
  );
};
