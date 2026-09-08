/**
 * Reck Companion - Text Conversation & Command Terminal
 * Not just standard chat bubbles: renders live device references, task status objects,
 * command routing pipelines, and secure file results.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useReck } from '../../context/ReckContext';
import { ReckCore } from '../core/ReckCore';
import {
  Send,
  Laptop,
  ArrowRight,
  FileText,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

export const TextChatView: React.FC = () => {
  const {
    messages,
    sendChatMessage,
    devices,
    reckState,
    setActiveScreen,
    setSelectedFilePreview,
    startCallReck
  } = useReck();

  const [inputText, setInputText] = useState('');
  const [targetDeviceId, setTargetDeviceId] = useState<string>('dev_pc_home');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetDevice = devices.find(d => d.id === targetDeviceId) || devices[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, reckState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    sendChatMessage(text, targetDeviceId);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendChatMessage(prompt, targetDeviceId);
  };

  return (
    <div className="flex-1 w-full flex flex-col h-full bg-[#07090e] max-w-md mx-auto animate-in fade-in duration-200">
      {/* Top Chat Bar with Reck Core & Device Selector */}
      <div className="sticky top-0 z-20 px-4 py-2.5 bg-[#07090e]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveScreen('home')}
            className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <ReckCore state={reckState} size="sm" interactive={false} />

          <div>
            <h3 className="font-display font-bold text-xs text-white">
              Reck Assistant
            </h3>
            <p className="font-mono text-[10px] text-cyan-400">
              State: {reckState}
            </p>
          </div>
        </div>

        {/* Target Device Selector Pill */}
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-[11px] font-mono">
          <Laptop size={12} className="text-cyan-400" />
          <select
            value={targetDeviceId}
            onChange={e => setTargetDeviceId(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            {devices.map(d => (
              <option key={d.id} value={d.id} className="bg-slate-950 text-slate-200">
                {d.name} {d.isOnline ? '' : '(Offline)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              {/* Sender label and time */}
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 mb-1 px-1">
                <span>{isUser ? 'You' : 'Reck'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.targetDevice && (
                  <span className="text-cyan-400/80">• via {msg.targetDevice}</span>
                )}
              </div>

              {/* Message Payload Body */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/20 border border-cyan-500/40 text-cyan-100 rounded-tr-sm shadow-md'
                    : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-sm shadow-md'
                }`}
              >
                <p>{msg.content}</p>

                {/* Pipeline Execution Node Visualization if available */}
                {msg.commandPipeline && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                      COMMAND TRANSMISSION ROUTE
                    </span>
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
                      <span>{msg.commandPipeline.origin}</span>
                      <ArrowRight size={10} className="text-slate-400" />
                      <span>{msg.commandPipeline.hub}</span>
                      <ArrowRight size={10} className="text-slate-400" />
                      <span className="font-bold text-white">{msg.commandPipeline.target}</span>
                    </div>
                    <div className="pt-1 flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400">
                      <CheckCircle2 size={12} />
                      <span>Target Process Executed Successfully</span>
                    </div>
                  </div>
                )}

                {/* Result Attachment / File Card (e.g. School Report PDF) */}
                {msg.attachment && (
                  <div className="mt-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-mono text-xs font-semibold text-white truncate">
                          {msg.attachment.name}
                        </h5>
                        <p className="text-[10px] font-mono text-cyan-300/80">
                          {msg.attachment.size} • from {msg.attachment.generatedByDevice}
                        </p>
                      </div>
                    </div>

                    {msg.attachment.contentPreview && (
                      <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-white/5 line-clamp-2 italic font-mono">
                        "{msg.attachment.contentPreview}"
                      </p>
                    )}

                    <div className="pt-1 flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedFilePreview(msg.attachment!)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-center text-xs font-bold transition-colors"
                      >
                        Preview Document
                      </button>
                      <button
                        onClick={() => alert(`Shared ${msg.attachment?.name} with system share sheet.`)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Share File"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Thinking / Executing Typing indicator */}
        {(reckState === 'THINKING' || reckState === 'EXECUTING') && (
          <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900/50 border border-white/5 w-fit text-[11px] font-mono text-cyan-400 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Reck is {reckState.toLowerCase()}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-ups (Matching exact master prompt dialogue) */}
      <div className="px-4 py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar border-t border-white/5">
        <button
          onClick={() => handleSuggestedPrompt('PC wala report complete hua?')}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
        >
          "PC wala report complete hua?"
        </button>
        <button
          onClick={() => handleSuggestedPrompt('Phone pe bhej do')}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
        >
          "Phone pe bhej do"
        </button>
        <button
          onClick={() => handleSuggestedPrompt('PC par Chrome kholo')}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
        >
          "PC par Chrome kholo"
        </button>
      </div>

      {/* Message Input Footer */}
      <div className="p-3 bg-[#07090e] border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Message Reck (target: ${targetDevice.name})...`}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
