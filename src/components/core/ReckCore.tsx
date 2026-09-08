/**
 * The Reck Core - Dynamic Computational Structure
 * Central visual identity representing the cognitive and execution state of Reck.
 * Encodes meaning through geometric harmonics, orbital rotation, and data lattice nodes.
 */

import React from 'react';
import { ReckState } from '../../types';

interface ReckCoreProps {
  state?: ReckState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  audioLevel?: number; // 0.0 to 1.0 for voice reactivity
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  showStateLabel?: boolean;
}

export const ReckCore: React.FC<ReckCoreProps> = ({
  state = 'IDLE',
  size = 'lg',
  audioLevel = 0,
  interactive = true,
  onClick,
  className = '',
  showStateLabel = false
}) => {
  // Dimensions map
  const sizeMap = {
    sm: { box: 56, inner: 16, ring1: 22, ring2: 26, stroke: 1.5 },
    md: { box: 110, inner: 30, ring1: 42, ring2: 50, stroke: 1.75 },
    lg: { box: 210, inner: 56, ring1: 82, ring2: 98, stroke: 2 },
    xl: { box: 280, inner: 74, ring1: 108, ring2: 132, stroke: 2.25 }
  };

  const dim = sizeMap[size];

  // Palette & dynamics encoding state
  const stateConfig: Record<
    ReckState,
    {
      primary: string;
      secondary: string;
      accent: string;
      glowColor: string;
      pulseSpeed: string;
      ring1Speed: string;
      ring2Speed: string;
      statusText: string;
      statusDescription: string;
    }
  > = {
    IDLE: {
      primary: '#06b6d4', // Cyan
      secondary: '#3b82f6', // Cobalt
      accent: '#67e8f9',
      glowColor: 'rgba(6, 182, 212, 0.25)',
      pulseSpeed: 'animate-[pulse_4s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_24s_linear_infinite]',
      ring2Speed: 'animate-[spin_36s_linear_infinite_reverse]',
      statusText: 'IDLE',
      statusDescription: 'Reck Active • Supervised Link'
    },
    LISTENING: {
      primary: '#10b981', // Emerald
      secondary: '#06b6d4',
      accent: '#6ee7b7',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      pulseSpeed: 'animate-[pulse_1.5s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_10s_linear_infinite]',
      ring2Speed: 'animate-[spin_15s_linear_infinite_reverse]',
      statusText: 'LISTENING',
      statusDescription: 'Capturing Speech Input'
    },
    UNDERSTANDING: {
      primary: '#8b5cf6', // Violet
      secondary: '#06b6d4',
      accent: '#c4b5fd',
      glowColor: 'rgba(139, 92, 246, 0.35)',
      pulseSpeed: 'animate-[pulse_1.2s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_8s_linear_infinite]',
      ring2Speed: 'animate-[spin_12s_linear_infinite_reverse]',
      statusText: 'UNDERSTANDING',
      statusDescription: 'Parsing Context & Intent'
    },
    THINKING: {
      primary: '#6366f1', // Indigo
      secondary: '#a855f7',
      accent: '#818cf8',
      glowColor: 'rgba(99, 102, 241, 0.35)',
      pulseSpeed: 'animate-[pulse_1s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_6s_linear_infinite]',
      ring2Speed: 'animate-[spin_8s_linear_infinite_reverse]',
      statusText: 'THINKING',
      statusDescription: 'Reasoning Across Memory & Mesh'
    },
    PLANNING: {
      primary: '#3b82f6', // Blue
      secondary: '#06b6d4',
      accent: '#93c5fd',
      glowColor: 'rgba(59, 130, 246, 0.35)',
      pulseSpeed: 'animate-[pulse_1.8s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_9s_linear_infinite]',
      ring2Speed: 'animate-[spin_14s_linear_infinite_reverse]',
      statusText: 'PLANNING',
      statusDescription: 'Formulating Action Pipeline'
    },
    EXECUTING: {
      primary: '#0ea5e9', // Sky blue
      secondary: '#22c55e',
      accent: '#38bdf8',
      glowColor: 'rgba(14, 165, 233, 0.45)',
      pulseSpeed: 'animate-[pulse_0.8s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_4s_linear_infinite]',
      ring2Speed: 'animate-[spin_6s_linear_infinite_reverse]',
      statusText: 'EXECUTING',
      statusDescription: 'Active Task Running on Device'
    },
    SPEAKING: {
      primary: '#06b6d4', // Cyan
      secondary: '#14b8a6',
      accent: '#a5f3fc',
      glowColor: 'rgba(6, 182, 212, 0.45)',
      pulseSpeed: 'animate-[pulse_1s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_7s_linear_infinite]',
      ring2Speed: 'animate-[spin_11s_linear_infinite_reverse]',
      statusText: 'SPEAKING',
      statusDescription: 'Synthesizing Spoken Output'
    },
    WAITING_FOR_APPROVAL: {
      primary: '#f59e0b', // Amber alert
      secondary: '#ef4444',
      accent: '#fcd34d',
      glowColor: 'rgba(245, 158, 11, 0.45)',
      pulseSpeed: 'animate-[pulse_1.2s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_18s_linear_infinite]',
      ring2Speed: 'animate-[spin_18s_linear_infinite_reverse]',
      statusText: 'WAITING FOR APPROVAL',
      statusDescription: 'Action Scope Requires Step-Up'
    },
    OFFLINE: {
      primary: '#64748b', // Slate
      secondary: '#475569',
      accent: '#94a3b8',
      glowColor: 'rgba(100, 116, 139, 0.1)',
      pulseSpeed: '',
      ring1Speed: '',
      ring2Speed: '',
      statusText: 'OFFLINE',
      statusDescription: 'Device Hub Link Disconnected'
    },
    ERROR: {
      primary: '#ef4444', // Red
      secondary: '#dc2626',
      accent: '#fca5a5',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      pulseSpeed: 'animate-[pulse_0.7s_ease-in-out_infinite]',
      ring1Speed: 'animate-[spin_5s_linear_infinite]',
      ring2Speed: 'animate-[spin_7s_linear_infinite_reverse]',
      statusText: 'ERROR',
      statusDescription: 'Execution Fault Encountered'
    }
  };

  const cfg = stateConfig[state];

  // Dynamic audio scale for speech/listening
  const audioMod = state === 'LISTENING' || state === 'SPEAKING' ? 1 + audioLevel * 0.35 : 1;

  const center = dim.box / 2;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : undefined}
        aria-label={`Reck Core: Current state is ${state}`}
        className={`relative flex items-center justify-center transition-all duration-300 ${
          interactive ? 'cursor-pointer active:scale-95 group' : ''
        }`}
        style={{
          width: dim.box,
          height: dim.box
        }}
      >
        {/* Ambient Subtle Computational Field */}
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${cfg.glowColor} 0%, rgba(7, 9, 14, 0) 70%)`,
            transform: `scale(${audioMod})`
          }}
        />

        {/* SVG Computational Geometry */}
        <svg
          width={dim.box}
          height={dim.box}
          viewBox={`0 0 ${dim.box} ${dim.box}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 overflow-visible"
        >
          {/* Static Concentric Range Grid */}
          <circle
            cx={center}
            cy={center}
            r={dim.ring2 + 2}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />

          {/* Outer Ring 2 - Segmented Computational Track */}
          <g className={cfg.ring2Speed} style={{ transformOrigin: `${center}px ${center}px` }}>
            <circle
              cx={center}
              cy={center}
              r={dim.ring2}
              stroke={cfg.secondary}
              strokeWidth={dim.stroke}
              strokeDasharray={state === 'OFFLINE' ? '4 12' : '16 28 8 14 36 20'}
              strokeOpacity={state === 'OFFLINE' ? 0.3 : 0.65}
            />

            {/* Perimeter Orbital Quantum Nodes */}
            {state !== 'OFFLINE' && (
              <>
                <circle cx={center} cy={center - dim.ring2} r={dim.stroke * 1.5} fill={cfg.accent} />
                <circle cx={center} cy={center + dim.ring2} r={dim.stroke * 1.2} fill={cfg.primary} />
                <circle cx={center - dim.ring2} cy={center} r={dim.stroke * 1.3} fill={cfg.secondary} />
                <circle cx={center + dim.ring2} cy={center} r={dim.stroke * 1.1} fill={cfg.accent} />
              </>
            )}
          </g>

          {/* Intermediate Data Track Ring 1 */}
          <g className={cfg.ring1Speed} style={{ transformOrigin: `${center}px ${center}px` }}>
            <circle
              cx={center}
              cy={center}
              r={dim.ring1}
              stroke={cfg.primary}
              strokeWidth={dim.stroke}
              strokeDasharray={state === 'OFFLINE' ? '3 14' : '24 16 12 18'}
              strokeOpacity={state === 'OFFLINE' ? 0.25 : 0.85}
            />

            {/* Angular Bracket Markers */}
            {size !== 'sm' && state !== 'OFFLINE' && (
              <g stroke={cfg.accent} strokeWidth="1.2" opacity="0.75">
                <path d={`M ${center - dim.ring1 + 4} ${center - 4} L ${center - dim.ring1} ${center} L ${center - dim.ring1 + 4} ${center + 4}`} />
                <path d={`M ${center + dim.ring1 - 4} ${center - 4} L ${center + dim.ring1} ${center} L ${center + dim.ring1 - 4} ${center + 4}`} />
              </g>
            )}
          </g>

          {/* Central Singularity Node & Harmonic Iris */}
          <g
            className={cfg.pulseSpeed}
            style={{
              transformOrigin: `${center}px ${center}px`,
              transform: `scale(${audioMod})`
            }}
          >
            {/* Hexagonal / Diamond computational lattice */}
            <polygon
              points={`
                ${center},${center - dim.inner}
                ${center + dim.inner * 0.866},${center - dim.inner * 0.5}
                ${center + dim.inner * 0.866},${center + dim.inner * 0.5}
                ${center},${center + dim.inner}
                ${center - dim.inner * 0.866},${center + dim.inner * 0.5}
                ${center - dim.inner * 0.866},${center - dim.inner * 0.5}
              `}
              fill="rgba(10, 15, 24, 0.9)"
              stroke={cfg.primary}
              strokeWidth={dim.stroke * 1.2}
            />

            {/* Inner Core Solid Luminescence */}
            <circle
              cx={center}
              cy={center}
              r={dim.inner * 0.45}
              fill={cfg.accent}
              opacity={state === 'OFFLINE' ? 0.3 : 0.9}
            />

            {/* Internal Quantum Dot */}
            <circle
              cx={center}
              cy={center}
              r={dim.stroke * 1.2}
              fill="#ffffff"
            />
          </g>

          {/* Security / Approval Brackets */}
          {state === 'WAITING_FOR_APPROVAL' && (
            <g stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.9">
              <path d={`M ${center - 18} ${center - 24} H ${center + 18}`} />
              <path d={`M ${center - 18} ${center + 24} H ${center + 18}`} />
              <circle cx={center} cy={center} r={dim.ring2 + 8} stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 6" />
            </g>
          )}

          {/* Error Cross-Ticks */}
          {state === 'ERROR' && (
            <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <line x1={center - 6} y1={center - 6} x2={center + 6} y2={center + 6} />
              <line x1={center + 6} y1={center - 6} x2={center - 6} y2={center + 6} />
            </g>
          )}
        </svg>

        {/* Interactive hover indicator border */}
        {interactive && (
          <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-cyan-500/20 transition-all duration-300 pointer-events-none" />
        )}
      </div>

      {/* State Readout Typography */}
      {showStateLabel && (
        <div className="mt-4 flex flex-col items-center text-center">
          <div className="flex items-center space-x-2">
            <span
              className="inline-block w-2 h-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: cfg.primary }}
            />
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-200">
              {cfg.statusText}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-[200px] truncate">
            {cfg.statusDescription}
          </p>
        </div>
      )}
    </div>
  );
};
