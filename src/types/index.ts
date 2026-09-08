/**
 * Reck Companion - Domain Models and Type Definitions
 * Represents the official mobile companion application contracts for the Reck Ecosystem.
 */

export type ReckState =
  | 'IDLE'
  | 'LISTENING'
  | 'UNDERSTANDING'
  | 'THINKING'
  | 'PLANNING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'WAITING_FOR_APPROVAL'
  | 'OFFLINE'
  | 'ERROR';

export type PlatformType = 'android' | 'ios' | 'windows' | 'macos' | 'linux';

export type DeviceTrustState = 'trusted' | 'pending_verification' | 'restricted' | 'revoked';

export interface DeviceCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresStepUp: boolean;
}

export type PermissionLevel = 'ALLOWED' | 'LIMITED' | 'ASK_EVERY_TIME' | 'BLOCKED';

export interface DevicePermission {
  id: string;
  category: 'remote_command' | 'file_system' | 'device_control' | 'app_launch' | 'process_control' | 'sensitive_actions';
  name: string;
  description: string;
  level: PermissionLevel;
}

export interface Device {
  id: string;
  name: string;
  platform: PlatformType;
  deviceType: 'desktop' | 'laptop' | 'mobile' | 'tablet';
  isOnline: boolean;
  lastSeen: string; // ISO string or relative
  batteryLevel?: number;
  ipAddress?: string;
  location?: string;
  currentReckState: ReckState;
  currentTaskId?: string;
  trustState: DeviceTrustState;
  isCurrentDevice?: boolean;
  capabilities: DeviceCapability[];
  permissions: DevicePermission[];
  osVersion: string;
  reckVersion: string;
}

export type TaskStatus =
  | 'ACTIVE'
  | 'WAITING'
  | 'WAITING_FOR_APPROVAL'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  startedAt?: string;
  completedAt?: string;
}

export interface TaskResultFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'document' | 'code' | 'image' | 'archive' | 'data';
  downloadUrl: string;
  generatedByDevice: string;
  createdAt: string;
  contentPreview?: string;
  previewContent?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  sourceDevice: string; // Device ID or name
  targetDevice: string; // Device ID or name
  status: TaskStatus;
  progressPercent: number;
  currentStepIndex: number;
  steps: TaskStep[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  resultFile?: TaskResultFile;
  errorMessage?: string;
}

export type ApprovalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ApprovalRequest {
  id: string;
  action: string; // e.g., "Delete file", "Execute shell command", "Send email"
  target: string; // e.g., "Project_Backup.zip", "npm run deploy"
  targetDeviceId: string;
  targetDeviceName: string;
  requestedBy: string; // e.g., "Reck Desktop Core"
  reason: string; // e.g., "High-risk file removal required to free cache space"
  riskLevel: ApprovalRiskLevel;
  requestedAt: string;
  expiresAt: string; // ISO string
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED';
  actionPayload?: Record<string, unknown>;
}

export interface ApprovalResult {
  approvalId: string;
  status: 'APPROVED' | 'DECLINED' | 'EXPIRED';
  timestamp: string;
  biometricVerified: boolean;
  biometricType?: 'FINGERPRINT' | 'FACE_ID' | 'PIN';
  scopedToken?: string;
  targetDeviceId: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'reck';
  content: string;
  timestamp: string;
  language?: 'en' | 'hi' | 'hinglish';
  targetDevice?: string;
  commandPipeline?: {
    origin: string;
    hub: string;
    target: string;
    action: string;
    status: 'transmitting' | 'executing' | 'success' | 'failed';
  };
  relatedTaskId?: string;
  relatedApprovalId?: string;
  attachment?: TaskResultFile;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  activeTargetDeviceId?: string;
  lastActive: string;
}

export type MemoryCategory =
  | 'ABOUT_YOU'
  | 'PREFERENCES'
  | 'PROJECTS'
  | 'WORKFLOWS'
  | 'DEVICES'
  | 'LONG_TERM';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: number;
  isPersistent: boolean; // true = permanent memory, false = transient context
  updatedAt: string;
  source: string;
}

export interface ActiveContext {
  currentProject: string;
  activeConversationTopic: string;
  selectedDeviceId: string;
  ongoingTaskId?: string;
  relevantFile?: string;
  userActivity: string;
  environment: string;
}

export interface Automation {
  id: string;
  title: string;
  type: 'NOW' | 'UPCOMING' | 'RECURRING' | 'WATCHING';
  scheduleDescription: string;
  nextRun?: string;
  conditionDescription?: string;
  targetDevice: string;
  enabled: boolean;
  actionSummary: string;
}

export interface NotificationItem {
  id: string;
  type: 'task_complete' | 'task_failed' | 'approval_required' | 'reminder' | 'device_status' | 'condition_met' | 'file_ready';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  deepLink: {
    screen: string;
    params?: Record<string, string>;
  };
  priority: 'low' | 'normal' | 'high';
}

export interface Integration {
  id: string;
  name: string;
  serviceId: 'google' | 'gmail' | 'calendar' | 'github' | 'cloud_storage' | 'spotify' | 'slack';
  status: 'CONNECTED' | 'NEEDS_ATTENTION' | 'DISCONNECTED';
  accountEmail: string;
  lastSynced: string;
  scopes: string[];
}

export interface SensitiveActionAudit {
  id: string;
  action: string;
  target: string;
  targetDevice: string;
  status: 'APPROVED' | 'DECLINED' | 'AUTO_BLOCKED';
  authenticatedWith: 'BIOMETRIC_TOUCH' | 'BIOMETRIC_FACE' | 'PIN' | 'SYSTEM_DECLINE';
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  authProvider: 'google' | 'github' | 'facebook' | 'passkey';
  phoneRegisteredAt: string;
  biometricsEnrolled: boolean;
  preferredLanguage: 'en' | 'hi' | 'hinglish';
}

export interface RemoteCommand {
  id: string;
  naturalQuery: string;
  parsedAction: string;
  targetDeviceId: string;
  sourceDeviceId: string;
  timestamp: string;
}

export interface RemoteCommandResult {
  commandId: string;
  targetDeviceId: string;
  status: 'SUCCESS' | 'FAILED' | 'OFFLINE' | 'DENIED';
  output: string;
  executionTimeMs: number;
  returnedAt: string;
}

export interface VoiceSession {
  sessionId: string;
  isActive: boolean;
  isMuted: boolean;
  speakerMode: 'speaker' | 'earpiece';
  durationSeconds: number;
  encryptionCipher: 'AES-256-GCM (Quantum E2EE)' | 'TLS 1.3 Strict';
  targetDevice?: string;
  audioLevels: number[];
}

export interface DiagnosticsData {
  hubConnectionStatus: 'connected' | 'reconnecting' | 'offline';
  hubLatencyMs: number;
  deviceMeshCount: number;
  batteryOptimized: boolean;
  secureEnclaveStatus: 'active' | 'unavailable';
  e2eeFingerprint: string;
  activeTransport: 'WebRTC / TLS 1.3 DataChannel' | 'WSS / gRPC Proxy';
}
