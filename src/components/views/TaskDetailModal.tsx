/**
 * Reck Companion - Task Detail View & Execution Graph
 * Displays user-facing linear step breakdown (✓ completed, ● running, ○ pending),
 * source/target telemetry, and cross-device handoff ("Phone pe bhej do").
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Laptop,
  Pause,
  Play,
  RotateCcw,
  XCircle,
  FileText,
  Download,
  Share2,
  Smartphone,
  Check
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    pauseTask,
    resumeTask,
    cancelTask,
    retryTask,
    handoffTaskFileToPhone,
    setSelectedFilePreview
  } = useReck();

  const [handoffDone, setHandoffDone] = useState(false);

  const task = tasks.find(t => t.id === selectedTaskId);
  if (!task) return null;

  const handleHandoff = async () => {
    await handoffTaskFileToPhone(task.id);
    setHandoffDone(true);
    setTimeout(() => setHandoffDone(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[90vh] bg-[#0c1017] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
                TASK EXECUTION TELEMETRY
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-white mt-0.5">
              {task.title}
            </h3>
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Metadata banner */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Source Device</span>
              <span className="text-white">{task.sourceDevice}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Target Device</span>
              <span className="text-cyan-300">{task.targetDevice}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Started</span>
              <span className="text-slate-300">{task.startedAt}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Status</span>
              <span className="text-emerald-400 font-bold uppercase">{task.status}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
              OBJECTIVE OVERVIEW
            </span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-white/5">
              {task.description}
            </p>
          </div>

          {/* Execution Pipeline Steps (Section 20 requirement: Sources ✓, Analysis ✓, Summary ●, Document ○, Save ○) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                EXECUTION STRUCTURE ({task.progressPercent}%)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Step {task.currentStepIndex + 1} of {task.steps.length}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/5 space-y-3">
              {task.steps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isRunning = step.status === 'running';
                const isPending = step.status === 'pending';

                return (
                  <div key={step.id} className="flex items-start space-x-3 text-xs">
                    {/* Visual Glyph: ✓ or ● or ○ */}
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          ✓
                        </div>
                      ) : isRunning ? (
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs animate-pulse">
                          ●
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs">
                          ○
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${isRunning ? 'text-cyan-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                          {step.title}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                          {step.status}
                        </span>
                      </div>
                      {step.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result File & Multi-Device Handoff ("Phone pe bhej do") */}
          {task.resultFile && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                GENERATED ARTIFACT RESULT
              </span>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs font-semibold text-white block truncate">
                    {task.resultFile.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {task.resultFile.size} • on {task.targetDevice}
                  </span>
                </div>
              </div>

              {/* Handoff Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setSelectedFilePreview(task.resultFile!)}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-sans text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <FileText size={14} />
                  <span>Preview File</span>
                </button>

                <button
                  onClick={handleHandoff}
                  disabled={handoffDone}
                  className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  {handoffDone ? (
                    <>
                      <Check size={14} />
                      <span>Synced to Phone</span>
                    </>
                  ) : (
                    <>
                      <Smartphone size={14} />
                      <span>"Phone pe bhej do"</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Task Lifecycle Actions */}
          <div className="pt-2 flex items-center space-x-2">
            {task.status === 'ACTIVE' && (
              <button
                onClick={() => pauseTask(task.id)}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                <Pause size={13} />
                <span>Pause Task</span>
              </button>
            )}

            {task.status === 'WAITING' && (
              <button
                onClick={() => resumeTask(task.id)}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors"
              >
                <Play size={13} />
                <span>Resume Task</span>
              </button>
            )}

            <button
              onClick={() => retryTask(task.id)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono transition-colors"
              title="Restart / Retry"
            >
              <RotateCcw size={14} />
            </button>

            {task.status !== 'CANCELLED' && (
              <button
                onClick={() => cancelTask(task.id)}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono transition-colors"
                title="Cancel Task"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
