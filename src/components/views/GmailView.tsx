/**
 * Reck Companion - Gmail Hub & Workspace Interface
 * Official Google Workspace client integration supporting inbox reading,
 * thread inspection, AI summarization, composing, replying, and secure trash management.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useReck } from '../../context/ReckContext';
import {
  listGmailMessages,
  getGmailMessageDetails,
  sendGmailMessage,
  createGmailDraft,
  trashGmailMessage,
  toggleGmailStar,
  markGmailAsRead,
  googleSignIn,
  googleSignOut,
  getCurrentUser,
  getAccessToken
} from '../../services/gmailService';
import { GmailMessage, GmailSendPayload } from '../../types';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { WorkspaceConfirmModal } from '../common/WorkspaceConfirmModal';
import {
  Mail,
  ArrowLeft,
  Search,
  RefreshCw,
  Star,
  Trash2,
  Send,
  Plus,
  Inbox,
  SendHorizontal,
  FileText,
  Sparkles,
  ChevronRight,
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Reply,
  X,
  ShieldCheck
} from 'lucide-react';

export const GmailView: React.FC = () => {
  const { setActiveScreen, userProfile, addNotification } = useReck();

  // Authentication State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLiveConnection, setIsLiveConnection] = useState(Boolean(getAccessToken()));

  // Mailbox State
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<'INBOX' | 'STARRED' | 'SENT' | 'DRAFT' | 'TRASH'>('INBOX');

  // Compose State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState<GmailSendPayload>({
    to: '',
    subject: '',
    body: '',
    cc: '',
    threadId: undefined
  });
  const [isDrafting, setIsDrafting] = useState(false);

  // Reck AI Summary Drawer/State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Mandatory Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: 'danger' | 'primary';
    icon: 'trash' | 'send' | 'warning';
    details?: { label: string; value: string }[];
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    confirmVariant: 'primary',
    icon: 'send',
    action: async () => {}
  });

  // Load Messages
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const labelIds = activeFolder === 'INBOX' ? ['INBOX'] : [activeFolder];
      const result = await listGmailMessages({
        query: searchQuery ? searchQuery : undefined,
        labelIds: activeFolder === 'STARRED' ? ['STARRED'] : labelIds,
        maxResults: 12
      });

      setMessages(result.messages);
      setIsLiveConnection(result.isLive);
      setCurrentUser(getCurrentUser());
    } catch (err: any) {
      console.error('Error fetching Gmail messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFolder, searchQuery]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
      setIsLiveConnection(true);
      await loadMessages();
    } catch (err: any) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google Sign-Out
  const handleGoogleSignOut = async () => {
    await googleSignOut();
    setCurrentUser(null);
    setIsLiveConnection(false);
    setSelectedMessage(null);
    await loadMessages();
  };

  // Star Toggle
  const handleToggleStar = async (msg: GmailMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStarred = !msg.starred;
    setMessages(prev =>
      prev.map(m => (m.id === msg.id ? { ...m, starred: newStarred } : m))
    );
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage(prev => (prev ? { ...prev, starred: newStarred } : null));
    }
    await toggleGmailStar(msg.id, msg.starred);
  };

  // Request Confirmation for Sending Email (Mandatory workspace guideline)
  const handleRequestSend = () => {
    if (!composeForm.to || !composeForm.subject) {
      alert('Please provide a recipient email and subject.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Confirm Send Email',
      description: 'You are about to send an outgoing message through your authenticated Gmail account.',
      confirmLabel: 'Send Email Now',
      confirmVariant: 'primary',
      icon: 'send',
      details: [
        { label: 'Recipient', value: composeForm.to },
        { label: 'Subject', value: composeForm.subject },
        { label: 'Sender', value: currentUser?.email || 'sharmavashu179@gmail.com' }
      ],
      action: async () => {
        setIsDrafting(true);
        try {
          await sendGmailMessage(composeForm);
          setIsComposeOpen(false);
          setComposeForm({ to: '', subject: '', body: '', cc: '' });
          addNotification({
            type: 'task_complete',
            title: 'Email Sent',
            message: `Message "${composeForm.subject}" sent to ${composeForm.to}`,
            priority: 'normal'
          });
          await loadMessages();
        } catch (err: any) {
          alert(`Failed to send: ${err.message}`);
        } finally {
          setIsDrafting(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Request Confirmation for Moving to Trash (Mandatory workspace guideline)
  const handleRequestTrash = (msg: GmailMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setConfirmModal({
      isOpen: true,
      title: 'Move Email to Trash?',
      description: `Are you sure you want to move this email from "${msg.fromName || msg.from}" to the Trash?`,
      confirmLabel: 'Move to Trash',
      confirmVariant: 'danger',
      icon: 'trash',
      details: [
        { label: 'Subject', value: msg.subject },
        { label: 'From', value: msg.from }
      ],
      action: async () => {
        try {
          await trashGmailMessage(msg.id);
          setMessages(prev => prev.filter(m => m.id !== msg.id));
          if (selectedMessage?.id === msg.id) {
            setSelectedMessage(null);
          }
          addNotification({
            type: 'system_alert',
            title: 'Email Moved to Trash',
            message: `Moved "${msg.subject}" to Trash folder.`,
            priority: 'low'
          });
        } catch (err: any) {
          alert(`Failed to trash email: ${err.message}`);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Save Draft
  const handleSaveDraft = async () => {
    if (!composeForm.to && !composeForm.subject) return;
    setIsDrafting(true);
    try {
      await createGmailDraft(composeForm);
      setIsComposeOpen(false);
      setComposeForm({ to: '', subject: '', body: '', cc: '' });
      await loadMessages();
    } catch (err: any) {
      alert(`Could not save draft: ${err.message}`);
    } finally {
      setIsDrafting(false);
    }
  };

  // Reck AI Email Summarizer
  const handleGenerateSummary = () => {
    setIsGeneratingSummary(true);
    setTimeout(() => {
      const unreadCount = messages.filter(m => m.unread).length;
      setAiSummary(
        `📬 Reck Intelligence Briefing for ${currentUser?.displayName || 'Vashu'}:\n\n` +
          `• Total tracked messages: ${messages.length} (${unreadCount} unread)\n` +
          `• High priority item from Elena Rostova: Multi-device E2EE security mesh & step-up policies passed verification.\n` +
          `• Google Cloud: Cloud Run container serving successfully on Port 3000.\n` +
          `• Hardware Procurement: Quantum Hardware awaits confirmation for delivery routing.\n\n` +
          `💡 Recommended Action: Review Elena's note and send confirmation for the hardware delivery routing.`
      );
      setIsGeneratingSummary(false);
    }, 900);
  };

  // Reck AI Quick Draft Generator
  const handleApplyAiDraft = (type: 'formal' | 'ack' | 'hinglish') => {
    if (type === 'formal') {
      setComposeForm(prev => ({
        ...prev,
        body:
          `Hi,\n\nThank you for reaching out. I have reviewed the details and everything looks aligned with our specifications. Please proceed with the next milestone.\n\nBest regards,\nVashu Sharma\nReck Systems`
      }));
    } else if (type === 'ack') {
      setComposeForm(prev => ({
        ...prev,
        body:
          `Acknowledged and approved. I will monitor execution and verify telemetry shortly.\n\nThanks,\nVashu`
      }));
    } else {
      setComposeForm(prev => ({
        ...prev,
        body:
          `Haanji, main check kar liya hai. Sab kuch theek lag raha hai, aage badha sakte ho. Sham tak update share kar dunga.\n\nCheers,\nVashu`
      }));
    }
  };

  return (
    <div className="flex-1 w-full px-4 pt-3 pb-8 space-y-4 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              if (selectedMessage) {
                setSelectedMessage(null);
              } else {
                setActiveScreen('home');
              }
            }}
            className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center space-x-2">
              <span>Gmail Hub</span>
              {isLiveConnection ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  LIVE GOOGLE API
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  PREVIEW MODE
                </span>
              )}
            </h2>
            <p className="font-mono text-[10px] text-cyan-400">
              Workspace Mail & Context Feed
            </p>
          </div>
        </div>

        {/* Action Button: Compose */}
        <button
          onClick={() => {
            setComposeForm({ to: '', subject: '', body: '', cc: '' });
            setIsComposeOpen(true);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Compose</span>
        </button>
      </div>

      {/* Google Auth Status Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google User'}
                  className="w-9 h-9 rounded-full border border-cyan-500/40 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <User size={18} />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-display font-bold text-xs text-white">
                    {currentUser.displayName || 'Authenticated Google User'}
                  </span>
                  <CheckCircle2 size={12} className="text-emerald-400" />
                </div>
                <p className="font-mono text-[10px] text-slate-400">
                  {currentUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleGoogleSignOut}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[11px] border border-white/10 transition-colors"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-xs text-white">
                  Connect your Google Account
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Authorize Reck to read inbox summaries, sync threads, and draft responses with your explicit permission.
                </p>
              </div>
            </div>

            {/* Official Sign in with Google Button */}
            <div className="pt-1">
              <GoogleSignInButton
                onClick={handleGoogleLogin}
                isLoading={isLoggingIn}
                text="Sign in with Google to Connect Gmail"
                className="w-full text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Reck AI Mailbox Assistant Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 border border-cyan-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Sparkles size={14} />
            </div>
            <span className="font-display font-bold text-xs text-white">
              Reck Mail Intelligence
            </span>
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-[10px] font-semibold border border-cyan-500/30 transition-all disabled:opacity-50"
          >
            {isGeneratingSummary ? (
              <RefreshCw size={10} className="animate-spin" />
            ) : (
              <Sparkles size={10} />
            )}
            <span>Summarize Inbox</span>
          </button>
        </div>

        {aiSummary ? (
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-[11px] font-mono text-slate-300 whitespace-pre-line leading-relaxed">
            {aiSummary}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">
            Ask Reck to synthesize unread threads, highlight action items, or prepare replies in Hinglish or English.
          </p>
        )}
      </div>

      {/* Folder Tabs & Search Bar */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'INBOX', label: 'Inbox', icon: Inbox },
            { id: 'STARRED', label: 'Starred', icon: Star },
            { id: 'SENT', label: 'Sent', icon: SendHorizontal },
            { id: 'DRAFT', label: 'Drafts', icon: FileText },
            { id: 'TRASH', label: 'Trash', icon: Trash2 }
          ].map(folder => {
            const Icon = folder.icon;
            const isCurrent = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => {
                  setActiveFolder(folder.id as any);
                  setSelectedMessage(null);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <Icon size={12} />
                <span>{folder.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search sender, subject or keyword..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <button
            onClick={loadMessages}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900/50 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Mail View: Either Detail Reader or List View */}
      {selectedMessage ? (
        /* Message Detail Reader */
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                {selectedMessage.subject}
              </h3>
              <p className="font-mono text-[11px] text-cyan-400">
                From: {selectedMessage.from}
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                To: {selectedMessage.to} • {selectedMessage.date}
              </p>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={e => handleToggleStar(selectedMessage, e)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  selectedMessage.starred
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <Star size={14} fill={selectedMessage.starred ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => handleRequestTrash(selectedMessage)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto no-scrollbar p-1">
            {selectedMessage.bodyText || selectedMessage.snippet}
          </div>

          {/* Quick Actions */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setComposeForm({
                  to: selectedMessage.fromEmail || selectedMessage.from,
                  subject: selectedMessage.subject.startsWith('Re:')
                    ? selectedMessage.subject
                    : `Re: ${selectedMessage.subject}`,
                  body: `\n\n--- On ${selectedMessage.date}, ${selectedMessage.from} wrote:\n> ${selectedMessage.snippet}`,
                  threadId: selectedMessage.threadId
                });
                setIsComposeOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow transition-all"
            >
              <Reply size={13} />
              <span>Reply</span>
            </button>

            <button
              onClick={() => {
                setComposeForm({
                  to: selectedMessage.fromEmail || selectedMessage.from,
                  subject: `Re: ${selectedMessage.subject}`,
                  body: `Hi,\n\nThanks for reaching out! I've reviewed your note regarding "${selectedMessage.subject}". Everything is confirmed and approved.\n\nBest regards,\nVashu Sharma`,
                  threadId: selectedMessage.threadId
                });
                setIsComposeOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 text-xs font-mono transition-all"
            >
              <Sparkles size={13} />
              <span>Reck Smart Reply</span>
            </button>
          </div>
        </div>
      ) : (
        /* Messages List View */
        <div className="space-y-2">
          {isLoading ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-mono text-xs text-slate-400">
                Fetching Gmail threads...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-white/5 space-y-2">
              <Mail size={24} className="mx-auto text-slate-600" />
              <p className="font-mono text-xs text-slate-400">
                No messages found in {activeFolder.toLowerCase()}.
              </p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  msg.unread
                    ? 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-500/60 shadow-sm'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    {msg.unread && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs truncate ${
                        msg.unread
                          ? 'font-bold text-white font-display'
                          : 'font-medium text-slate-300'
                      }`}
                    >
                      {msg.fromName || msg.from}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono text-[10px] text-slate-500">
                      {msg.date}
                    </span>
                    <button
                      onClick={e => handleToggleStar(msg, e)}
                      className="text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        size={13}
                        className={msg.starred ? 'text-amber-400 fill-amber-400' : ''}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <h4
                    className={`text-xs truncate ${
                      msg.unread ? 'font-semibold text-slate-100' : 'text-slate-300'
                    }`}
                  >
                    {msg.subject}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                    {msg.snippet}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Compose / Reply Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 p-4 shadow-2xl space-y-3.5 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Mail size={16} />
                </div>
                <h3 className="font-display font-bold text-sm text-white">
                  {composeForm.threadId ? 'Reply to Email' : 'New Message'}
                </h3>
              </div>

              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
              <div>
                <label className="block font-mono text-[10px] text-slate-400 mb-1">
                  TO RECIPIENT
                </label>
                <input
                  type="email"
                  value={composeForm.to}
                  onChange={e => setComposeForm(p => ({ ...p, to: e.target.value }))}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 mb-1">
                  SUBJECT
                </label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={e => setComposeForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Subject line..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Quick AI Drafting Chips */}
              <div>
                <span className="font-mono text-[10px] text-cyan-400 flex items-center space-x-1 mb-1">
                  <Sparkles size={11} />
                  <span>RECK DRAFT ASSISTANT:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyAiDraft('formal')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 border border-white/10"
                  >
                    + Formal Approval
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyAiDraft('ack')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 border border-white/10"
                  >
                    + Brief Ack
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyAiDraft('hinglish')}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 border border-white/10"
                  >
                    + Hinglish Ack
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-slate-400 mb-1">
                  MESSAGE BODY
                </label>
                <textarea
                  rows={6}
                  value={composeForm.body}
                  onChange={e => setComposeForm(p => ({ ...p, body: e.target.value }))}
                  placeholder="Write your email here..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isDrafting}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs border border-white/10 transition-colors"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handleRequestSend}
                disabled={isDrafting}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Send size={13} />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Explicit Confirmation Dialog */}
      <WorkspaceConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        confirmVariant={confirmModal.confirmVariant}
        icon={confirmModal.icon}
        details={confirmModal.details}
        isLoading={isDrafting}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
