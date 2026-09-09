/**
 * Reck Companion - Gmail & Google Workspace Integration Service
 * Manages OAuth 2.0 via Firebase Auth with in-memory token storage,
 * and communicates directly with the Gmail REST API (v1).
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { GmailMessage, GmailLabel, GmailSendPayload } from '../types';

// Desired & granted Google Workspace scopes (Gmail, Tasks, Calendar, Meet, Contacts, Chat, Drive, Forms)
export const WORKSPACE_SCOPES = [
  // Gmail
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
  // Google Tasks
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  // Google Calendar
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  // Google Meet
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  // Contacts
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  // Google Chat
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.memberships',
  // Google Drive
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  // Google Forms
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly'
];

export const GMAIL_SCOPES = WORKSPACE_SCOPES;

// Initialize Firebase App safely (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);

// Provider configuration with full Google Workspace scopes
const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

// In-memory access token cache (MANDATORY: Never write to localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Base64URL helpers for RFC 2822 email payloads
function encodeBase64Url(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

function decodeBase64Url(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    return '';
  }
}

/**
 * Initializes the Firebase Auth listener.
 */
export const initGmailAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Launches the official Google Sign-In popup requesting Gmail scopes.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token for Gmail.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Signs the user out and wipes in-memory tokens.
 */
export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Returns the cached in-memory access token.
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getGoogleAccessToken = getAccessToken;

/**
 * Returns current Firebase Auth user if authenticated.
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Fallback preview messages for demonstrating the interface prior to user sign-in
const MOCK_GMAIL_PREVIEWS: GmailMessage[] = [
  {
    id: 'msg_demo_1',
    threadId: 'th_demo_1',
    subject: 'Project Nova: Architecture Review & Security Cleared',
    from: 'Elena Rostova <elena.rostova@reck-systems.internal>',
    fromName: 'Elena Rostova',
    fromEmail: 'elena.rostova@reck-systems.internal',
    to: 'sharmavashu179@gmail.com',
    date: '10:42 AM',
    internalDate: String(Date.now() - 3600000),
    snippet: 'Hey Vashu, I completed the review of the Reck Companion synchronization mesh. All biometric step-up flows are approved for deployment...',
    unread: true,
    starred: true,
    labelIds: ['INBOX', 'IMPORTANT'],
    bodyText: `Hey Vashu,

I have thoroughly reviewed the Reck Companion multi-device orchestration pipeline. The remote command execution channel and biometric authorization thresholds align perfectly with our security envelope.

Key highlights:
1. End-to-end telemetry sandboxing verified.
2. Step-up approval tokens expire reliably after 90 seconds.
3. Linear task handoff to phone is operational.

Let me know if you want to sync before the production push.

Best regards,
Elena Rostova
Lead Security Systems Engineer`
  },
  {
    id: 'msg_demo_2',
    threadId: 'th_demo_2',
    subject: 'Google Cloud Alert: New device paired with Reck Ecosystem',
    from: 'Google Cloud Platform <cloud-noreply@google.com>',
    fromName: 'Google Cloud Platform',
    fromEmail: 'cloud-noreply@google.com',
    to: 'sharmavashu179@gmail.com',
    date: 'Yesterday',
    internalDate: String(Date.now() - 86400000),
    snippet: 'Your Cloud Run instance ais-dev-ayxnbrlbsowrtjckjwhm5b was successfully deployed. E2EE mesh initialized with 3 active devices...',
    unread: false,
    starred: false,
    labelIds: ['INBOX'],
    bodyText: `Notice of Cloud Run deployment:

Project ID: hypnic-bongo-0ghtt
Service: reck-companion-mobile
Status: Active & Serving traffic on Port 3000.

Connected integrations:
- Gmail REST API (Read, Modify, Send, Compose)
- Firebase Auth Token Provider

Security recommendation: Keep least-privilege policies active.`
  },
  {
    id: 'msg_demo_3',
    threadId: 'th_demo_3',
    subject: 'Action Required: Confirm Q3 Hardware Procurement Order',
    from: 'Siddharth Patel <siddharth@quantumhardware.io>',
    fromName: 'Siddharth Patel',
    fromEmail: 'siddharth@quantumhardware.io',
    to: 'sharmavashu179@gmail.com',
    date: 'Sep 6',
    internalDate: String(Date.now() - 172800000),
    snippet: 'The invoice for the 2x RTX workstation upgrades and secure enclave modules has been prepared. Please confirm shipping address...',
    unread: false,
    starred: true,
    labelIds: ['INBOX', 'PURCHASES'],
    bodyText: `Hi Vashu,

The hardware manifest for your compute hub is assembled:
- 2x High-density compute nodes
- Hardware Security Key Modules (FIDO2 Level 3)

Please confirm if delivery should be routed to the home lab or primary office.`
  }
];

/**
 * Lists messages from Gmail API, with mock preview fallback if not signed in.
 */
export const listGmailMessages = async (options: {
  query?: string;
  labelIds?: string[];
  maxResults?: number;
} = {}): Promise<{ messages: GmailMessage[]; isLive: boolean }> => {
  const token = getAccessToken();
  if (!token) {
    let filtered = [...MOCK_GMAIL_PREVIEWS];
    if (options.query) {
      const q = options.query.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.subject.toLowerCase().includes(q) ||
          m.snippet.toLowerCase().includes(q) ||
          m.from.toLowerCase().includes(q)
      );
    }
    return { messages: filtered, isLive: false };
  }

  const { query, labelIds, maxResults = 15 } = options;
  const params = new URLSearchParams();
  params.set('maxResults', String(maxResults));
  if (query) params.set('q', query);
  if (labelIds && labelIds.length > 0) {
    labelIds.forEach(id => params.append('labelIds', id));
  }

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `Gmail API error: ${response.statusText}`);
  }

  const data = await response.json();
  const rawList: { id: string; threadId: string }[] = data.messages || [];

  // Fetch header details for each message in parallel
  const detailPromises = rawList.slice(0, maxResults).map(async item => {
    return getGmailMessageDetails(item.id);
  });

  const detailedMessages = await Promise.all(detailPromises);
  return {
    messages: detailedMessages.filter((m): m is GmailMessage => m !== null),
    isLive: true
  };
};

/**
 * Fetches full details of a specific Gmail message.
 */
export const getGmailMessageDetails = async (messageId: string): Promise<GmailMessage | null> => {
  const token = getAccessToken();
  if (!token) {
    const mock = MOCK_GMAIL_PREVIEWS.find(m => m.id === messageId);
    return mock || null;
  }

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    }
  );

  if (!res.ok) return null;
  const msg = await res.json();

  const headers = msg.payload?.headers || [];
  const getHeader = (name: string) => {
    const h = headers.find((x: any) => x.name?.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  const subject = getHeader('Subject') || '(No Subject)';
  const from = getHeader('From') || '';
  const to = getHeader('To') || '';
  const date = getHeader('Date') || '';

  // Parse sender name and email
  let fromName = from;
  let fromEmail = from;
  const match = from.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    fromName = match[1].replace(/"/g, '').trim();
    fromEmail = match[2].trim();
  }

  // Extract body content
  let bodyText = '';
  let bodyHtml = '';

  const extractParts = (part: any) => {
    if (!part) return;
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText += decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml += decodeBase64Url(part.body.data);
    }
    if (part.parts) {
      part.parts.forEach(extractParts);
    }
  };

  if (msg.payload?.body?.data) {
    const decoded = decodeBase64Url(msg.payload.body.data);
    if (msg.payload.mimeType === 'text/html') {
      bodyHtml = decoded;
    } else {
      bodyText = decoded;
    }
  } else if (msg.payload?.parts) {
    msg.payload.parts.forEach(extractParts);
  }

  const labelIds = msg.labelIds || [];

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet || '',
    subject,
    from,
    fromName,
    fromEmail,
    to,
    date,
    internalDate: msg.internalDate || String(Date.now()),
    unread: labelIds.includes('UNREAD'),
    starred: labelIds.includes('STARRED'),
    labelIds,
    bodyHtml: bodyHtml || undefined,
    bodyText: bodyText || msg.snippet || ''
  };
};

/**
 * Sends an email through the Gmail API.
 * Note: Caller MUST display an explicit user confirmation dialog before calling this!
 */
export const sendGmailMessage = async (payload: GmailSendPayload): Promise<{ id: string; threadId: string }> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be signed in with Google to send emails.');
  }

  const emailLines = [
    `To: ${payload.to}`,
    payload.cc ? `Cc: ${payload.cc}` : '',
    payload.bcc ? `Bcc: ${payload.bcc}` : '',
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    payload.body
  ].filter(line => line !== null && line !== undefined);

  const rawMessage = emailLines.join('\r\n');
  const encodedEmail = encodeBase64Url(rawMessage);

  const requestBody: any = { raw: encodedEmail };
  if (payload.threadId) {
    requestBody.threadId = payload.threadId;
  }

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email: ${res.statusText}`);
  }

  return await res.json();
};

/**
 * Saves an email draft to Gmail.
 */
export const createGmailDraft = async (payload: GmailSendPayload): Promise<{ id: string }> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('You must be signed in with Google to create drafts.');
  }

  const emailLines = [
    `To: ${payload.to}`,
    payload.cc ? `Cc: ${payload.cc}` : '',
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    payload.body
  ].filter(line => line !== null && line !== undefined);

  const rawMessage = emailLines.join('\r\n');
  const encodedEmail = encodeBase64Url(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        raw: encodedEmail,
        ...(payload.threadId ? { threadId: payload.threadId } : {})
      }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create draft: ${res.statusText}`);
  }

  return await res.json();
};

/**
 * Moves a message to Trash.
 * Note: Caller MUST display explicit user confirmation before executing!
 */
export const trashGmailMessage = async (messageId: string): Promise<boolean> => {
  const token = getAccessToken();
  if (!token) {
    return true; // Mock success
  }

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to move email to trash: ${res.statusText}`);
  }

  return true;
};

/**
 * Toggles STARRED label on a message.
 */
export const toggleGmailStar = async (messageId: string, currentStarred: boolean): Promise<boolean> => {
  const token = getAccessToken();
  if (!token) return !currentStarred;

  const body = currentStarred
    ? { removeLabelIds: ['STARRED'] }
    : { addLabelIds: ['STARRED'] };

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  return res.ok;
};

/**
 * Marks a message as read or unread.
 */
export const markGmailAsRead = async (messageId: string, isRead: boolean): Promise<boolean> => {
  const token = getAccessToken();
  if (!token) return true;

  const body = isRead
    ? { removeLabelIds: ['UNREAD'] }
    : { addLabelIds: ['UNREAD'] };

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  return res.ok;
};

/**
 * Fetches Gmail labels.
 */
export const listGmailLabels = async (): Promise<GmailLabel[]> => {
  const token = getAccessToken();
  if (!token) {
    return [
      { id: 'INBOX', name: 'Inbox', messagesTotal: 24, messagesUnread: 3 },
      { id: 'STARRED', name: 'Starred', messagesTotal: 5, messagesUnread: 0 },
      { id: 'SENT', name: 'Sent', messagesTotal: 42, messagesUnread: 0 },
      { id: 'DRAFT', name: 'Drafts', messagesTotal: 2, messagesUnread: 0 },
      { id: 'TRASH', name: 'Trash', messagesTotal: 12, messagesUnread: 0 }
    ];
  }

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.labels || []).filter((l: any) =>
    ['INBOX', 'STARRED', 'SENT', 'DRAFT', 'TRASH', 'IMPORTANT', 'SPAM'].includes(l.id) || l.type === 'user'
  );
};
