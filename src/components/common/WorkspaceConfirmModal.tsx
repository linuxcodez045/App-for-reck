import React from 'react';
import { AlertTriangle, Send, Trash2, X } from 'lucide-react';

interface WorkspaceConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  icon?: 'trash' | 'send' | 'warning';
  details?: { label: string; value: string }[];
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const WorkspaceConfirmModal: React.FC<WorkspaceConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm Action',
  confirmVariant = 'danger',
  icon = 'warning',
  details,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/15 p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${
                confirmVariant === 'danger'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {icon === 'trash' ? (
                <Trash2 size={20} />
              ) : icon === 'send' ? (
                <Send size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {title}
              </h3>
              <p className="font-mono text-[10px] text-slate-400">
                Workspace Security Confirmation
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {description}
        </p>

        {/* Optional key-value details */}
        {details && details.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-1.5 text-xs">
            {details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <span className="text-slate-400 font-mono">{item.label}:</span>
                <span className="text-slate-200 font-medium text-right truncate max-w-[180px]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
          🔒 Explicit consent required before executing changes on your Google account.
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-white shadow-lg transition-all flex items-center justify-center space-x-1.5 ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-rose-950/40'
                : 'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 shadow-cyan-950/40'
            } disabled:opacity-50`}
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
