/**
 * Firebase Lazy Initialization
 * 
 * Dynamic imports to reduce initial bundle size.
 * Firebase modules are loaded only when needed.
 */

import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Module cache
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase app lazily
 */
export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (app) return app;
  
  const { initializeApp } = await import('firebase/app');
  app = initializeApp(firebaseConfig);
  return app;
}

/**
 * Get Auth instance lazily
 */
export async function getFirebaseAuth(): Promise<Auth> {
  if (auth) return auth;
  
  const app = await getFirebaseApp();
  const { getAuth } = await import('firebase/auth');
  auth = getAuth(app);
  return auth;
}

/**
 * Get Firestore instance lazily
 */
export async function getFirestoreDB(): Promise<Firestore> {
  if (db) return db;
  
  const app = await getFirebaseApp();
  const { getFirestore } = await import('firebase/firestore');
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  return db;
}

/**
 * Auth state observer with lazy initialization
 */
export async function onAuthStateChanged(
  callback: (user: User | null) => void
): Promise<() => void> {
  const auth = await getFirebaseAuth();
  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(auth, callback);
}

// Re-export types
export type { FirebaseApp, Auth, Firestore, User };
