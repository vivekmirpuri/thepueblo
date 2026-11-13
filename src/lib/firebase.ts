/**
 * Firebase entry point — SHARED file (change only through a small, announced PR).
 *
 * Exports the two services the app uses:
 *   auth — Firebase Authentication (email + password; Google can be switched on in the console)
 *   db   — Firestore (all app data and the realtime group chat)
 *
 * The config in firebase.config.json is public by design: data is protected by firestore.rules,
 * not by hiding these values. No Storage: the project is on the free Spark plan, so an event
 * image is a link saved in `event.imageUrl`.
 *
 * Use it only from "use client" components or from src/lib/db.ts.
 */
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import config from "./firebase.config.json";

const app = getApps()[0] ?? initializeApp(config);

export const auth = getAuth(app);
export const db = getFirestore(app);
