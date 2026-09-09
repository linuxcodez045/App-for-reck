/**
 * Reck Companion - Google Workspace Hub View
 * Orchestrates Google Tasks, Google Calendar, Google Meet, Contacts,
 * Google Chat, Google Drive, and Google Forms with official OAuth and Firestore persistence.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Calendar as CalendarIcon,
  Video,
  Users,
  MessageSquare,
  HardDrive,
  FileQuestion,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Building,
  Sparkles,
  Send,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import {
  GoogleTask,
  GoogleCalendarEvent,
  GoogleContact,
  GoogleChatSpace,
  GoogleChatMessage,
  GoogleDriveFile,
  GoogleForm
} from '../../types';
import {
  googleTasksService,
  googleCalendarService,
  googleContactsService,
  googleChatService,
  googleDriveService,
  googleFormsService
} from '../../services/workspaceService';
import {
  googleSignIn,
  googleSignOut,
  getCurrentUser,
  getGoogleAccessToken
} from '../../services/gmailService';
import {
  saveTaskToFirestore,
  saveEventToFirestore
} from '../../services/firebase';
import { useReck } from '../../context/ReckContext';

export type WorkspaceTab =
  | 'tasks'
  | 'calendar'
  | 'meet'
  | 'drive'
  | 'contacts'
  | 'chat'
  | 'forms';

interface ConfirmAction {
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
}

export const WorkspaceHubView: React.FC = () => {
  const { setActiveScreen, addNotification } = useReck();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('tasks');
  const [user, setUser] = useState(getCurrentUser());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmAction | null>(null);

  // --- 1. TASKS STATE ---
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // --- 2. CALENDAR & MEET STATE ---
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [newEventDuration, setNewEventDuration] = useState(45);
  const [newEventWithMeet, setNewEventWithMeet] = useState(true);
  const [instantMeetUrl, setInstantMeetUrl] = useState<string | null>(null);

  // --- 3. CONTACTS STATE ---
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactOrg, setNewContactOrg] = useState('');

  // --- 4. CHAT STATE ---
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [messages, setMessages] = useState<GoogleChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // --- 5. DRIVE STATE ---
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');

  // --- 6. FORMS STATE ---
  const [forms, setForms] = useState<GoogleForm[]>([]);
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDesc, setNewFormDesc] = useState('');

  // Load active tab data
  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tasks') {
        const data = await googleTasksService.listTasks();
        setTasks(data);
      } else if (activeTab === 'calendar' || activeTab === 'meet') {
        const data = await googleCalendarService.listEvents();
        setEvents(data);
      } else if (activeTab === 'contacts') {
        const data = await googleContactsService.listContacts();
        setContacts(data);
      } else if (activeTab === 'chat') {
        const sp = await googleChatService.listSpaces();
        setSpaces(sp);
        const currentSp = selectedSpace || sp[0]?.name || 'spaces/AAAABBBCCC1';
        setSelectedSpace(currentSp);
        const msgs = await googleChatService.listMessages(currentSp);
        setMessages(msgs);
      } else if (activeTab === 'drive') {
        const data = await googleDriveService.listFiles(driveSearch);
        setDriveFiles(data);
      } else if (activeTab === 'forms') {
        const data = await googleFormsService.listForms();
        setForms(data);
      }
    } catch (err) {
      console.warn('Error fetching workspace tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  // Handle Google Auth
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      setUser(res.user);
      loadTabData();
    } catch (err: any) {
      alert(`Google sign in failed: ${err?.message || err}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    loadTabData();
  };

  // --- TASK ACTIONS ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const t = await googleTasksService.createTask(newTaskTitle.trim(), newTaskNotes.trim());
      setTasks(prev => [t, ...prev]);
      // Sync to Firestore if signed in
      if (user) {
        await saveTaskToFirestore(user.uid, {
          id: t.id,
          userId: user.uid,
          title: t.title,
          notes: t.notes,
          status: t.status,
          due: t.due,
          updated: t.updated || new Date().toISOString()
        }).catch(err => console.warn('Firestore task sync:', err));
      }
      setNewTaskTitle('');
      setNewTaskNotes('');
      setIsAddTaskOpen(false);
    } catch (err: any) {
      alert(`Failed to add task: ${err.message}`);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const isComp = currentStatus === 'completed';
    await googleTasksService.toggleTask(taskId, !isComp);
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: isComp ? 'needsAction' : 'completed' } : t))
    );
  };

  const handleDeleteTask = (taskId: string, title: string) => {
    setConfirmModal({
      title: 'Delete Task',
      message: `Are you sure you want to permanently delete "${title}" from Google Tasks?`,
      confirmText: 'Delete Task',
      onConfirm: async () => {
        await googleTasksService.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setConfirmModal(null);
      }
    });
  };

  // --- CALENDAR & MEET ACTIONS ---
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    try {
      const ev = await googleCalendarService.createEvent({
        summary: newEventTitle.trim(),
        startTime: newEventDate,
        durationMinutes: newEventDuration,
        withMeet: newEventWithMeet
      });
      setEvents(prev => [ev, ...prev]);
      if (user) {
        await saveEventToFirestore(user.uid, {
          id: ev.id,
          userId: user.uid,
          summary: ev.summary,
          description: ev.description,
          start: ev.start?.dateTime || newEventDate,
          end: ev.end?.dateTime || newEventDate,
          meetLink: ev.meetLink
        }).catch(err => console.warn('Firestore event sync:', err));
      }
      setNewEventTitle('');
      setIsScheduleOpen(false);
    } catch (err: any) {
      alert(`Failed to schedule meeting: ${err.message}`);
    }
  };

  const handleStartInstantMeet = async () => {
    setLoading(true);
    try {
      const meetUrl = await googleCalendarService.createInstantMeet('Reck Companion Instant Session');
      setInstantMeetUrl(meetUrl);
      addNotification({
        type: 'file_ready',
        title: 'Google Meet Created',
        message: `Instant meeting link is ready: ${meetUrl}`,
        priority: 'high'
      });
    } catch (err: any) {
      alert(`Failed to create Meet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: string, summary: string) => {
    setConfirmModal({
      title: 'Delete Calendar Event',
      message: `Delete "${summary}" from your Google Calendar?`,
      confirmText: 'Delete Event',
      onConfirm: async () => {
        await googleCalendarService.deleteEvent(eventId);
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setConfirmModal(null);
      }
    });
  };

  // --- CONTACTS ACTIONS ---
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    try {
      const c = await googleContactsService.createContact({
        givenName: newContactName.trim(),
        email: newContactEmail.trim() || undefined,
        phone: newContactPhone.trim() || undefined,
        organization: newContactOrg.trim() || undefined
      });
      setContacts(prev => [c, ...prev]);
      setNewContactName('');
      setNewContactEmail('');
      setNewContactPhone('');
      setNewContactOrg('');
      setIsAddContactOpen(false);
    } catch (err: any) {
      alert(`Failed to add contact: ${err.message}`);
    }
  };

  // --- CHAT ACTIONS ---
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedSpace) return;
    try {
      const msg = await googleChatService.sendMessage(selectedSpace, chatInput.trim());
      setMessages(prev => [...prev, msg]);
      setChatInput('');
    } catch (err: any) {
      alert(`Failed to send message: ${err.message}`);
    }
  };

  // --- DRIVE ACTIONS ---
  const handleCreateDriveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    try {
      const f = await googleDriveService.createDocument(newDocName.trim());
      setDriveFiles(prev => [f, ...prev]);
      setNewDocName('');
      setIsNewDocOpen(false);
    } catch (err: any) {
      alert(`Failed to create document: ${err.message}`);
    }
  };

  const handleDeleteDriveFile = (fileId: string, name: string) => {
    setConfirmModal({
      title: 'Remove Drive File',
      message: `Are you sure you want to remove "${name}" from Google Drive?`,
      confirmText: 'Remove File',
      onConfirm: async () => {
        await googleDriveService.deleteFile(fileId);
        setDriveFiles(prev => prev.filter(f => f.id !== fileId));
        setConfirmModal(null);
      }
    });
  };

  // --- FORMS ACTIONS ---
  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;
    try {
      const f = await googleFormsService.createForm(newFormTitle.trim(), newFormDesc.trim());
      setForms(prev => [f, ...prev]);
      setNewFormTitle('');
      setNewFormDesc('');
      setIsNewFormOpen(false);
    } catch (err: any) {
      alert(`Failed to create form: ${err.message}`);
    }
  };

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.organization && c.organization.toLowerCase().includes(q))
    );
  }, [contacts, contactSearch]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return tasks.filter(t => t.status !== 'completed');
    if (taskFilter === 'completed') return tasks.filter(t => t.status === 'completed');
    return tasks;
  }, [tasks, taskFilter]);

  return (
    <div className="flex-1 flex flex-col p-3 pb-24 space-y-3.5 max-w-xl mx-auto w-full">
      {/* 1. Header & Account Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Google Workspace Hub</h1>
            <p className="text-xs text-slate-400 font-mono">Tasks • Calendar • Meet • Drive • People</p>
          </div>
        </div>
        <button
          onClick={loadTabData}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. Authentication Strip */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
        {user ? (
          <div className="flex items-center space-x-2.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Google Account'}
                className="w-8 h-8 rounded-full border border-cyan-500/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                {user.displayName?.charAt(0) || 'G'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">
                {user.displayName || 'Connected User'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[190px]">
                {user.email}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Workspace Preview Mode</span>
          </div>
        )}

        <div>
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-[11px] font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button text-xs py-1 px-2.5"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper flex items-center space-x-1.5">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-3.5 h-3.5 block">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents text-[11px] font-medium text-slate-200">
                  {isSigningIn ? 'Connecting...' : 'Sign in'}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 3. Navigation Tabs Scrollable */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
          { id: 'meet', label: 'Meet', icon: Video },
          { id: 'drive', label: 'Drive', icon: HardDrive },
          { id: 'contacts', label: 'Contacts', icon: Users },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'forms', label: 'Forms', icon: FileQuestion }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkspaceTab)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/40 text-slate-400 border border-white/5 hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}

      {/* --- TAB A: GOOGLE TASKS --- */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-slate-900/40 p-1 rounded-xl border border-white/5">
              {(['all', 'pending', 'completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition-colors ${
                    taskFilter === f ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold hover:bg-cyan-400 transition-colors"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
          </div>

          {/* Add Task Input Form */}
          {isAddTaskOpen && (
            <form onSubmit={handleCreateTask} className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Add to Google Tasks</span>
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <input
                type="text"
                placeholder="Notes or context (optional)..."
                value={newTaskNotes}
                onChange={e => setNewTaskNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-colors"
              >
                Save Task
              </button>
            </form>
          )}

          {/* Task Items List */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center text-xs text-slate-400">
                No tasks found in this view.
              </div>
            ) : (
              filteredTasks.map(t => {
                const isDone = t.status === 'completed';
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start justify-between group ${
                      isDone
                        ? 'bg-slate-950/40 border-white/5 opacity-60'
                        : 'bg-slate-900/50 border-white/5 hover:border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 flex-1 pr-2">
                      <button
                        onClick={() => handleToggleTask(t.id, t.status)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                            : 'border-slate-500 hover:border-cyan-400'
                        }`}
                      >
                        {isDone && <CheckCircle2 size={12} />}
                      </button>
                      <div>
                        <span className={`text-xs font-medium block leading-tight ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                          {t.title}
                        </span>
                        {t.notes && <p className="text-[11px] text-slate-400 mt-0.5">{t.notes}</p>}
                        {t.due && (
                          <div className="flex items-center space-x-1 text-[10px] text-cyan-400/80 font-mono mt-1">
                            <Clock size={10} />
                            <span>Due {new Date(t.due).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(t.id, t.title)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB B: GOOGLE CALENDAR --- */}
      {activeTab === 'calendar' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">UPCOMING AGENDA ({events.length})</div>
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold hover:bg-emerald-400 transition-colors"
            >
              <Plus size={14} />
              <span>Schedule Event</span>
            </button>
          </div>

          {/* Schedule Form */}
          {isScheduleOpen && (
            <form onSubmit={handleCreateEvent} className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Create Calendar Event</span>
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Meeting Title / Purpose..."
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                <select
                  value={newEventDuration}
                  onChange={e => setNewEventDuration(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>1 Hour</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={newEventWithMeet}
                  onChange={e => setNewEventWithMeet(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                <span>Attach Google Meet video room</span>
              </label>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors"
              >
                Schedule & Invite
              </button>
            </form>
          )}

          {/* Event Items */}
          <div className="space-y-2">
            {events.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center text-xs text-slate-400">
                No events scheduled on your primary calendar.
              </div>
            ) : (
              events.map(ev => {
                const startTime = ev.start?.dateTime
                  ? new Date(ev.start.dateTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'All day';

                return (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/20 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">{ev.summary}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{ev.description}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev.id, ev.summary)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
                        <Clock size={11} />
                        <span>{startTime}</span>
                      </div>

                      {ev.meetLink && (
                        <a
                          href={ev.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/20 transition-colors"
                        >
                          <Video size={12} />
                          <span>Join Meet</span>
                          <ExternalLink size={10} className="ml-0.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB C: GOOGLE MEET --- */}
      {activeTab === 'meet' && (
        <div className="space-y-3.5">
          {/* Instant Meet Launch Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-500/20 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Video size={18} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Instant Google Meet</h3>
                <p className="text-[11px] text-slate-400">Spawn a verified video conference space with 1 tap.</p>
              </div>
            </div>

            {instantMeetUrl ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <span className="text-[11px] text-slate-400 block font-mono">ROOM LINK:</span>
                <div className="text-xs font-mono text-emerald-400 truncate select-all">{instantMeetUrl}</div>
                <div className="flex space-x-2 pt-1">
                  <a
                    href={instantMeetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <span>Launch in Meet</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(instantMeetUrl);
                      alert('Copied to clipboard');
                    }}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-200 text-xs hover:bg-slate-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartInstantMeet}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-lg shadow-emerald-950/50"
              >
                <Video size={15} />
                <span>Start Google Meet Now</span>
              </button>
            )}
          </div>

          {/* Scheduled Video Meetings */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 font-mono px-1">SCHEDULED VIDEO CALLS</div>
            {events.filter(e => e.meetLink).length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/30 border border-white/5 text-center text-xs text-slate-400">
                No video calls scheduled with Google Meet.
              </div>
            ) : (
              events
                .filter(e => e.meetLink)
                .map(ev => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/20 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white">{ev.summary}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString() : 'Today'}
                      </div>
                    </div>
                    <a
                      href={ev.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Video size={13} />
                      <span>Join</span>
                    </a>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB D: GOOGLE DRIVE --- */}
      {activeTab === 'drive' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search Drive files..."
                value={driveSearch}
                onChange={e => setDriveSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => setIsNewDocOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-400 transition-colors whitespace-nowrap"
            >
              <Plus size={14} />
              <span>New Doc</span>
            </button>
          </div>

          {/* New Doc Form */}
          {isNewDocOpen && (
            <form onSubmit={handleCreateDriveDoc} className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Create Google Doc</span>
                <button
                  type="button"
                  onClick={() => setIsNewDocOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Document Title (e.g. Sprint Specs)..."
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-blue-500 text-white font-semibold text-xs hover:bg-blue-400 transition-colors"
              >
                Create in Google Drive
              </button>
            </form>
          )}

          {/* Drive Files List */}
          <div className="space-y-2">
            {driveFiles.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center text-xs text-slate-400">
                No Drive files found.
              </div>
            ) : (
              driveFiles.map(file => (
                <div
                  key={file.id}
                  className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-blue-500/20 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5 flex-1 pr-2 truncate">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <FolderOpen size={16} />
                    </div>
                    <div className="truncate">
                      <a
                        href={file.webViewLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white hover:text-cyan-400 truncate block"
                      >
                        {file.name}
                      </a>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{file.size || 'Google Doc'}</span>
                        <span>•</span>
                        <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Open file"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteDriveFile(file.id, file.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB E: GOOGLE CONTACTS --- */}
      {activeTab === 'contacts' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search People & Contacts..."
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-400 transition-colors whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* Add Contact Form */}
          {isAddContactOpen && (
            <form onSubmit={handleCreateContact} className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Create Google Contact</span>
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Full Name (e.g. Alex Morgan)..."
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email..."
                  value={newContactEmail}
                  onChange={e => setNewContactEmail(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="tel"
                  placeholder="Phone..."
                  value={newContactPhone}
                  onChange={e => setNewContactPhone(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <input
                type="text"
                placeholder="Company / Organization..."
                value={newContactOrg}
                onChange={e => setNewContactOrg(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-500 text-white font-semibold text-xs hover:bg-indigo-400 transition-colors"
              >
                Save Contact
              </button>
            </form>
          )}

          {/* Contacts List */}
          <div className="space-y-2">
            {filteredContacts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center text-xs text-slate-400">
                No contacts matching query.
              </div>
            ) : (
              filteredContacts.map(c => (
                <div
                  key={c.resourceName}
                  className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/20 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                      {c.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{c.displayName}</div>
                      {c.jobTitle || c.organization ? (
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Building size={10} />
                          <span>{[c.jobTitle, c.organization].filter(Boolean).join(' • ')}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {c.email && (
                      <button
                        onClick={() => {
                          setActiveScreen('gmail');
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title={`Email ${c.email}`}
                      >
                        <Mail size={13} />
                      </button>
                    )}
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title={`Call ${c.phone}`}
                      >
                        <Phone size={13} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- TAB F: GOOGLE CHAT --- */}
      {activeTab === 'chat' && (
        <div className="space-y-3">
          {/* Space Selector */}
          <div className="flex space-x-1.5 overflow-x-auto no-scrollbar">
            {spaces.map(s => (
              <button
                key={s.name}
                onClick={async () => {
                  setSelectedSpace(s.name);
                  const msgs = await googleChatService.listMessages(s.name);
                  setMessages(msgs);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors ${
                  selectedSpace === s.name
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium'
                    : 'bg-slate-900/40 text-slate-400 border border-white/5 hover:text-white'
                }`}
              >
                #{s.displayName}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="h-64 overflow-y-auto p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2.5 flex flex-col no-scrollbar">
            {messages.length === 0 ? (
              <div className="m-auto text-xs text-slate-500 font-mono">No messages in this space yet.</div>
            ) : (
              messages.map(m => (
                <div key={m.name} className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-cyan-400">{m.senderName}</span>
                    <span className="font-mono">{m.createTime}</span>
                  </div>
                  <p className="text-xs text-slate-200">{m.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatMessage} className="flex space-x-2">
            <input
              type="text"
              placeholder="Post message to Google Chat space..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center justify-center transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* --- TAB G: GOOGLE FORMS --- */}
      {activeTab === 'forms' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">ACTIVE SURVEYS & FORMS</div>
            <button
              onClick={() => setIsNewFormOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-500 text-white text-xs font-semibold hover:bg-purple-400 transition-colors"
            >
              <Plus size={14} />
              <span>New Form</span>
            </button>
          </div>

          {/* New Form Dialog */}
          {isNewFormOpen && (
            <form onSubmit={handleCreateForm} className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Create Google Form</span>
                <button
                  type="button"
                  onClick={() => setIsNewFormOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                placeholder="Form Title..."
                value={newFormTitle}
                onChange={e => setNewFormTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
              <textarea
                rows={2}
                placeholder="Description / Instructions..."
                value={newFormDesc}
                onChange={e => setNewFormDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-purple-500 text-white font-semibold text-xs hover:bg-purple-400 transition-colors"
              >
                Create in Google Forms
              </button>
            </form>
          )}

          {/* Forms List */}
          <div className="space-y-2">
            {forms.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/5 text-center text-xs text-slate-400">
                No Google Forms found.
              </div>
            ) : (
              forms.map(form => (
                <div
                  key={form.id}
                  className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-purple-500/20 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{form.title}</div>
                      {form.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{form.description}</div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {form.responsesCount || 0} responses
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Modified {form.modifiedTime ? new Date(form.modifiedTime).toLocaleDateString() : 'Recent'}
                    </span>

                    {form.webViewLink && (
                      <a
                        href={form.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/20 transition-colors"
                      >
                        <span>Open Form</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Destructive Operations */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e131f] border border-rose-500/30 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle size={18} />
              <h3 className="text-sm font-semibold text-white">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{confirmModal.message}</p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-400"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
