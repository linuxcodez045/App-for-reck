/**
 * Reck Companion - Firebase Integration Service
 * Manages Firebase Firestore persistent storage and Auth.
 * Includes connection health checks and ABAC user data syncing.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase singleton
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

let isConnected = false;
let lastCheckError: string | null = null;

/**
 * Validates connection to Firestore via server probe.
 */
export async function testFirestoreConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // Tests connection to server per skill instructions
    await getDocFromServer(doc(db, 'test', 'connection'));
    isConnected = true;
    lastCheckError = null;
    return { connected: true };
  } catch (error: any) {
    // Check if error is due to offline status or permission
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline. Verify network connection.');
      isConnected = false;
      lastCheckError = error.message;
      return { connected: false, error: error.message };
    }
    // If it's a doc not found or permission error, Firestore server responded
    isConnected = true;
    return { connected: true };
  }
}

// Automatically test connection on boot
testFirestoreConnection().catch(err => {
  console.warn('Firestore initial health check notice:', err?.message || err);
});

export interface FirestoreUserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  lastActive: string;
}

export interface FirestoreUserTask {
  id: string;
  userId: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated: string;
}

export interface FirestoreUserEvent {
  id: string;
  userId: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  meetLink?: string;
  location?: string;
}

export interface FirestoreNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

/**
 * Save user profile to Firestore (/users/{userId})
 */
export async function saveUserProfile(profile: FirestoreUserProfile): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', profile.userId);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.error('Failed to save user profile to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<FirestoreUserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
    return null;
  } catch (err) {
    console.error('Failed to get user profile from Firestore:', err);
    return null;
  }
}

/**
 * Save / sync task to user's Firestore tasks subcollection
 */
export async function saveTaskToFirestore(userId: string, task: FirestoreUserTask): Promise<void> {
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', task.id);
    await setDoc(taskDocRef, task, { merge: true });
  } catch (err) {
    console.error('Failed to save task to Firestore:', err);
    throw err;
  }
}

/**
 * Get all tasks from Firestore for user
 */
export async function getTasksFromFirestore(userId: string): Promise<FirestoreUserTask[]> {
  try {
    const tasksColRef = collection(db, 'users', userId, 'tasks');
    const snap = await getDocs(tasksColRef);
    const results: FirestoreUserTask[] = [];
    snap.forEach(d => {
      results.push(d.data() as FirestoreUserTask);
    });
    return results;
  } catch (err) {
    console.error('Failed to load tasks from Firestore:', err);
    return [];
  }
}

/**
 * Delete task from Firestore
 */
export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  } catch (err) {
    console.error('Failed to delete task from Firestore:', err);
    throw err;
  }
}

/**
 * Save calendar event to Firestore
 */
export async function saveEventToFirestore(userId: string, event: FirestoreUserEvent): Promise<void> {
  try {
    const eventDocRef = doc(db, 'users', userId, 'events', event.id);
    await setDoc(eventDocRef, event, { merge: true });
  } catch (err) {
    console.error('Failed to save event to Firestore:', err);
    throw err;
  }
}

/**
 * Get calendar events from Firestore
 */
export async function getEventsFromFirestore(userId: string): Promise<FirestoreUserEvent[]> {
  try {
    const eventsColRef = collection(db, 'users', userId, 'events');
    const snap = await getDocs(eventsColRef);
    const results: FirestoreUserEvent[] = [];
    snap.forEach(d => {
      results.push(d.data() as FirestoreUserEvent);
    });
    return results;
  } catch (err) {
    console.error('Failed to load events from Firestore:', err);
    return [];
  }
}

/**
 * Save note to Firestore
 */
export async function saveNoteToFirestore(userId: string, note: FirestoreNote): Promise<void> {
  try {
    const noteDocRef = doc(db, 'users', userId, 'notes', note.id);
    await setDoc(noteDocRef, note, { merge: true });
  } catch (err) {
    console.error('Failed to save note to Firestore:', err);
    throw err;
  }
}

/**
 * Get notes from Firestore
 */
export async function getNotesFromFirestore(userId: string): Promise<FirestoreNote[]> {
  try {
    const notesColRef = collection(db, 'users', userId, 'notes');
    const snap = await getDocs(query(notesColRef, orderBy('createdAt', 'desc'), limit(50)));
    const results: FirestoreNote[] = [];
    snap.forEach(d => {
      results.push(d.data() as FirestoreNote);
    });
    return results;
  } catch (err) {
    console.error('Failed to load notes from Firestore:', err);
    return [];
  }
}

/**
 * Delete note from Firestore
 */
export async function deleteNoteFromFirestore(userId: string, noteId: string): Promise<void> {
  try {
    const noteDocRef = doc(db, 'users', userId, 'notes', noteId);
    await deleteDoc(noteDocRef);
  } catch (err) {
    console.error('Failed to delete note from Firestore:', err);
    throw err;
  }
}
