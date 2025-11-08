import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;


import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@env';

// Firebase config
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
 
};

// Initialize Firebase App once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Cache Auth instance globally
let _auth: ReturnType<typeof initializeAuth> | null = null;

export function getFirebaseAuth() {
  if (!_auth) {
    _auth = initializeAuth(app, {
      persistence: reactNativePersistence(AsyncStorage),
    });
  }
  return _auth;
}

// Firestore instance
export const db = getFirestore(app);
export { app };

// Storage
//export const storage = getStorage(app);