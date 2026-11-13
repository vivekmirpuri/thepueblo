"use client";
/**
 * Who is signed in — SHARED file. PLACEHOLDER: it always answers "nobody".
 *
 * To build (Foundation, before the tracks need a real user):
 *  1. In AuthProvider, subscribe with `onAuthStateChanged(auth, …)` from "firebase/auth".
 *  2. When a user arrives, load their profile with `getProfile(uid)` from ./db.
 *  3. Put `{ user, profile, loading }` in a React context; `useUser()` reads it.
 *  4. `/login/` calls `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`
 *     (email + password is already enabled in the Firebase project).
 *  5. A signed-in user without a profile is sent to `/onboarding/`.
 *
 * Screens only ever import `useUser()` — they never touch firebase/auth directly.
 */
import type { User } from "firebase/auth";
import type { ReactNode } from "react";
import type { UserProfile } from "./types";

export interface AuthState {
  /** The Firebase account, or null when signed out. */
  user: User | null;
  /** The users/{uid} document, or null before onboarding is finished. */
  profile: UserProfile | null;
  loading: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useUser(): AuthState {
  return { user: null, profile: null, loading: false };
}
