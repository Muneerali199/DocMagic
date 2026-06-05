// Firebase initialization - handles both client and server environments
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  type Auth, 
  onAuthStateChanged, 
  type User as FirebaseUser,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app - only once
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export const initializeFirebase = () => {
  // Only initialize if not already initialized and we're in a browser environment
  if (typeof window !== 'undefined' && !app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
  
  return { app, auth };
};

// Get Firebase auth instance (initialize if needed)
export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    initializeFirebase();
  }
  
  if (!auth) {
    throw new Error('Firebase Auth initialization failed');
  }
  
  return auth;
};

// Auth provider instances
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Authentication functions
export const firebaseAuth = {
  // Sign in with Google
  signInWithGoogle: async () => {
    const authInstance = getFirebaseAuth();
    return await signInWithPopup(authInstance, googleProvider);
  },
  
  // Sign in with GitHub
  signInWithGitHub: async () => {
    const authInstance = getFirebaseAuth();
    return await signInWithPopup(authInstance, githubProvider);
  },
  
  // Sign in with email/password
  signInWithEmail: async (email: string, password: string) => {
    const authInstance = getFirebaseAuth();
    return await signInWithEmailAndPassword(authInstance, email, password);
  },
  
  // Create user with email/password
  createUserWithEmail: async (email: string, password: string) => {
    const authInstance = getFirebaseAuth();
    return await createUserWithEmailAndPassword(authInstance, email, password);
  },
  
  // Sign out
  signOut: async () => {
    const authInstance = getFirebaseAuth();
    await signOut(authInstance);
  },
  
  // Send password reset email
  sendPasswordReset: async (email: string) => {
    const authInstance = getFirebaseAuth();
    await sendPasswordResetEmail(authInstance, email);
  },
  
  // Verify password reset code
  verifyPasswordResetCode: async (code: string) => {
    const authInstance = getFirebaseAuth();
    return await verifyPasswordResetCode(authInstance, code);
  },
  
  // Confirm password reset
  confirmPasswordReset: async (code: string, newPassword: string) => {
    const authInstance = getFirebaseAuth();
    return await confirmPasswordReset(authInstance, code, newPassword);
  },
  
  // Get current user
  getCurrentUser: (): FirebaseUser | null => {
    const authInstance = getFirebaseAuth();
    return authInstance.currentUser;
  },
  
  // Auth state listener
  onAuthStateChange: (callback: (user: FirebaseUser | null) => void) => {
    const authInstance = getFirebaseAuth();
    return onAuthStateChanged(authInstance, callback);
  }
};

export default firebaseAuth;