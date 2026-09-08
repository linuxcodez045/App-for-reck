/**
 * Reck Companion - Global Ecosystem State Provider
 * Coordinates device states, tasks, approvals, conversational flows, and Call Reck sessions.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ReckState,
  Device,
  Task,
  ApprovalRequest,
  ApprovalResult,
  Message,
  MemoryItem,
  Automation,
  NotificationItem,
  Integration,
  SensitiveActionAudit,
  UserProfile,
  RemoteCommandResult,
  DiagnosticsData,
  ActiveContext,
  TaskResultFile
} from '../types';
import { deviceHubClient } from '../services/deviceHub';
import { voiceService, VoiceSessionState } from '../services/voiceService';
import { biometricService } from '../services/biometricService';

export type ActiveScreen =
  | 'home'
  | 'tasks'
  | 'devices'
  | 'notifications'
  | 'chat'
  | 'call'
  | 'memory'
  | 'automations'
  | 'integrations'
  | 'trustCenter'
  | 'trust_center'
  | 'permissionCenter'
  | 'permissions'
  | 'account'
  | 'settings'
  | 'diagnostics'
  | 'onboarding';

export interface CommandPipelineAnimation {
  active: boolean;
  sourceDevice: string;
  hub: string;
  targetDevice: string;
  actionText: string;
  step: 'sending' | 'routing' | 'executing' | 'done' | 'failed';
  result?: RemoteCommandResult;
}

interface ReckContextType {
  reckState: ReckState;
  setReckState: (state: ReckState) => void;
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;

  // Selected entities for detail screens
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedApprovalId: string | null;
  setSelectedApprovalId: (id: string | null) => void;
  selectedFilePreview: TaskResultFile | null;
  setSelectedFilePreview: (file: TaskResultFile | null) => void;

  // Modals
  isPairingModalOpen: boolean;
  setIsPairingModalOpen: (open: boolean) => void;
  isRemoteCommandModalOpen: boolean;
  setIsRemoteCommandModalOpen: (open: boolean) => void;
  isBiometricModalOpen: boolean;
  setIsBiometricModalOpen: (open: boolean) => void;
  activeApprovalForBiometrics: ApprovalRequest | null;
  openBiometricApproval: (approval: ApprovalRequest) => void;

  // Data collections
  devices: Device[];
  tasks: Task[];
  approvals: ApprovalRequest[];
  notifications: NotificationItem[];
  memoryItems: MemoryItem[];
  automations: Automation[];
  integrations: Integration[];
  auditLogs: SensitiveActionAudit[];
  messages: Message[];
  userProfile: UserProfile | null;
  activeContext: ActiveContext | null;
  diagnostics: DiagnosticsData | null;

  // Connectivity & offline
  isNetworkOffline: boolean;
  toggleNetworkOffline: () => void;
  refreshData: () => Promise<void>;

  // Remote Commands & Pipeline
  pipelineAnimation: CommandPipelineAnimation | null;
  clearPipelineAnimation: () => void;
  dispatchRemoteCommand: (deviceId: string, commandText: string) => Promise<RemoteCommandResult>;

  // Task operations
  pauseTask: (taskId: string) => Promise<void>;
  resumeTask: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  retryTask: (taskId: string) => Promise<void>;
  handoffTaskFileToPhone: (taskId: string) => Promise<void>;

  // Approval operations
  executeApproval: (approvalId: string, approved: boolean, pin?: string) => Promise<ApprovalResult>;

  // Conversational chat
  sendChatMessage: (content: string, targetDeviceId?: string) => Promise<void>;

  // Voice & Call Reck
  voiceSession: VoiceSessionState;
  audioLevel: number;
  startCallReck: () => void;
  endCallReck: () => void;
  toggleCallMute: () => void;
  toggleCallSpeaker: () => void;

  // Permissions & device controls
  updateDevicePermission: (deviceId: string, permissionId: string, level: any) => Promise<void>;
  revokeDevice: (deviceId: string) => Promise<void>;
  renameDevice: (deviceId: string, newName: string) => Promise<void>;
  pairNewDevice: (deviceData: Omit<Device, 'id'>) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Automations & Memory
  toggleAutomation: (id: string, enabled: boolean) => Promise<void>;
  saveMemoryItem: (item: Omit<MemoryItem, 'id' | 'updatedAt'>) => Promise<void>;
  deleteMemoryItem: (id: string) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const ReckContext = createContext<ReckContextType | undefined>(undefined);

export const ReckProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reckState, setReckState] = useState<ReckState>('IDLE');
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<TaskResultFile | null>(null);

  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [isRemoteCommandModalOpen, setIsRemoteCommandModalOpen] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [activeApprovalForBiometrics, setActiveApprovalForBiometrics] = useState<ApprovalRequest | null>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [auditLogs, setAuditLogs] = useState<SensitiveActionAudit[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isNetworkOffline, setIsNetworkOffline] = useState(false);

  const [pipelineAnimation, setPipelineAnimation] = useState<CommandPipelineAnimation | null>(null);

  // Initial messages reflecting the scenario in prompt:
  // "PC wala report complete hua?" -> "Completed 3 minutes ago" with result card
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'reck',
      content: 'Reck Companion active. Connected to Home PC & Work Laptop via secure Device Hub.',
      timestamp: '10:42 AM'
    },
    {
      id: 'msg_demo_user',
      sender: 'user',
      content: 'PC wala report complete hua?',
      timestamp: '10:43 AM',
      language: 'hinglish'
    },
    {
      id: 'msg_demo_reck',
      sender: 'reck',
      content: 'Physics research synthesis on Home PC reached 68% progress. First 2 chapters and calculations completed 3 minutes ago.',
      timestamp: '10:43 AM',
      relatedTaskId: 'task_school_report',
      attachment: {
        id: 'file_report_pdf',
        name: 'Quantum_Hall_School_Report_2026.pdf',
        size: '4.2 MB',
        type: 'pdf',
        downloadUrl: '#',
        generatedByDevice: 'Home PC',
        createdAt: '3m ago',
        contentPreview: 'Quantum Hall Effect & Topological Insulator Investigation Draft'
      }
    }
  ]);

  // Voice session state
  const [voiceSession, setVoiceSession] = useState<VoiceSessionState>({
    isActive: false,
    isMuted: false,
    isSpeakerOn: true,
    durationSeconds: 0,
    encryptionState: 'Quantum E2EE (ChaCha20-Poly1305)',
    transcript: '',
    assistantResponse: ''
  });
  const [audioLevel, setAudioLevel] = useState(0);

  // Load initial data
  const refreshData = useCallback(async () => {
    try {
      const [devs, tsks, apprs, notifs, mem, autos, ints, audits, prof, diag, ctx] = await Promise.all([
        deviceHubClient.getDevices(),
        deviceHubClient.getTasks(),
        deviceHubClient.getApprovals(),
        deviceHubClient.getNotifications(),
        deviceHubClient.getMemoryItems(),
        deviceHubClient.getAutomations(),
        deviceHubClient.getIntegrations(),
        deviceHubClient.getAuditLogs(),
        deviceHubClient.getUserProfile(),
        deviceHubClient.getDiagnostics(),
        deviceHubClient.getActiveContext()
      ]);

      setDevices(devs);
      setTasks(tsks);
      setApprovals(apprs);
      setNotifications(notifs);
      setMemoryItems(mem);
      setAutomations(autos);
      setIntegrations(ints);
      setAuditLogs(audits);
      setUserProfile(prof);
      setDiagnostics(diag);
      setActiveContext(ctx);

      // Check if there are pending approvals to reflect WAITING_FOR_APPROVAL
      const pendingAppr = apprs.filter(a => a.status === 'PENDING');
      if (pendingAppr.length > 0 && reckState === 'IDLE') {
        setReckState('WAITING_FOR_APPROVAL');
      }
    } catch (err) {
      console.error('[ReckContext] Refresh error:', err);
    }
  }, [reckState]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Voice subscriptions
  useEffect(() => {
    const unsubState = voiceService.subscribeState(st => {
      setVoiceSession(st);
      if (st.isActive) {
        if (reckState !== 'SPEAKING' && reckState !== 'LISTENING' && reckState !== 'THINKING') {
          setReckState('LISTENING');
        }
      } else if (reckState === 'LISTENING' || reckState === 'SPEAKING') {
        setReckState('IDLE');
      }
    });

    const unsubAudio = voiceService.subscribeAudioLevel(lvl => {
      setAudioLevel(lvl);
    });

    return () => {
      unsubState();
      unsubAudio();
    };
  }, [reckState]);

  // Toggle Network Fault for testing offline and connection recovery
  const toggleNetworkOffline = useCallback(() => {
    setIsNetworkOffline(prev => {
      const next = !prev;
      deviceHubClient.toggleNetworkFault(next);
      if (next) {
        setReckState('OFFLINE');
      } else {
        setReckState('IDLE');
      }
      refreshData();
      return next;
    });
  }, [refreshData]);

  const openBiometricApproval = useCallback((approval: ApprovalRequest) => {
    setActiveApprovalForBiometrics(approval);
    setIsBiometricModalOpen(true);
  }, []);

  const executeApproval = useCallback(
    async (approvalId: string, approved: boolean, pin?: string): Promise<ApprovalResult> => {
      const appr = approvals.find(a => a.id === approvalId);
      const bioType = pin ? 'PIN' : biometricService.getBiometricType();

      setReckState('EXECUTING');
      const result = await deviceHubClient.resolveApproval(approvalId, approved, bioType, pin);
      await refreshData();

      // Return Reck Core to idle or normal state
      setTimeout(() => {
        setReckState('IDLE');
      }, 900);

      // Add audit message to conversation
      const actionMsg: Message = {
        id: `msg_appr_${Date.now()}`,
        sender: 'reck',
        content: approved
          ? `Biometric step-up confirmed. Authorized action: "${appr?.action} ${appr?.target}" on ${appr?.targetDeviceName}. Target device executed with exit code 0.`
          : `Action declined: "${appr?.action} ${appr?.target}" on ${appr?.targetDeviceName} was blocked and cancelled.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedApprovalId: approvalId
      };
      setMessages(prev => [...prev, actionMsg]);

      setIsBiometricModalOpen(false);
      setActiveApprovalForBiometrics(null);
      return result;
    },
    [approvals, refreshData]
  );

  const dispatchRemoteCommand = useCallback(
    async (deviceId: string, commandText: string): Promise<RemoteCommandResult> => {
      const targetDev = devices.find(d => d.id === deviceId);
      const devName = targetDev ? targetDev.name : 'Device';

      // Start pipeline animation
      setPipelineAnimation({
        active: true,
        sourceDevice: 'Reck Companion (This Phone)',
        hub: 'Reck Device Hub (Quantum E2EE)',
        targetDevice: devName,
        actionText: commandText,
        step: 'sending'
      });
      setReckState('PLANNING');

      // Add user message to chat
      setMessages(prev => [
        ...prev,
        {
          id: `msg_cmd_u_${Date.now()}`,
          sender: 'user',
          content: commandText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          targetDevice: devName
        }
      ]);

      // Step 2: Routing through Hub
      await new Promise(r => setTimeout(r, 450));
      setPipelineAnimation(prev => (prev ? { ...prev, step: 'routing' } : null));
      setReckState('EXECUTING');

      // Step 3: Target execution
      await new Promise(r => setTimeout(r, 500));
      setPipelineAnimation(prev => (prev ? { ...prev, step: 'executing' } : null));

      const result = await deviceHubClient.sendRemoteCommand(deviceId, commandText);

      // Step 4: Completion
      setPipelineAnimation(prev =>
        prev
          ? {
              ...prev,
              step: result.status === 'SUCCESS' ? 'done' : 'failed',
              result
            }
          : null
      );

      if (result.status === 'SUCCESS') {
        setReckState('SPEAKING');
        voiceService.speak(result.output, () => {
          setReckState('IDLE');
        });
      } else {
        setReckState('ERROR');
        setTimeout(() => setReckState(isNetworkOffline ? 'OFFLINE' : 'IDLE'), 2000);
      }

      // Add response message with command pipeline visualization
      setMessages(prev => [
        ...prev,
        {
          id: `msg_cmd_r_${Date.now()}`,
          sender: 'reck',
          content: result.output,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          targetDevice: devName,
          commandPipeline: {
            origin: 'This Phone',
            hub: 'Device Hub',
            target: devName,
            action: commandText,
            status: result.status === 'SUCCESS' ? 'success' : 'failed'
          }
        }
      ]);

      await refreshData();
      return result;
    },
    [devices, isNetworkOffline, refreshData]
  );

  const clearPipelineAnimation = useCallback(() => {
    setPipelineAnimation(null);
  }, []);

  const sendChatMessage = useCallback(
    async (content: string, targetDeviceId?: string) => {
      const userMsg: Message = {
        id: `msg_${Date.now()}`,
        sender: 'user',
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetDevice: targetDeviceId
      };
      setMessages(prev => [...prev, userMsg]);
      setReckState('THINKING');

      await new Promise(r => setTimeout(r, 700));

      const lower = content.toLowerCase();

      // Check if command is asking about report status
      if (lower.includes('report') && (lower.includes('complete') || lower.includes('status') || lower.includes('hua'))) {
        const reportTask = tasks.find(t => t.id === 'task_school_report');
        setReckState('SPEAKING');
        const reply: Message = {
          id: `msg_${Date.now() + 1}`,
          sender: 'reck',
          content: `Physics Capstone Report on Home PC is at ${reportTask ? reportTask.progressPercent : 68}% progress. 2 out of 5 steps completed. Sources extracted and analysis finalized.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          relatedTaskId: 'task_school_report',
          attachment: reportTask?.resultFile
        };
        setMessages(prev => [...prev, reply]);
        voiceService.speak('Report is at 68 percent on Home PC.', () => setReckState('IDLE'));
        return;
      }

      // Check if user asks "Phone pe bhej do" / "Send to phone"
      if (lower.includes('phone pe bhej') || lower.includes('send to phone') || lower.includes('transfer')) {
        setReckState('EXECUTING');
        await deviceHubClient.handoffTaskFile('task_school_report', 'dev_phone_this');
        await refreshData();

        setReckState('SPEAKING');
        const reply: Message = {
          id: `msg_${Date.now() + 1}`,
          sender: 'reck',
          content: 'Transferred "Quantum_Hall_School_Report_2026.pdf" securely to your phone via encrypted Device Hub channel. You can view or share it now.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment: {
            id: 'file_report_pdf',
            name: 'Quantum_Hall_School_Report_2026.pdf',
            size: '4.2 MB',
            type: 'pdf',
            downloadUrl: '#',
            generatedByDevice: 'Home PC',
            createdAt: 'Synced just now',
            contentPreview: 'Quantum Hall Effect & Topological Insulators (LaTeX Output Draft)'
          }
        };
        setMessages(prev => [...prev, reply]);
        voiceService.speak('Report transferred to your phone.', () => setReckState('IDLE'));
        return;
      }

      // Check if command to open Chrome or apps
      if (lower.includes('chrome') || lower.includes('spotify') || lower.includes('kholo') || lower.includes('open')) {
        await dispatchRemoteCommand(targetDeviceId || 'dev_pc_home', content);
        return;
      }

      // Natural generic response
      setReckState('SPEAKING');
      const genReply: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'reck',
        content: `Acknowledged. I have synchronized context across your trusted devices (${devices.filter(d => d.isOnline).map(d => d.name).join(', ')}). Let me know if you need to dispatch an action or check task status.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, genReply]);
      setTimeout(() => setReckState('IDLE'), 800);
    },
    [devices, dispatchRemoteCommand, refreshData, tasks]
  );

  const startCallReck = useCallback(() => {
    setActiveScreen('call');
    setReckState('LISTENING');
    voiceService.startCallSession(transcript => {
      // Live transcription handle
      if (transcript.toLowerCase().includes('chrome')) {
        dispatchRemoteCommand('dev_pc_home', 'Open Chrome on Home PC');
      }
    });
  }, [dispatchRemoteCommand]);

  const endCallReck = useCallback(() => {
    voiceService.endCallSession();
    setActiveScreen('home');
    setReckState('IDLE');
  }, []);

  const toggleCallMute = useCallback(() => {
    voiceService.toggleMute();
  }, []);

  const toggleCallSpeaker = useCallback(() => {
    voiceService.toggleSpeaker();
  }, []);

  const pauseTask = useCallback(
    async (taskId: string) => {
      await deviceHubClient.pauseTask(taskId);
      await refreshData();
    },
    [refreshData]
  );

  const resumeTask = useCallback(
    async (taskId: string) => {
      await deviceHubClient.resumeTask(taskId);
      await refreshData();
    },
    [refreshData]
  );

  const cancelTask = useCallback(
    async (taskId: string) => {
      await deviceHubClient.cancelTask(taskId);
      await refreshData();
    },
    [refreshData]
  );

  const retryTask = useCallback(
    async (taskId: string) => {
      await deviceHubClient.retryTask(taskId);
      await refreshData();
    },
    [refreshData]
  );

  const handoffTaskFileToPhone = useCallback(
    async (taskId: string) => {
      await deviceHubClient.handoffTaskFile(taskId, 'dev_phone_this');
      await refreshData();
    },
    [refreshData]
  );

  const updateDevicePermission = useCallback(
    async (deviceId: string, permissionId: string, level: any) => {
      await deviceHubClient.updateDevicePermission(deviceId, permissionId, level);
      await refreshData();
    },
    [refreshData]
  );

  const revokeDevice = useCallback(
    async (deviceId: string) => {
      await deviceHubClient.revokeDevice(deviceId);
      await refreshData();
    },
    [refreshData]
  );

  const renameDevice = useCallback(
    async (deviceId: string, newName: string) => {
      await deviceHubClient.renameDevice(deviceId, newName);
      await refreshData();
    },
    [refreshData]
  );

  const pairNewDevice = useCallback(
    async (deviceData: Omit<Device, 'id'>) => {
      await deviceHubClient.pairNewDevice(deviceData);
      await refreshData();
    },
    [refreshData]
  );

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  const toggleAutomation = useCallback(
    async (id: string, enabled: boolean) => {
      await deviceHubClient.toggleAutomation(id, enabled);
      await refreshData();
    },
    [refreshData]
  );

  const saveMemoryItem = useCallback(
    async (item: Omit<MemoryItem, 'id' | 'updatedAt'>) => {
      await deviceHubClient.saveMemoryItem(item);
      await refreshData();
    },
    [refreshData]
  );

  const deleteMemoryItem = useCallback(
    async (id: string) => {
      await deviceHubClient.deleteMemoryItem(id);
      await refreshData();
    },
    [refreshData]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      await deviceHubClient.markNotificationRead(id);
      await refreshData();
    },
    [refreshData]
  );

  const clearNotifications = useCallback(async () => {
    await deviceHubClient.clearAllNotifications();
    await refreshData();
  }, [refreshData]);

  return (
    <ReckContext.Provider
      value={{
        reckState,
        setReckState,
        activeScreen,
        setActiveScreen,
        selectedDeviceId,
        setSelectedDeviceId,
        selectedTaskId,
        setSelectedTaskId,
        selectedApprovalId,
        setSelectedApprovalId,
        selectedFilePreview,
        setSelectedFilePreview,
        isPairingModalOpen,
        setIsPairingModalOpen,
        isRemoteCommandModalOpen,
        setIsRemoteCommandModalOpen,
        isBiometricModalOpen,
        setIsBiometricModalOpen,
        activeApprovalForBiometrics,
        openBiometricApproval,
        devices,
        tasks,
        approvals,
        notifications,
        memoryItems,
        automations,
        integrations,
        auditLogs,
        messages,
        userProfile,
        activeContext,
        diagnostics,
        isNetworkOffline,
        toggleNetworkOffline,
        refreshData,
        pipelineAnimation,
        clearPipelineAnimation,
        dispatchRemoteCommand,
        pauseTask,
        resumeTask,
        cancelTask,
        retryTask,
        handoffTaskFileToPhone,
        executeApproval,
        sendChatMessage,
        voiceSession,
        audioLevel,
        startCallReck,
        endCallReck,
        toggleCallMute,
        toggleCallSpeaker,
        updateDevicePermission,
        revokeDevice,
        renameDevice,
        pairNewDevice,
        updateUserProfile,
        toggleAutomation,
        saveMemoryItem,
        deleteMemoryItem,
        markNotificationRead,
        clearNotifications
      }}
    >
      {children}
    </ReckContext.Provider>
  );
};

export const useReck = (): ReckContextType => {
  const ctx = useContext(ReckContext);
  if (!ctx) {
    throw new Error('useReck must be used within a ReckProvider');
  }
  return ctx;
};
