/**
 * Reck Companion - Firebase Firestore Cloud Data View
 * Real-time inspection and management of persistent Cloud Firestore data.
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Server,
  FileText,
  Calendar,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import {
  testFirestoreConnection,
  saveNoteToFirestore,
  getNotesFromFirestore,
  deleteNoteFromFirestore,
  FirestoreNote
} from '../../services/firebase';
import { getCurrentUser } from '../../services/gmailService';
import { useReck } from '../../context/ReckContext';

export const FirebaseDbView: React.FC = () => {
  const { setActiveScreen } = useReck();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState<FirestoreNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const currentUser = getCurrentUser();
  const userId = currentUser?.uid || 'local_companion_user';

  const checkStatus = async () => {
    setConnectionStatus('checking');
    try {
      const res = await testFirestoreConnection();
      if (res.connected) {
        setConnectionStatus('connected');
        setErrorMessage(null);
      } else {
        setConnectionStatus('error');
        setErrorMessage(res.error || 'Unable to connect to Firestore');
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setErrorMessage(err.message || 'Firestore connection check failed');
    }
  };

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await getNotesFromFirestore(userId);
      setNotes(data);
    } catch (err) {
      console.warn('Could not load notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    checkStatus();
    loadNotes();
  }, [userId]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const noteItem: FirestoreNote = {
      id: `note_${Date.now()}`,
      userId,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: 'Reck Context',
      createdAt: new Date().toISOString()
    };

    try {
      await saveNoteToFirestore(userId, noteItem);
      setNotes(prev => [noteItem, ...prev]);
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
    } catch (err: any) {
      alert(`Failed to save to Firestore: ${err.message}`);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNoteFromFirestore(userId, id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      alert(`Failed to delete from Firestore: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-24 space-y-4 max-w-xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Database size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Firebase Firestore</h1>
            <p className="text-xs text-slate-400 font-mono">Project: hypnic-bongo-0ghtt</p>
          </div>
        </div>
        <button
          onClick={() => {
            checkStatus();
            loadNotes();
          }}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Refresh connection"
        >
          <RefreshCw size={15} className={connectionStatus === 'checking' ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Cloud Status Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-200">Persistence Engine</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {connectionStatus === 'connected' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={10} className="mr-1" />
                Live Cloud Sync
              </span>
            ) : connectionStatus === 'checking' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <RefreshCw size={10} className="mr-1 animate-spin" />
                Validating
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle size={10} className="mr-1" />
                Offline
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Google Cloud Firestore securely persists user settings, Google Workspace synchronization caches, and Reck memory across companion nodes.
        </p>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-slate-500 block text-[9px] uppercase">User Profile</span>
            <span className="text-slate-200 font-semibold">{currentUser ? 'Stored' : 'Local'}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-slate-500 block text-[9px] uppercase">Subcollections</span>
            <span className="text-cyan-400 font-semibold">3 Paths</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-slate-500 block text-[9px] uppercase">Cloud Notes</span>
            <span className="text-amber-400 font-semibold">{notes.length}</span>
          </div>
        </div>
      </div>

      {/* Cloud Subcollection Quick Links */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveScreen('workspace')}
          className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 text-left transition-all group"
        >
          <CheckSquare size={16} className="text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-white">Tasks</div>
          <div className="text-[10px] text-slate-400 font-mono">/users/{userId.slice(0, 4)}.../tasks</div>
        </button>

        <button
          onClick={() => setActiveScreen('workspace')}
          className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 text-left transition-all group"
        >
          <Calendar size={16} className="text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-white">Events</div>
          <div className="text-[10px] text-slate-400 font-mono">/users/.../events</div>
        </button>

        <button
          onClick={() => setIsAdding(true)}
          className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-amber-500/30 text-left transition-all group"
        >
          <FileText size={16} className="text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-semibold text-white">New Note</div>
          <div className="text-[10px] text-slate-400 font-mono">Save to DB</div>
        </button>
      </div>

      {/* Add Note Modal / Form */}
      {isAdding && (
        <form onSubmit={handleCreateNote} className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>Write to Firestore</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            placeholder="Note title (e.g. PC sync directive)..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            required
          />
          <textarea
            rows={3}
            placeholder="Cloud context payload..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <Cloud size={14} />
            <span>Persist to Cloud</span>
          </button>
        </form>
      )}

      {/* Stored Notes List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>DOCUMENTS IN /users/{userId}/notes</span>
          <span>{notes.length} records</span>
        </div>

        {loadingNotes ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-slate-400" />
            Loading Firestore documents...
          </div>
        ) : notes.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 text-center text-xs text-slate-400 space-y-2">
            <p>No notes written to Firestore yet.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs hover:bg-amber-500/20"
            >
              <Plus size={13} />
              <span>Create First Cloud Note</span>
            </button>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 transition-all flex items-start justify-between group"
            >
              <div className="space-y-1 pr-2">
                <div className="text-xs font-semibold text-white">{note.title}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{note.content}</div>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Saved: {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete document"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
