import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuPoLlL3wnKyIVUeGOU5KnNe-NcuZF9tw",
  authDomain: "viewi-1f0b5.firebaseapp.com",
  projectId: "viewi-1f0b5",
  storageBucket: "viewi-1f0b5.firebasestorage.app",
  messagingSenderId: "514635968462",
  appId: "1:514635968462:web:62b64c30b971321098459f",
  measurementId: "G-E3YTW7D1CG"
};

// Initialize Client SDK
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
