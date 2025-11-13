import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || 'AIzaSyD78r5ezvOg6qIK96eJuufqaWNHKhSdB-E',
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN || 'orchid-199f2.firebaseapp.com',
  projectId: import.meta.env.VITE_FB_PROJECT_ID || 'orchid-199f2',
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || 'orchid-199f2.appspot.com',
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID || '695026392809',
  appId: import.meta.env.VITE_FB_APP_ID || '1:695026392809:web:4a7dc6d5098a1985ab9a78',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
