import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== 'undefined') {
  // Initialize Firebase only on client side to avoid SSR issues
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

// Firebase providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return await signInWithPopup(auth, googleProvider);
};

export const signInWithGitHub = async () => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return await signInWithPopup(auth, githubProvider);
};

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return await signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmailAndPassword = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const firebaseSignOut = async () => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return await signOut(auth);
};

// Auth state listener
export const onFirebaseAuthStateChanged = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentFirebaseUser = (): User | null => {
  if (!auth) return null;
  return auth.currentUser;
};

export { auth };