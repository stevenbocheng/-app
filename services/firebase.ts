import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";

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

export { 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  signOut,
  doc, 
  setDoc, 
  onSnapshot, 
  getDoc,
  updateDoc,
  isConfigValid, 
  appId 
};

/**
 * 將 Firebase Auth 錯誤代碼轉換為友善的中文訊息
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return '此電子信箱已被註冊，請直接登入或使用其他信箱。';
    case 'auth/invalid-email':
      return '電子信箱格式不正確，請重新檢查。';
    case 'auth/weak-password':
      return '密碼強度不足，請至少輸入 6 個字元。';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return '電子信箱或密碼錯誤。';
    case 'auth/too-many-requests':
      return '登入嘗試次數過多，帳號已暫時鎖定，請稍候再試。';
    case 'auth/user-disabled':
      return '此帳號已被停用，請聯繫管理員。';
    case 'auth/network-request-failed':
      return '網路連線失敗，請檢查您的網路狀況。';
    case 'auth/internal-error':
      return '系統內部錯誤，請稍後再試。';
    default:
      return `驗證失敗：${errorCode}`;
  }
};