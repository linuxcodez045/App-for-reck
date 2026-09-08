/**
 * Reck Companion - Task Center
 * Categorized tasks (Active, Waiting, Waiting for Approval, Scheduled, Completed, Failed).
 * Shows source & target device, step progress, pause/resume/cancel/retry actions.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import { Task, TaskStatus } from '../../types';
import {
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  FileText,
  Clock,
  Laptop,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    tasks,
    approvals,
    setSelectedTaskId,
    setSelectedFilePreview,
    openBiometricApproval,
    pauseTask,
    resumeTask,
    retryTask,
    cancelTask
  } = useReck();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'WAITING' | 'COMPLETED'>('ALL');

  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return t.status === 'ACTIVE' || t.status === 'WAITING_FOR_APPROVAL';
    if (filter === 'WAITING') return t.status === 'WAITING' || t.status === 'SCHEDULED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED' || t.status === 'FAILED';
    return true;
  });

  return (
    <div className="flex-1 w-full px-4 pt-3 pb-8 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-white">
            Task Center
          </h2>
          <p className="font-mono text-[11px] text-slate-400">
            Multi-Device Execution Mesh
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 font-mono text-[10px] text-cyan-300">
          {tasks.filter(t => t.status === 'ACTIVE').length} Running
        </span>
      </div>

      {/* High-priority Pending Approval Banner if any exists */}
      {pendingApprovals.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold">
              <ShieldAlert size={16} className="animate-pulse" />
              <span>APPROVAL BLOCKING EXECUTION</span>
            </div>
            <span className="text-[10px] font-mono text-amber-300">
              {pendingApprovals[0].targetDeviceName}
            </span>
          </div>
          <p className="text-xs text-slate-200">
            {pendingApprovals[0].action}: <span className="font-mono text-cyan-300">{pendingApprovals[0].target}</span>
          </p>
          <div className="pt-1 flex items-center justify-end">
            <button
              onClick={() => openBiometricApproval(pendingApprovals[0])}
              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
            >
              Verify & Approve
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {(['ALL', 'ACTIVE', 'WAITING', 'COMPLETED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const isRunning = task.status === 'ACTIVE';

          return (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-cyan-500/30 transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isRunning ? 'bg-cyan-400 animate-pulse' : task.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                    <h4
                      onClick={() => setSelectedTaskId(task.id)}
                      className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {task.description}
                  </p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-semibold ${
                    task.status === 'ACTIVE'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : task.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.status}
                </span>
              </div>

              {/* Progress Bar & Current Step */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-slate-300">
                    Step {task.currentStepIndex + 1}/{task.steps.length}: {task.steps[task.currentStepIndex]?.title || 'Finished'}
                  </span>
                  <span>{task.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${task.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Device routing and controls */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-400">
                  <Laptop size={12} className="text-cyan-400" />
                  <span>Target: <strong className="text-white">{task.targetDevice}</strong></span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {task.resultFile && (
                    <button
                      onClick={() => setSelectedFilePreview(task.resultFile!)}
                      className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                      title="Preview Result File"
                    >
                      <FileText size={14} />
                    </button>
                  )}

                  {isRunning ? (
                    <button
                      onClick={() => pauseTask(task.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      title="Pause Task"
                    >
                      <Pause size={14} />
                    </button>
                  ) : task.status === 'WAITING' ? (
                    <button
                      onClick={() => resumeTask(task.id)}
                      className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 transition-colors"
                      title="Resume Task"
                    >
                      <Play size={14} />
                    </button>
                  ) : null}

                  <button
                    onClick={() => setSelectedTaskId(task.id)}
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-colors"
                  >
                    <span>Inspect</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
