import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  initializeAuth as initializeFirebaseAuth,
  onAuthStateChanged as observeFirebaseAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let authInstance = null;

export function isAuthConfigured() {
  return Object.values(firebaseConfig).every(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
}

export function initializeAuth() {
  if (!isAuthConfigured()) {
    throw new Error('Firebase Authentication is not configured for this build.');
  }
  if (authInstance) return authInstance;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  try {
    authInstance = initializeFirebaseAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error.code !== 'auth/already-initialized') throw error;
    authInstance = getAuth(app);
  }
  return authInstance;
}

function requireAuth() {
  if (!authInstance) return initializeAuth();
  return authInstance;
}

export function getCurrentUser() {
  return requireAuth().currentUser;
}

export function onAuthStateChanged(callback) {
  return observeFirebaseAuth(requireAuth(), callback);
}

export async function signUp(email, password, displayName) {
  const credential = await createUserWithEmailAndPassword(
    requireAuth(),
    email,
    password,
  );
  await updateProfile(credential.user, { displayName });
  return credential.user;
}

export async function signIn(email, password) {
  const credential = await signInWithEmailAndPassword(requireAuth(), email, password);
  return credential.user;
}

export async function signOut() {
  await firebaseSignOut(requireAuth());
}

export function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Use a password with at least 8 characters.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
      return 'Email or password is incorrect.';
    case 'auth/user-not-found':
      return 'No account was found with this email.';
    case 'auth/invalid-password':
      return 'The password is incorrect.';
    case 'auth/network-request-failed':
      return 'Could not connect. Check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a while and try again.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is not enabled for this Firebase project.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/credential-already-in-use':
      return 'This sign-in credential is already linked to another account.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for help.';
    case 'auth/requires-recent-login':
      return 'For your security, log in again before retrying this action.';
    case 'auth/internal-error':
      if (__DEV__) logFirebaseError(error);
      return 'Firebase authentication could not initialize. Please retry, or restart the app and try again.';
    default:
      if (typeof error?.code === 'string' && error.code.startsWith('auth/')) {
        if (__DEV__) logFirebaseError(error);
        return 'Firebase could not complete this request. Please try again.';
      }
      return 'Authentication could not be completed. Check your details and try again.';
  }
}

function logFirebaseError(error) {
  console.error('[PlantCare][Auth] Firebase error details:', {
    code: error?.code,
    message: redactSensitiveDetails(error?.message),
  });
}

function redactSensitiveDetails(message) {
  if (typeof message !== 'string') return '';
  return message.replace(
    /((?:password|token|secret|api[_ -]?key|credentials?)\s*[:=]\s*)[^\s,;]+/gi,
    '$1[REDACTED]',
  );
}
