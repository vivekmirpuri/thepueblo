/**
 * "Gente como tú" matching (F15) — SHARED file. Pure functions, no Firestore.
 *
 * A score from what two people share: each shared interest counts 2, each shared language 2
 * (being able to understand each other matters as much as liking the same thing) and living on
 * the same island 1. People with nothing in common are left out.
 * Profiles written by older versions or by hand may lack fields, so every list is read defensively.
 */
import type { CategoryId } from "./categories";
import type { LanguageCode } from "./languages";
import type { UserProfile } from "./types";

export interface Match {
  profile: UserProfile;
  score: number;
  interests: CategoryId[];
  languages: LanguageCode[];
  sameIsland: boolean;
}

export function matchPeople(me: UserProfile, people: UserProfile[]): Match[] {
  const myInterests = me.interests ?? [];
  const myLanguages = me.languages ?? [];
  return people
    .filter((other) => other.uid !== me.uid && other.displayName)
    .map((other) => {
      const interests = (other.interests ?? []).filter((id) => myInterests.includes(id));
      const languages = (other.languages ?? []).filter((code) => myLanguages.includes(code));
      const sameIsland = !!me.island && me.island === other.island && me.island !== "otro";
      return { profile: other, interests, languages, sameIsland, score: interests.length * 2 + languages.length * 2 + (sameIsland ? 1 : 0) };
    })
    .filter((match) => match.interests.length > 0 || match.languages.length > 0)
    .sort((a, b) => b.score - a.score || a.profile.displayName.localeCompare(b.profile.displayName, "es"));
}

/** Link to anyone's profile page (yours too: /profile/ without uid shows your own). */
export const profileHref = (uid: string) => `/profile/?uid=${encodeURIComponent(uid)}`;
