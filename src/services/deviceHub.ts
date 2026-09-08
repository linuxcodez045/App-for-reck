/**
 * Reck Companion - Device Hub & Core Services Layer
 * Provides contracts and mock implementations with clean integration points for Reck Ecosystem.
 */

import {
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
  ActiveContext
} from '../types';

export interface IDeviceHubClient {
  readonly mode: 'MOCKED' | 'INTEGRATION-READY';
  getDevices(): Promise<Device[]>;
  getDeviceById(id: string): Promise<Device | undefined>;
  sendRemoteCommand(deviceId: string, command: string): Promise<RemoteCommandResult>;
  updateDevicePermission(deviceId: string, permissionId: string, level: any): Promise<boolean>;
  renameDevice(deviceId: string, newName: string): Promise<boolean>;
  revokeDevice(deviceId: string): Promise<boolean>;
  
  getTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | undefined>;
  pauseTask(id: string): Promise<boolean>;
  resumeTask(id: string): Promise<boolean>;
  cancelTask(id: string): Promise<boolean>;
  retryTask(id: string): Promise<boolean>;
  handoffTaskFile(taskId: string, targetDeviceId: string): Promise<boolean>;

  getApprovals(): Promise<ApprovalRequest[]>;
  resolveApproval(approvalId: string, approved: boolean, biometricType?: string, pin?: string): Promise<ApprovalResult>;

  getMemoryItems(): Promise<MemoryItem[]>;
  saveMemoryItem(item: Omit<MemoryItem, 'id' | 'updatedAt'>): Promise<MemoryItem>;
  deleteMemoryItem(id: string): Promise<boolean>;

  getAutomations(): Promise<Automation[]>;
  toggleAutomation(id: string, enabled: boolean): Promise<boolean>;

  getNotifications(): Promise<NotificationItem[]>;
  markNotificationRead(id: string): Promise<boolean>;
  clearAllNotifications(): Promise<boolean>;

  getIntegrations(): Promise<Integration[]>;
  reconnectIntegration(id: string): Promise<boolean>;

  getAuditLogs(): Promise<SensitiveActionAudit[]>;

  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile>;

  getDiagnostics(): Promise<DiagnosticsData>;
  toggleNetworkFault(isOffline: boolean): void;

  getActiveContext(): Promise<ActiveContext>;
}

// Initial Mock Seed Data reflecting the Reck Companion specification
const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev_pc_home',
    name: 'Home PC',
    platform: 'windows',
    deviceType: 'desktop',
    isOnline: true,
    lastSeen: 'Just now',
    batteryLevel: undefined, // Desktop plugged in
    ipAddress: '192.168.1.142',
    location: 'Home Study',
    currentReckState: 'EXECUTING',
    currentTaskId: 'task_school_report',
    trustState: 'trusted',
    osVersion: 'Windows 11 Pro 24H2',
    reckVersion: 'Reck Desktop v2.4.1',
    capabilities: [
      { id: 'cap_shell', name: 'Shell / Terminal Execution', description: 'Run permitted PowerShell and bash commands', enabled: true, requiresStepUp: true },
      { id: 'cap_fs', name: 'File System Operations', description: 'Create, edit, index, and organize files', enabled: true, requiresStepUp: true },
      { id: 'cap_app', name: 'Application Control', description: 'Launch & manage Chrome, Spotify, IDEs, and office tools', enabled: true, requiresStepUp: false },
      { id: 'cap_audio', name: 'Media Playback Control', description: 'Play, pause, adjust volume and audio streams', enabled: true, requiresStepUp: false },
      { id: 'cap_deep', name: 'Local Model Inference', description: 'Execute local embeddings and multi-modal models', enabled: true, requiresStepUp: false }
    ],
    permissions: [
      { id: 'p1', category: 'remote_command', name: 'Remote Terminal Commands', description: 'Execute arbitrary terminal scripts', level: 'ASK_EVERY_TIME' },
      { id: 'p2', category: 'app_launch', name: 'App Launches', description: 'Open desktop apps via mobile prompt', level: 'ALLOWED' },
      { id: 'p3', category: 'file_system', name: 'File Deletion & Moving', description: 'Delete or overwrite files', level: 'ASK_EVERY_TIME' },
      { id: 'p4', category: 'device_control', name: 'System Power & Sleep', description: 'Put PC to sleep or lock screen', level: 'ALLOWED' }
    ]
  },
  {
    id: 'dev_laptop_work',
    name: 'Work Laptop',
    platform: 'macos',
    deviceType: 'laptop',
    isOnline: true,
    lastSeen: '2m ago',
    batteryLevel: 84,
    ipAddress: '192.168.1.198',
    location: 'Office / Dock',
    currentReckState: 'IDLE',
    trustState: 'trusted',
    osVersion: 'macOS Sequoia 15.3',
    reckVersion: 'Reck Desktop v2.4.1',
    capabilities: [
      { id: 'cap_app', name: 'Application Control', description: 'Launch apps and control IDE', enabled: true, requiresStepUp: false },
      { id: 'cap_fs', name: 'File System Operations', description: 'Access synced project directories', enabled: true, requiresStepUp: true },
      { id: 'cap_code', name: 'Git & Dev Tools', description: 'Perform builds and git checkouts', enabled: true, requiresStepUp: true }
    ],
    permissions: [
      { id: 'p1', category: 'remote_command', name: 'Dev Tasks Execution', description: 'Run automated build tasks', level: 'ALLOWED' },
      { id: 'p2', category: 'file_system', name: 'File Modifications', description: 'Edit repository files', level: 'ALLOWED' }
    ]
  },
  {
    id: 'dev_phone_this',
    name: 'Reck Companion (This Phone)',
    platform: 'android',
    deviceType: 'mobile',
    isOnline: true,
    lastSeen: 'Active',
    batteryLevel: 92,
    ipAddress: '10.0.0.45 (Cellular 5G)',
    currentReckState: 'IDLE',
    trustState: 'trusted',
    isCurrentDevice: true,
    osVersion: 'Android 15 (ARM64)',
    reckVersion: 'Reck Companion Mobile v1.0.0',
    capabilities: [
      { id: 'cap_mic', name: 'Microphone & Voice Engine', description: 'Real-time speech capture and Call Reck sessions', enabled: true, requiresStepUp: false },
      { id: 'cap_bio', name: 'Hardware Biometric Enclave', description: 'Biometric authorization for sensitive desktop commands', enabled: true, requiresStepUp: false },
      { id: 'cap_push', name: 'Encrypted Remote Push', description: 'Receive high-priority approval requests and task telemetry', enabled: true, requiresStepUp: false }
    ],
    permissions: [
      { id: 'p1', category: 'remote_command', name: 'Primary Remote Controller', description: 'Authorize remote commands to other devices', level: 'ALLOWED' },
      { id: 'p2', category: 'sensitive_actions', name: 'Biometric Step-Up Approvals', description: 'Verify critical actions with fingerprint/Face ID', level: 'ALLOWED' }
    ]
  },
  {
    id: 'dev_phone_old',
    name: 'Old Pixel 7',
    platform: 'android',
    deviceType: 'mobile',
    isOnline: false,
    lastSeen: '14 days ago',
    trustState: 'revoked',
    currentReckState: 'OFFLINE',
    osVersion: 'Android 14',
    reckVersion: 'Reck Companion Mobile v0.9.2',
    capabilities: [],
    permissions: []
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task_school_report',
    title: 'School Report & Physics Research',
    description: 'Compiling research papers on Quantum Hall Effect, drafting synthesis summary and generating PDF document.',
    sourceDevice: 'Home PC',
    targetDevice: 'Home PC',
    status: 'ACTIVE',
    progressPercent: 68,
    currentStepIndex: 2,
    steps: [
      { id: 's1', title: 'Sources Extraction', description: 'Gathered 14 arXiv research papers and verified author citations', status: 'completed' },
      { id: 's2', title: 'Data Synthesis & Analysis', description: 'Parsed experimental equations and condensed findings', status: 'completed' },
      { id: 's3', title: 'Executive Summary Drafting', description: 'Structuring main paper chapters and figures', status: 'running' },
      { id: 's4', title: 'Document Formatting', description: 'Converting Markdown to styled PDF with LaTeX equations', status: 'pending' },
      { id: 's5', title: 'Final Save & Verification', description: 'Writing to ~/Documents/Reports/Quantum_Hall_Report.pdf', status: 'pending' }
    ],
    startedAt: '18 minutes ago',
    updatedAt: 'Just now',
    resultFile: {
      id: 'file_report_pdf',
      name: 'Quantum_Hall_School_Report_2026.pdf',
      size: '4.2 MB',
      type: 'pdf',
      downloadUrl: '#',
      generatedByDevice: 'Home PC',
      createdAt: 'Generated just now',
      contentPreview: 'Quantum Hall Effect and Topological Insulators: A Comprehensive 2026 Overview.\n\nAbstract: This investigation explores integer and fractional Hall conductance anomalies...'
    }
  },
  {
    id: 'task_daily_backup',
    title: 'Work Project Build & Test Suite',
    description: 'Running integration tests and artifact build on Work Laptop.',
    sourceDevice: 'Reck Companion (This Phone)',
    targetDevice: 'Work Laptop',
    status: 'COMPLETED',
    progressPercent: 100,
    currentStepIndex: 4,
    steps: [
      { id: 'w1', title: 'Pull latest main branch', status: 'completed' },
      { id: 'w2', title: 'Verify npm dependencies', status: 'completed' },
      { id: 'w3', title: 'Execute test suites (48 passed)', status: 'completed' },
      { id: 'w4', title: 'Generate build bundle', status: 'completed' }
    ],
    startedAt: '45 minutes ago',
    updatedAt: '22 minutes ago',
    completedAt: '22 minutes ago',
    resultFile: {
      id: 'file_build_log',
      name: 'build-report-release-v2.4.log',
      size: '142 KB',
      type: 'code',
      downloadUrl: '#',
      generatedByDevice: 'Work Laptop',
      createdAt: '22 minutes ago',
      contentPreview: '✔ 48 test suites passed in 14.2s\nBuild finished: dist/bundle.min.js (342 kB)'
    }
  }
];

const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr_delete_backup',
    action: 'Delete file',
    target: 'Project_Backup_2025_Q3.zip',
    targetDeviceId: 'dev_pc_home',
    targetDeviceName: 'Home PC',
    requestedBy: 'Reck Desktop Core',
    reason: 'High-risk file action: Automated disk cleanup requested removal of 12.4 GB archive to prevent drive exhaustion.',
    riskLevel: 'HIGH',
    requestedAt: '4 minutes ago',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: 'PENDING',
    actionPayload: {
      path: 'D:\\Backups\\Project_Backup_2025_Q3.zip',
      size: '12.4 GB',
      command: 'Remove-Item -Path "D:\\Backups\\Project_Backup_2025_Q3.zip" -Force'
    }
  }
];

const INITIAL_MEMORY: MemoryItem[] = [
  {
    id: 'mem_1',
    category: 'ABOUT_YOU',
    key: 'Preferred Name',
    value: 'Vashu',
    confidence: 1.0,
    isPersistent: true,
    updatedAt: '2 days ago',
    source: 'Onboarding'
  },
  {
    id: 'mem_2',
    category: 'PREFERENCES',
    key: 'Language Pattern',
    value: 'Fluent Hinglish with technical accuracy in English',
    confidence: 0.98,
    isPersistent: true,
    updatedAt: 'Yesterday',
    source: 'Conversational Inference'
  },
  {
    id: 'mem_3',
    category: 'PROJECTS',
    key: 'Current Focus',
    value: 'Quantum Physics High School Capstone Project & Cloud Infrastructure Architecture',
    confidence: 0.95,
    isPersistent: true,
    updatedAt: '3 hours ago',
    source: 'Desktop Task Tracker'
  },
  {
    id: 'mem_4',
    category: 'DEVICES',
    key: 'Primary Workstation',
    value: 'Home PC (32GB RAM, RTX 4080, dual monitors in Study)',
    confidence: 0.99,
    isPersistent: true,
    updatedAt: '4 days ago',
    source: 'Device Discovery Hub'
  },
  {
    id: 'mem_5',
    category: 'LONG_TERM',
    key: 'Music Preference',
    value: 'Ambient synthwave and deep focus instrumentals while working',
    confidence: 0.91,
    isPersistent: true,
    updatedAt: '1 week ago',
    source: 'Spotify Integration'
  }
];

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'auto_client_call',
    title: 'Client Preparation Brief',
    type: 'UPCOMING',
    scheduleDescription: 'Tomorrow at 5:00 PM',
    nextRun: 'Tomorrow, 5:00 PM',
    targetDevice: 'Home PC',
    enabled: true,
    actionSummary: 'Sync calendar notes, open Zoom and pull latest client proposal'
  },
  {
    id: 'auto_morning_brief',
    title: 'Morning Intelligence Brief',
    type: 'RECURRING',
    scheduleDescription: 'Daily at 7:30 AM',
    nextRun: 'Tomorrow, 7:30 AM',
    targetDevice: 'Reck Companion (This Phone)',
    enabled: true,
    actionSummary: 'Synthesize overnight emails, pending PRs, and day agenda'
  },
  {
    id: 'auto_price_watch',
    title: 'RTX 5090 Price Watcher',
    type: 'WATCHING',
    scheduleDescription: 'Continuous background scrape',
    conditionDescription: 'When price drops below $1,800',
    targetDevice: 'Home PC',
    enabled: true,
    actionSummary: 'Trigger phone alert and reserve cart item if available'
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'approval_required',
    title: 'Approval Required on Home PC',
    message: 'Home PC requires your biometric verification to delete Project_Backup_2025_Q3.zip.',
    timestamp: '4m ago',
    read: false,
    deepLink: { screen: 'approvals' },
    priority: 'high'
  },
  {
    id: 'notif_2',
    type: 'task_complete',
    title: 'Work Laptop: Build Finished',
    message: 'Test suite passed (48/48) and production bundle ready.',
    timestamp: '22m ago',
    read: false,
    deepLink: { screen: 'tasks', params: { taskId: 'task_daily_backup' } },
    priority: 'normal'
  },
  {
    id: 'notif_3',
    type: 'device_status',
    title: 'Home PC Connected',
    message: 'Home PC established secure E2EE channel with Device Hub.',
    timestamp: '1h ago',
    read: true,
    deepLink: { screen: 'devices', params: { deviceId: 'dev_pc_home' } },
    priority: 'low'
  }
];

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'int_google',
    name: 'Google Workspace',
    serviceId: 'google',
    status: 'CONNECTED',
    accountEmail: 'sharmavashu179@gmail.com',
    lastSynced: '8m ago',
    scopes: ['Drive Read/Write', 'Profile Sync']
  },
  {
    id: 'int_gmail',
    name: 'Gmail & Alerts',
    serviceId: 'gmail',
    status: 'CONNECTED',
    accountEmail: 'sharmavashu179@gmail.com',
    lastSynced: '14m ago',
    scopes: ['Read Email Summaries', 'Draft Auto-Responses']
  },
  {
    id: 'int_calendar',
    name: 'Google Calendar',
    serviceId: 'calendar',
    status: 'CONNECTED',
    accountEmail: 'sharmavashu179@gmail.com',
    lastSynced: '5m ago',
    scopes: ['Meeting Sync', 'Schedule Optimization']
  },
  {
    id: 'int_github',
    name: 'GitHub Enterprise',
    serviceId: 'github',
    status: 'CONNECTED',
    accountEmail: 'vashu-dev',
    lastSynced: '1h ago',
    scopes: ['Repos Read', 'Actions Webhooks']
  },
  {
    id: 'int_spotify',
    name: 'Spotify Connect',
    serviceId: 'spotify',
    status: 'CONNECTED',
    accountEmail: 'vashu-premium',
    lastSynced: 'Just now',
    scopes: ['Playback Control', 'Desktop Device Sync']
  }
];

const INITIAL_AUDIT_LOGS: SensitiveActionAudit[] = [
  {
    id: 'audit_1',
    action: 'Execute shell script: git clean -fdx',
    target: 'D:\\Projects\\reck-core',
    targetDevice: 'Home PC',
    status: 'APPROVED',
    authenticatedWith: 'BIOMETRIC_TOUCH',
    timestamp: 'Yesterday, 6:15 PM'
  },
  {
    id: 'audit_2',
    action: 'Grant Temporary File Access to Cloud Agent',
    target: '~/Documents/Financial_2025.xlsx',
    targetDevice: 'Work Laptop',
    status: 'DECLINED',
    authenticatedWith: 'SYSTEM_DECLINE',
    timestamp: '2 days ago, 11:30 AM'
  },
  {
    id: 'audit_3',
    action: 'Device Revocation',
    target: 'Old Pixel 7',
    targetDevice: 'Old Pixel 7',
    status: 'APPROVED',
    authenticatedWith: 'BIOMETRIC_FACE',
    timestamp: '14 days ago, 4:20 PM'
  }
];

export class MockDeviceHubClient implements IDeviceHubClient {
  readonly mode = 'MOCKED' as const;
  private devices = [...INITIAL_DEVICES];
  private tasks = [...INITIAL_TASKS];
  private approvals = [...INITIAL_APPROVALS];
  private memory = [...INITIAL_MEMORY];
  private automations = [...INITIAL_AUTOMATIONS];
  private notifications = [...INITIAL_NOTIFICATIONS];
  private integrations = [...INITIAL_INTEGRATIONS];
  private auditLogs = [...INITIAL_AUDIT_LOGS];
  private isOffline = false;

  private userProfile: UserProfile = {
    id: 'usr_vashu_01',
    name: 'Vashu Sharma',
    email: 'sharmavashu179@gmail.com',
    authProvider: 'google',
    phoneRegisteredAt: '2026-08-15T10:00:00Z',
    biometricsEnrolled: true,
    preferredLanguage: 'hinglish'
  };

  private activeContext: ActiveContext = {
    currentProject: 'Quantum Physics Report',
    activeConversationTopic: 'School Report progress on Home PC',
    selectedDeviceId: 'dev_pc_home',
    ongoingTaskId: 'task_school_report',
    relevantFile: 'Quantum_Hall_School_Report_2026.pdf',
    userActivity: 'Mobile supervision away from desktop',
    environment: 'Secured Cellular 5G -> Reck Device Hub'
  };

  async getDevices(): Promise<Device[]> {
    if (this.isOffline) {
      return this.devices.map(d => ({ ...d, isOnline: d.isCurrentDevice ? true : false }));
    }
    return [...this.devices];
  }

  async getDeviceById(id: string): Promise<Device | undefined> {
    return this.devices.find(d => d.id === id);
  }

  async sendRemoteCommand(deviceId: string, command: string): Promise<RemoteCommandResult> {
    const startTime = Date.now();
    await new Promise(r => setTimeout(r, 600)); // Network round trip simulation

    if (this.isOffline) {
      return {
        commandId: `cmd_${Date.now()}`,
        targetDeviceId: deviceId,
        status: 'OFFLINE',
        output: 'Device Hub is currently offline. Ensure network connectivity.',
        executionTimeMs: Date.now() - startTime,
        returnedAt: new Date().toISOString()
      };
    }

    const device = this.devices.find(d => d.id === deviceId);
    if (!device || !device.isOnline) {
      return {
        commandId: `cmd_${Date.now()}`,
        targetDeviceId: deviceId,
        status: 'OFFLINE',
        output: `Target device "${device ? device.name : deviceId}" is currently unreachable or offline.`,
        executionTimeMs: Date.now() - startTime,
        returnedAt: new Date().toISOString()
      };
    }

    const lower = command.toLowerCase();

    // Check specific remote actions
    if (lower.includes('chrome')) {
      return {
        commandId: `cmd_${Date.now()}`,
        targetDeviceId: deviceId,
        status: 'SUCCESS',
        output: `Launched Google Chrome on ${device.name} (Window ID: 0x4B21, Profile: Default).`,
        executionTimeMs: 412,
        returnedAt: new Date().toISOString()
      };
    }

    if (lower.includes('spotify')) {
      return {
        commandId: `cmd_${Date.now()}`,
        targetDeviceId: deviceId,
        status: 'SUCCESS',
        output: `Spotify activated on ${device.name}. Resumed playlist "Deep Focus Synthetics".`,
        executionTimeMs: 380,
        returnedAt: new Date().toISOString()
      };
    }

    if (lower.includes('battery') || lower.includes('status')) {
      const bat = device.batteryLevel !== undefined ? `${device.batteryLevel}%` : 'AC Power / Plugged In';
      return {
        commandId: `cmd_${Date.now()}`,
        targetDeviceId: deviceId,
        status: 'SUCCESS',
        output: `${device.name} Status: Online | Power: ${bat} | OS: ${device.osVersion} | Reck State: ${device.currentReckState}.`,
        executionTimeMs: 220,
        returnedAt: new Date().toISOString()
      };
    }

    if (lower.includes('report') || lower.includes('task')) {
      return {
        commandId: `cmd_${Date.now()}`,
        targetDeviceId: deviceId,
        status: 'SUCCESS',
        output: `Active Task on ${device.name}: "School Report & Physics Research" is at 68% progress. Currently drafting Executive Summary.`,
        executionTimeMs: 310,
        returnedAt: new Date().toISOString()
      };
    }

    return {
      commandId: `cmd_${Date.now()}`,
      targetDeviceId: deviceId,
      status: 'SUCCESS',
      output: `Executed command "${command}" on ${device.name} via Reck Desktop Core. Process exit code 0.`,
      executionTimeMs: 480,
      returnedAt: new Date().toISOString()
    };
  }

  async updateDevicePermission(deviceId: string, permissionId: string, level: any): Promise<boolean> {
    const dev = this.devices.find(d => d.id === deviceId);
    if (dev) {
      const perm = dev.permissions.find(p => p.id === permissionId);
      if (perm) {
        perm.level = level;
        return true;
      }
    }
    return false;
  }

  async renameDevice(deviceId: string, newName: string): Promise<boolean> {
    const dev = this.devices.find(d => d.id === deviceId);
    if (dev) {
      dev.name = newName;
      return true;
    }
    return false;
  }

  async revokeDevice(deviceId: string): Promise<boolean> {
    const dev = this.devices.find(d => d.id === deviceId);
    if (dev) {
      dev.trustState = 'revoked';
      dev.isOnline = false;
      this.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        action: `Revoke Device Authorization`,
        target: dev.name,
        targetDevice: dev.name,
        status: 'APPROVED',
        authenticatedWith: 'BIOMETRIC_FACE',
        timestamp: 'Just now'
      });
      return true;
    }
    return false;
  }

  async getTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.tasks.find(t => t.id === id);
  }

  async pauseTask(id: string): Promise<boolean> {
    const task = this.tasks.find(t => t.id === id);
    if (task && task.status === 'ACTIVE') {
      task.status = 'WAITING';
      return true;
    }
    return false;
  }

  async resumeTask(id: string): Promise<boolean> {
    const task = this.tasks.find(t => t.id === id);
    if (task && task.status === 'WAITING') {
      task.status = 'ACTIVE';
      return true;
    }
    return false;
  }

  async cancelTask(id: string): Promise<boolean> {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = 'CANCELLED';
      return true;
    }
    return false;
  }

  async retryTask(id: string): Promise<boolean> {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = 'ACTIVE';
      task.progressPercent = 10;
      return true;
    }
    return false;
  }

  async handoffTaskFile(taskId: string, targetDeviceId: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 700));
    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.resultFile) {
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        type: 'file_ready',
        title: 'File Transferred to Phone',
        message: `${task.resultFile.name} (${task.resultFile.size}) has been securely synced from ${task.sourceDevice}.`,
        timestamp: 'Just now',
        read: false,
        deepLink: { screen: 'filePreview', params: { fileId: task.resultFile.id } },
        priority: 'high'
      });
      return true;
    }
    return false;
  }

  async getApprovals(): Promise<ApprovalRequest[]> {
    return [...this.approvals];
  }

  async resolveApproval(approvalId: string, approved: boolean, biometricType: string = 'FINGERPRINT', _pin?: string): Promise<ApprovalResult> {
    await new Promise(r => setTimeout(r, 650));
    const appr = this.approvals.find(a => a.id === approvalId);
    if (!appr) {
      throw new Error(`Approval request ${approvalId} not found`);
    }

    appr.status = approved ? 'APPROVED' : 'DECLINED';

    const result: ApprovalResult = {
      approvalId,
      status: appr.status,
      timestamp: new Date().toISOString(),
      biometricVerified: approved,
      biometricType: biometricType as any,
      scopedToken: approved ? `reck_sec_token_${Math.random().toString(36).substring(2)}` : undefined,
      targetDeviceId: appr.targetDeviceId
    };

    this.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      action: `${approved ? 'Approved' : 'Declined'}: ${appr.action}`,
      target: appr.target,
      targetDevice: appr.targetDeviceName,
      status: approved ? 'APPROVED' : 'DECLINED',
      authenticatedWith: biometricType === 'FACE_ID' ? 'BIOMETRIC_FACE' : biometricType === 'PIN' ? 'PIN' : 'BIOMETRIC_TOUCH',
      timestamp: 'Just now'
    });

    return result;
  }

  async pairNewDevice(deviceData: Omit<Device, 'id'>): Promise<Device> {
    const newDev: Device = {
      ...deviceData,
      id: `dev_${Date.now()}`
    };
    this.devices.push(newDev);
    return newDev;
  }

  async getMemoryItems(): Promise<MemoryItem[]> {
    return [...this.memory];
  }

  async saveMemoryItem(item: Omit<MemoryItem, 'id' | 'updatedAt'>): Promise<MemoryItem> {
    const newItem: MemoryItem = {
      ...item,
      id: `mem_${Date.now()}`,
      updatedAt: 'Just now'
    };
    this.memory.unshift(newItem);
    return newItem;
  }

  async deleteMemoryItem(id: string): Promise<boolean> {
    const idx = this.memory.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.memory.splice(idx, 1);
      return true;
    }
    return false;
  }

  async getAutomations(): Promise<Automation[]> {
    return [...this.automations];
  }

  async toggleAutomation(id: string, enabled: boolean): Promise<boolean> {
    const auto = this.automations.find(a => a.id === id);
    if (auto) {
      auto.enabled = enabled;
      return true;
    }
    return false;
  }

  async getNotifications(): Promise<NotificationItem[]> {
    return [...this.notifications];
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  async clearAllNotifications(): Promise<boolean> {
    this.notifications = [];
    return true;
  }

  async getIntegrations(): Promise<Integration[]> {
    return [...this.integrations];
  }

  async reconnectIntegration(id: string): Promise<boolean> {
    const int = this.integrations.find(i => i.id === id);
    if (int) {
      int.status = 'CONNECTED';
      int.lastSynced = 'Just now';
      return true;
    }
    return false;
  }

  async getAuditLogs(): Promise<SensitiveActionAudit[]> {
    return [...this.auditLogs];
  }

  async getUserProfile(): Promise<UserProfile> {
    return { ...this.userProfile };
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    this.userProfile = { ...this.userProfile, ...profile };
    return { ...this.userProfile };
  }

  async getDiagnostics(): Promise<DiagnosticsData> {
    return {
      hubConnectionStatus: this.isOffline ? 'offline' : 'connected',
      hubLatencyMs: this.isOffline ? 0 : 24,
      deviceMeshCount: this.devices.filter(d => d.isOnline).length,
      batteryOptimized: true,
      secureEnclaveStatus: 'active',
      e2eeFingerprint: '4A9F-91CD-E5B2-7788-D021',
      activeTransport: 'WebRTC / TLS 1.3 DataChannel'
    };
  }

  toggleNetworkFault(isOffline: boolean): void {
    this.isOffline = isOffline;
  }

  async getActiveContext(): Promise<ActiveContext> {
    return { ...this.activeContext };
  }
}

/**
 * Placeholder client for production deployment.
 * Real production device hub communicates over authenticated WebSockets / gRPC.
 */
export class RealDeviceHubClient implements Partial<IDeviceHubClient> {
  readonly mode = 'INTEGRATION-READY' as const;
  private endpointUrl: string;

  constructor(endpointUrl = 'https://api.reck.ecosystem/v1') {
    this.endpointUrl = endpointUrl;
  }

  async getDevices(): Promise<Device[]> {
    throw new Error('BACKEND REQUIRED: RealDeviceHubClient requires active Reck Device Hub server at ' + this.endpointUrl);
  }
}

// Global singleton client
export const deviceHubClient = new MockDeviceHubClient();
