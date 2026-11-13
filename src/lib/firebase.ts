/**
 * Firebase entry point — SHARED file (change only through a small, announced PR).
 *
 * Exports the three services the app uses:
 *   auth    — Firebase Authentication (email + password; Google can be switched on in the console)
 *   db      — Firestore (all app data and the realtime group chat)
 *   storage — Cloud Storage for event images (needs the pay-as-you-go Blaze plan)
 *
 * The config in firebase.config.json is public by design: data is protected by firestore.rules
 * and storage.rules, not by hiding these values.
 *
 * Use it only from "use client" components or from src/lib/db.ts.
 */
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import config from "./firebase.config.json";

const app = getApps()[0] ?? initializeApp(config);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
