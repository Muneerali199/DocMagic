// Firebase configuration utility
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Initialize Firebase app singleton
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;

export const initializeFirebase = () => {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    firebaseApp = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    });
    
    firebaseAuth = getAuth(firebaseApp);
  } else {
    // Use existing app
    firebaseApp = getApps()[0];
    firebaseAuth = getAuth(firebaseApp);
  }
  
  return { app: firebaseApp, auth: firebaseAuth };
};

export const getFirebaseAuth = () => {
  if (!firebaseAuth) {
    initializeFirebase();
  }
  return firebaseAuth;
};