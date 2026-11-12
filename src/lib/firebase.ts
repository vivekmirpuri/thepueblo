// Web config is public by design; data is protected by Firestore/Storage security rules.
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const app =
  getApps()[0] ??
  initializeApp({
    apiKey: "AIzaSyDrBLNIVDsrw8WXGI1lQNxQmnYP1uY_bNc",
    authDomain: "thepueblo-6f94e.firebaseapp.com",
    projectId: "thepueblo-6f94e",
    storageBucket: "thepueblo-6f94e.firebasestorage.app",
    messagingSenderId: "693660452286",
    appId: "1:693660452286:web:54629dba136be8f68e65ef",
    measurementId: "G-DVTRQ2JN2D",
  });

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
