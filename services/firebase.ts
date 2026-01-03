import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// Fallback for dev environment if globals aren't present
let firebaseConfig;
let isConfigValid = false;

try {
  if (typeof window !== 'undefined' && (window as any).__firebase_config) {
    firebaseConfig = JSON.parse((window as any).__firebase_config);
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
export const appId = typeof window !== 'undefined' && (window as any).__app_id ? (window as any).__app_id : 'default-app-id';

export { signInAnonymously, onAuthStateChanged, signInWithCustomToken, doc, setDoc, onSnapshot, isConfigValid };