"use client";
/**
 * Who is signed in — SHARED file. Built (not a placeholder).
 *
 * Screens never import "firebase/auth" directly: they call `useUser()` and get the Firebase
 * account, their users/{uid} profile and whether we are still checking.
 *
 * `profile` is null for someone who signed up but has not finished onboarding yet.
 * Call `refresh()` after saving the profile so the rest of the app sees the new values.
 */
import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getProfile } from "./db";
import { auth } from "./firebase";
import type { UserProfile } from "./types";

export interface AuthState {
  /** The Firebase account, or null when signed out. */
  user: User | null;
  /** The users/{uid} document, or null before onboarding is finished. */
  profile: UserProfile | null;
  loading: boolean;
  /** Re-reads the profile from Firestore. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, "refresh">>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        setState({ user, profile: user ? await getProfile(user.uid) : null, loading: false });
      }),
    [],
  );

  const refresh = useCallback(async () => {
    const user = auth.currentUser;
    setState({ user, profile: user ? await getProfile(user.uid) : null, loading: false });
  }, []);

  return <AuthContext value={{ ...state, refresh }}>{children}</AuthContext>;
}

export function useUser(): AuthState {
  return useContext(AuthContext);
}
