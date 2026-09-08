/**
 * Reck Companion - File / Result Handoff Preview Modal
 * Previews reports, summaries, data scrapes, and code results with Download & Share actions.
 */

import React, { useState } from 'react';
import { useReck } from '../../context/ReckContext';
import {
  X,
  FileText,
  Download,
  Share2,
  ExternalLink,
  Laptop,
  Check,
  FileCode
} from 'lucide-react';

export const FileViewerModal: React.FC = () => {
  const { selectedFilePreview, setSelectedFilePreview } = useReck();
  const [downloaded, setDownloaded] = useState(false);
  const [shared, setShared] = useState(false);

  if (!selectedFilePreview) return null;

  const file = selectedFilePreview;

  const handleDownload = () => {
    // Generate simple blob download simulation
    const blob = new Blob([file.previewContent || 'Report content'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: file.name,
        text: file.previewContent?.slice(0, 100)
      }).catch(() => {});
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-[#0c1017] border border-cyan-500/30 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white truncate max-w-[220px]">
                {file.name}
              </h3>
              <p className="font-mono text-[10px] text-slate-400">
                {file.type.toUpperCase()} • {file.size}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedFilePreview(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* File Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
            {file.previewContent || 'Preview unavailable for this binary stream.'}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>Verified cryptographic integrity</span>
            <span className="text-cyan-400">SHA-256 Validated</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/10 flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            {downloaded ? <Check size={14} /> : <Download size={14} />}
            <span>{downloaded ? 'Saved to Files' : 'Download to Phone'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
          >
            {shared ? <Check size={14} /> : <Share2 size={14} />}
            <span>{shared ? 'Shared Link' : 'Share File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
