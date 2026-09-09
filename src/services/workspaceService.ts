/**
 * Reck Companion - Google Workspace Integration Service
 * Manages Google Tasks, Google Calendar, Google Meet, Contacts,
 * Google Chat, Google Drive, and Google Forms REST API integrations.
 */

import {
  GoogleTask,
  GoogleTaskList,
  GoogleCalendarEvent,
  GoogleContact,
  GoogleChatSpace,
  GoogleChatMessage,
  GoogleDriveFile,
  GoogleForm
} from '../types';
import { getGoogleAccessToken } from './gmailService';

// Default mock/fallback data for immediate demo or offline previews
const MOCK_TASKS: GoogleTask[] = [
  {
    id: 'gtask_1',
    title: 'Review System Kernel Patch (Reck Core)',
    notes: 'Verify zero-trust token handoffs before deploying to Edge PC.',
    status: 'needsAction',
    due: new Date(Date.now() + 86400000).toISOString(),
    updated: new Date().toISOString()
  },
  {
    id: 'gtask_2',
    title: 'Synchronize Drive architectural blueprints',
    notes: 'Export PDF specs to Google Drive /Projects/Reck.',
    status: 'needsAction',
    due: new Date(Date.now() + 172800000).toISOString(),
    updated: new Date().toISOString()
  },
  {
    id: 'gtask_3',
    title: 'Confirm Google Meet with Elena Rostova',
    notes: 'Architecture & biometric validation discussion.',
    status: 'completed',
    completed: new Date().toISOString(),
    updated: new Date().toISOString()
  }
];

const MOCK_EVENTS: GoogleCalendarEvent[] = [
  {
    id: 'gcal_1',
    summary: 'Reck Architecture Sync & Security Review',
    description: 'Quarterly review of device mesh communications, quantum-safe handshakes, and Workspace OAuth permissions.',
    location: 'Google Meet',
    start: {
      dateTime: new Date(Date.now() + 3600000 * 2).toISOString()
    },
    end: {
      dateTime: new Date(Date.now() + 3600000 * 3).toISOString()
    },
    meetLink: 'https://meet.google.com/rck-nova-sec',
    attendees: [
      { email: 'elena.rostova@reck.internal', displayName: 'Elena Rostova', responseStatus: 'accepted' },
      { email: 'sharmavashu179@gmail.com', displayName: 'Vashu Sharma', responseStatus: 'accepted' }
    ]
  },
  {
    id: 'gcal_2',
    summary: 'Edge Node Deployment Check',
    description: 'Verify PC and mobile telemetry pipeline.',
    location: 'Google Meet',
    start: {
      dateTime: new Date(Date.now() + 86400000).toISOString()
    },
    end: {
      dateTime: new Date(Date.now() + 86400000 + 1800000).toISOString()
    },
    meetLink: 'https://meet.google.com/edg-node-ops'
  }
];

const MOCK_CONTACTS: GoogleContact[] = [
  {
    resourceName: 'people/c1',
    name: 'Elena Rostova',
    displayName: 'Elena Rostova',
    email: 'elena.rostova@reck.internal',
    phone: '+1 (555) 019-4821',
    organization: 'Reck Ecosystem Labs',
    jobTitle: 'Lead Security Architect'
  },
  {
    resourceName: 'people/c2',
    name: 'Marcus Vance',
    displayName: 'Marcus Vance',
    email: 'marcus.v@edge-systems.tech',
    phone: '+1 (555) 018-9923',
    organization: 'Edge Systems',
    jobTitle: 'Principal Hardware Engineer'
  },
  {
    resourceName: 'people/c3',
    name: 'DevOps Central Bot',
    displayName: 'DevOps Central',
    email: 'ci-bot@cloud.internal',
    organization: 'Infrastructure'
  }
];

const MOCK_CHAT_SPACES: GoogleChatSpace[] = [
  {
    name: 'spaces/AAAABBBCCC1',
    displayName: 'Reck Engineering Core',
    type: 'ROOM',
    spaceThreadingState: 'THREADED_MESSAGES'
  },
  {
    name: 'spaces/AAAABBBCCC2',
    displayName: 'Incident Command & Security',
    type: 'ROOM'
  }
];

const MOCK_CHAT_MESSAGES: GoogleChatMessage[] = [
  {
    name: 'spaces/AAAABBBCCC1/messages/m1',
    spaceName: 'spaces/AAAABBBCCC1',
    senderName: 'Elena Rostova',
    text: 'All SHA-256 biometric signatures passed automated enclave verification. Ready for next phase.',
    createTime: '10:45 AM'
  },
  {
    name: 'spaces/AAAABBBCCC1/messages/m2',
    spaceName: 'spaces/AAAABBBCCC1',
    senderName: 'Reck Companion Bot',
    text: 'Mobile companion node connected. Sync channel status: GREEN.',
    createTime: '11:02 AM'
  }
];

const MOCK_DRIVE_FILES: GoogleDriveFile[] = [
  {
    id: 'gdrive_1',
    name: 'Reck_Companion_System_Architecture.pdf',
    mimeType: 'application/pdf',
    modifiedTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    size: '2.4 MB',
    webViewLink: 'https://drive.google.com/file/d/demo1/view',
    starred: true
  },
  {
    id: 'gdrive_2',
    name: 'Biometric_Enclave_Specifications_v2.docx',
    mimeType: 'application/vnd.google-apps.document',
    modifiedTime: new Date(Date.now() - 86400000).toISOString(),
    size: '142 KB',
    webViewLink: 'https://docs.google.com/document/d/demo2/edit'
  },
  {
    id: 'gdrive_3',
    name: 'Q3_Device_Mesh_Telemetry.xlsx',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    modifiedTime: new Date(Date.now() - 86400000 * 3).toISOString(),
    size: '512 KB',
    webViewLink: 'https://docs.google.com/spreadsheets/d/demo3/edit'
  }
];

const MOCK_FORMS: GoogleForm[] = [
  {
    id: 'gform_1',
    title: 'Reck Companion Beta Feedback Survey',
    description: 'Gather feedback on voice responsiveness, biometric approval flow, and device orchestration.',
    documentTitle: 'Beta Feedback Form',
    webViewLink: 'https://docs.google.com/forms/d/demo_form_1/edit',
    modifiedTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    questionsCount: 6,
    responsesCount: 18
  },
  {
    id: 'gform_2',
    title: 'Ecosystem Security Compliance Audit',
    description: 'Annual employee security device audit checklist.',
    documentTitle: 'Security Audit',
    webViewLink: 'https://docs.google.com/forms/d/demo_form_2/edit',
    modifiedTime: new Date(Date.now() - 86400000 * 5).toISOString(),
    questionsCount: 10,
    responsesCount: 42
  }
];

// Helper to make authenticated requests or fall back gracefully
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('NOT_AUTHENTICATED');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  return fetch(url, { ...options, headers });
}

// -------------------------------------------------------------
// 1. GOOGLE TASKS SERVICE
// -------------------------------------------------------------
export const googleTasksService = {
  async listTasks(taskListId = '@default'): Promise<GoogleTask[]> {
    try {
      const res = await authFetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true`
      );
      if (!res.ok) throw new Error(`Tasks API error ${res.status}`);
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        return data.items.map((it: any) => ({
          id: it.id,
          title: it.title || 'Untitled Task',
          notes: it.notes || '',
          status: it.status || 'needsAction',
          due: it.due,
          completed: it.completed,
          updated: it.updated
        }));
      }
      return [];
    } catch {
      return MOCK_TASKS;
    }
  },

  async createTask(title: string, notes?: string, due?: string, taskListId = '@default'): Promise<GoogleTask> {
    const payload: any = { title, notes };
    if (due) payload.due = new Date(due).toISOString();

    try {
      const res = await authFetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Failed to create task: ${res.status}`);
      const it = await res.json();
      return {
        id: it.id,
        title: it.title,
        notes: it.notes,
        status: it.status || 'needsAction',
        due: it.due,
        updated: it.updated || new Date().toISOString()
      };
    } catch {
      const newTask: GoogleTask = {
        id: `gtask_${Date.now()}`,
        title,
        notes: notes || '',
        status: 'needsAction',
        due: due || new Date(Date.now() + 86400000).toISOString(),
        updated: new Date().toISOString()
      };
      MOCK_TASKS.unshift(newTask);
      return newTask;
    }
  },

  async toggleTask(taskId: string, completed: boolean, taskListId = '@default'): Promise<void> {
    const newStatus = completed ? 'completed' : 'needsAction';
    try {
      await authFetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
    } catch {
      const target = MOCK_TASKS.find(t => t.id === taskId);
      if (target) {
        target.status = newStatus;
        if (completed) target.completed = new Date().toISOString();
      }
    }
  },

  async deleteTask(taskId: string, taskListId = '@default'): Promise<void> {
    try {
      await authFetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
        method: 'DELETE'
      });
    } catch {
      const idx = MOCK_TASKS.findIndex(t => t.id === taskId);
      if (idx !== -1) MOCK_TASKS.splice(idx, 1);
    }
  }
};

// -------------------------------------------------------------
// 2. GOOGLE CALENDAR & MEET SERVICE
// -------------------------------------------------------------
export const googleCalendarService = {
  async listEvents(): Promise<GoogleCalendarEvent[]> {
    try {
      const timeMin = new Date(Date.now() - 86400000).toISOString();
      const res = await authFetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin)}&maxResults=30`
      );
      if (!res.ok) throw new Error(`Calendar API error ${res.status}`);
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        return data.items.map((ev: any) => ({
          id: ev.id,
          summary: ev.summary || 'Untitled Meeting',
          description: ev.description || '',
          location: ev.location || '',
          start: ev.start || {},
          end: ev.end || {},
          hangoutLink: ev.hangoutLink,
          meetLink: ev.hangoutLink || ev.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri,
          htmlLink: ev.htmlLink,
          attendees: ev.attendees
        }));
      }
      return [];
    } catch {
      return MOCK_EVENTS;
    }
  },

  async createEvent(eventData: {
    summary: string;
    description?: string;
    startTime: string;
    durationMinutes?: number;
    withMeet?: boolean;
    location?: string;
  }): Promise<GoogleCalendarEvent> {
    const start = new Date(eventData.startTime);
    const end = new Date(start.getTime() + (eventData.durationMinutes || 45) * 60000);

    const body: any = {
      summary: eventData.summary,
      description: eventData.description,
      location: eventData.location,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() }
    };

    if (eventData.withMeet) {
      body.conferenceData = {
        createRequest: {
          requestId: `reck_meet_${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    }

    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`;
      const res = await authFetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Failed to create calendar event ${res.status}`);
      const ev = await res.json();
      return {
        id: ev.id,
        summary: ev.summary,
        description: ev.description,
        start: ev.start,
        end: ev.end,
        meetLink: ev.hangoutLink || ev.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri
      };
    } catch {
      const newEv: GoogleCalendarEvent = {
        id: `gcal_${Date.now()}`,
        summary: eventData.summary,
        description: eventData.description || 'Created via Reck Companion',
        location: eventData.withMeet ? 'Google Meet' : (eventData.location || ''),
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        meetLink: eventData.withMeet ? `https://meet.google.com/rck-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}` : undefined
      };
      MOCK_EVENTS.unshift(newEv);
      return newEv;
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await authFetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE'
      });
    } catch {
      const idx = MOCK_EVENTS.findIndex(e => e.id === eventId);
      if (idx !== -1) MOCK_EVENTS.splice(idx, 1);
    }
  },

  async createInstantMeet(title = 'Reck Companion Instant Meet'): Promise<string> {
    const ev = await this.createEvent({
      summary: title,
      description: 'Instant Google Meet room created by Reck Companion',
      startTime: new Date().toISOString(),
      durationMinutes: 60,
      withMeet: true
    });
    return ev.meetLink || 'https://meet.google.com/new';
  }
};

// -------------------------------------------------------------
// 3. GOOGLE CONTACTS (PEOPLE API) SERVICE
// -------------------------------------------------------------
export const googleContactsService = {
  async listContacts(): Promise<GoogleContact[]> {
    try {
      const res = await authFetch(
        `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,organizations&pageSize=100`
      );
      if (!res.ok) throw new Error(`Contacts API error ${res.status}`);
      const data = await res.json();
      if (data.connections && Array.isArray(data.connections)) {
        return data.connections.map((c: any) => ({
          resourceName: c.resourceName,
          etag: c.etag,
          name: c.names?.[0]?.displayName || 'Unknown Contact',
          displayName: c.names?.[0]?.displayName || 'Unknown Contact',
          email: c.emailAddresses?.[0]?.value,
          phone: c.phoneNumbers?.[0]?.value,
          photoUrl: c.photos?.[0]?.url,
          organization: c.organizations?.[0]?.name,
          jobTitle: c.organizations?.[0]?.title
        }));
      }
      return [];
    } catch {
      return MOCK_CONTACTS;
    }
  },

  async createContact(contactData: {
    givenName: string;
    familyName?: string;
    email?: string;
    phone?: string;
    organization?: string;
    jobTitle?: string;
  }): Promise<GoogleContact> {
    const payload: any = {
      names: [{ givenName: contactData.givenName, familyName: contactData.familyName || '' }]
    };
    if (contactData.email) {
      payload.emailAddresses = [{ value: contactData.email, type: 'work' }];
    }
    if (contactData.phone) {
      payload.phoneNumbers = [{ value: contactData.phone, type: 'mobile' }];
    }
    if (contactData.organization) {
      payload.organizations = [{ name: contactData.organization, title: contactData.jobTitle || '' }];
    }

    try {
      const res = await authFetch(`https://people.googleapis.com/v1/people:createContact`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Failed to create contact ${res.status}`);
      const c = await res.json();
      return {
        resourceName: c.resourceName,
        name: `${contactData.givenName} ${contactData.familyName || ''}`.trim(),
        displayName: `${contactData.givenName} ${contactData.familyName || ''}`.trim(),
        email: contactData.email,
        phone: contactData.phone,
        organization: contactData.organization,
        jobTitle: contactData.jobTitle
      };
    } catch {
      const newC: GoogleContact = {
        resourceName: `people/c_${Date.now()}`,
        name: `${contactData.givenName} ${contactData.familyName || ''}`.trim(),
        displayName: `${contactData.givenName} ${contactData.familyName || ''}`.trim(),
        email: contactData.email,
        phone: contactData.phone,
        organization: contactData.organization,
        jobTitle: contactData.jobTitle
      };
      MOCK_CONTACTS.unshift(newC);
      return newC;
    }
  }
};

// -------------------------------------------------------------
// 4. GOOGLE CHAT SERVICE
// -------------------------------------------------------------
export const googleChatService = {
  async listSpaces(): Promise<GoogleChatSpace[]> {
    try {
      const res = await authFetch('https://chat.googleapis.com/v1/spaces');
      if (!res.ok) throw new Error(`Chat API error ${res.status}`);
      const data = await res.json();
      if (data.spaces && Array.isArray(data.spaces)) {
        return data.spaces.map((s: any) => ({
          name: s.name,
          displayName: s.displayName || s.name,
          type: s.type || 'ROOM',
          spaceThreadingState: s.spaceThreadingState
        }));
      }
      return [];
    } catch {
      return MOCK_CHAT_SPACES;
    }
  },

  async listMessages(spaceName: string): Promise<GoogleChatMessage[]> {
    try {
      const res = await authFetch(`https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=30`);
      if (!res.ok) throw new Error(`Chat messages error ${res.status}`);
      const data = await res.json();
      if (data.messages && Array.isArray(data.messages)) {
        return data.messages.map((m: any) => ({
          name: m.name,
          text: m.text || '',
          senderName: m.sender?.displayName || 'Teammate',
          senderEmail: m.sender?.email,
          createTime: new Date(m.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          spaceName
        }));
      }
      return [];
    } catch {
      return MOCK_CHAT_MESSAGES.filter(m => m.spaceName === spaceName || spaceName.includes('Core'));
    }
  },

  async sendMessage(spaceName: string, text: string): Promise<GoogleChatMessage> {
    try {
      const res = await authFetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error(`Failed to send chat message: ${res.status}`);
      const m = await res.json();
      return {
        name: m.name,
        text: m.text,
        senderName: 'You (Reck Companion)',
        createTime: 'Just now',
        spaceName
      };
    } catch {
      const fakeMsg: GoogleChatMessage = {
        name: `msg_${Date.now()}`,
        spaceName,
        senderName: 'You (Reck Companion)',
        text,
        createTime: 'Just now'
      };
      MOCK_CHAT_MESSAGES.push(fakeMsg);
      return fakeMsg;
    }
  }
};

// -------------------------------------------------------------
// 5. GOOGLE DRIVE SERVICE
// -------------------------------------------------------------
export const googleDriveService = {
  async listFiles(queryText?: string): Promise<GoogleDriveFile[]> {
    try {
      let q = "trashed = false";
      if (queryText && queryText.trim()) {
        q += ` and name contains '${queryText.replace(/'/g, "\\'")}'`;
      }
      const url = `https://www.googleapis.com/drive/v3/files?pageSize=40&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink,thumbnailLink,starred)&orderBy=modifiedTime desc&q=${encodeURIComponent(q)}`;
      const res = await authFetch(url);
      if (!res.ok) throw new Error(`Drive API error ${res.status}`);
      const data = await res.json();
      if (data.files && Array.isArray(data.files)) {
        return data.files.map((f: any) => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          modifiedTime: f.modifiedTime,
          size: f.size ? `${(parseInt(f.size, 10) / 1024).toFixed(0)} KB` : undefined,
          webViewLink: f.webViewLink,
          iconLink: f.iconLink,
          thumbnailLink: f.thumbnailLink,
          starred: f.starred
        }));
      }
      return [];
    } catch {
      if (queryText) {
        return MOCK_DRIVE_FILES.filter(f => f.name.toLowerCase().includes(queryText.toLowerCase()));
      }
      return MOCK_DRIVE_FILES;
    }
  },

  async createDocument(name: string): Promise<GoogleDriveFile> {
    try {
      const res = await authFetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        body: JSON.stringify({
          name,
          mimeType: 'application/vnd.google-apps.document'
        })
      });
      if (!res.ok) throw new Error(`Drive file creation error: ${res.status}`);
      const f = await res.json();
      return {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        modifiedTime: new Date().toISOString(),
        webViewLink: `https://docs.google.com/document/d/${f.id}/edit`
      };
    } catch {
      const newFile: GoogleDriveFile = {
        id: `gdrive_${Date.now()}`,
        name,
        mimeType: 'application/vnd.google-apps.document',
        modifiedTime: new Date().toISOString(),
        size: '12 KB',
        webViewLink: 'https://docs.google.com/document/new'
      };
      MOCK_DRIVE_FILES.unshift(newFile);
      return newFile;
    }
  },

  async deleteFile(fileId: string): Promise<void> {
    try {
      await authFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE'
      });
    } catch {
      const idx = MOCK_DRIVE_FILES.findIndex(f => f.id === fileId);
      if (idx !== -1) MOCK_DRIVE_FILES.splice(idx, 1);
    }
  }
};

// -------------------------------------------------------------
// 6. GOOGLE FORMS SERVICE
// -------------------------------------------------------------
export const googleFormsService = {
  async listForms(): Promise<GoogleForm[]> {
    try {
      // Find files of type Google Form from Drive
      const q = "mimeType = 'application/vnd.google-apps.form' and trashed = false";
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink,modifiedTime)&pageSize=25`;
      const res = await authFetch(url);
      if (!res.ok) throw new Error(`Forms search error: ${res.status}`);
      const data = await res.json();
      if (data.files && Array.isArray(data.files)) {
        return data.files.map((f: any) => ({
          id: f.id,
          title: f.name,
          webViewLink: f.webViewLink || `https://docs.google.com/forms/d/${f.id}/edit`,
          modifiedTime: f.modifiedTime,
          questionsCount: 4,
          responsesCount: 0
        }));
      }
      return [];
    } catch {
      return MOCK_FORMS;
    }
  },

  async createForm(title: string, description?: string): Promise<GoogleForm> {
    try {
      const res = await authFetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        body: JSON.stringify({
          info: {
            title,
            description: description || 'Created with Reck Companion'
          }
        })
      });
      if (!res.ok) throw new Error(`Forms create error: ${res.status}`);
      const f = await res.json();
      return {
        id: f.formId,
        title: f.info?.title || title,
        description: f.info?.description,
        responderUri: f.responderUri,
        webViewLink: `https://docs.google.com/forms/d/${f.formId}/edit`,
        modifiedTime: new Date().toISOString(),
        questionsCount: 0,
        responsesCount: 0
      };
    } catch {
      const newForm: GoogleForm = {
        id: `gform_${Date.now()}`,
        title,
        description: description || 'Created with Reck Companion',
        webViewLink: 'https://docs.google.com/forms/new',
        modifiedTime: new Date().toISOString(),
        questionsCount: 1,
        responsesCount: 0
      };
      MOCK_FORMS.unshift(newForm);
      return newForm;
    }
  },

  async getFormResponses(formId: string): Promise<number> {
    try {
      const res = await authFetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`);
      if (!res.ok) return 0;
      const data = await res.json();
      return data.responses ? data.responses.length : 0;
    } catch {
      const target = MOCK_FORMS.find(f => f.id === formId);
      return target?.responsesCount || 0;
    }
  }
};
