import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

let firebaseConfig;
let isConfigValid = false;
let appId = 'default-app-id';

try {
  // First try: Environment variables (Vite/Production)
  if (process.env.FIREBASE_CONFIG) {
    firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG as string);
    appId = process.env.APP_ID || 'default-app-id';
    isConfigValid = true;
  } 
  // Second try: Window globals (Dev/Preview)
  else if (typeof window !== 'undefined' && (window as any).__firebase_config) {
    firebaseConfig = JSON.parse((window as any).__firebase_config);
    appId = (window as any).__app_id || 'default-app-id';
    isConfigValid = true;
  } else {
    throw new Error("No firebase config found");
  }
} catch (e) {
  console.warn("Using demo firebase config");
  firebaseConfig = { apiKey: "demo-key", authDomain: "demo.firebaseapp.com", projectId: "demo-project" };
  isConfigValid = false;
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { signInAnonymously, onAuthStateChanged, signInWithCustomToken, doc, setDoc, onSnapshot, isConfigValid, appId };