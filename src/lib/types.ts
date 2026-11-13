/**
 * Data shapes — SHARED file. These mirror the Firestore documents described in
 * ARCHITECTURE.md → "Data model" and enforced by firestore.rules. Change all three together,
 * then run `node scripts/rules-check.mjs`.
 *
 * The event type is called `Meetup` because `Event` is already a browser built-in.
 */
import type { Timestamp } from "firebase/firestore";
import type { CategoryId } from "./categories";
import type { InclusionId } from "./inclusion";
import type { IslandId } from "./islands";
import type { LanguageCode } from "./languages";

/** users/{uid} */
export interface UserProfile {
  uid: string;
  displayName: string;
  /** Optional, free text (e.g. "ella"), asked at sign-up and shown next to the name (F18). */
  pronouns: string | null;
  photoURL: string | null;
  role: "user" | "institution";
  /** Institutions only. Set by hand in the Firebase console; the rules stop users changing it. */
  verified: boolean;
  bio: string;
  interests: CategoryId[];
  languages: LanguageCode[];
  /** The only location stored for a person. Never an exact position. */
  island: IslandId;
  prefers: "in_person" | "online" | "both";
  availability: string[];
  createdAt: Timestamp;
}

/** What a person can edit about themselves. `verified` and `createdAt` are not theirs to set. */
export type ProfileDraft = Omit<UserProfile, "uid" | "verified" | "createdAt">;

/** events/{id} */
export interface Meetup {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  /** Inclusion and accessibility features the organiser offers (F17), shown as small icons. */
  inclusion: InclusionId[];
  /** Download link of the cover image in Cloud Storage, from `uploadEventImage` in ./db. */
  imageUrl: string | null;
  /** True only when the organiser is a verified institution (F13). */
  official: boolean;
  organizerId: string;
  organizerName: string;
  mode: "in_person" | "online";
  /** null for online events. */
  location: { lat: number; lng: number } | null;
  placeName: string;
  island: IslandId | null;
  onlineUrl: string | null;
  startsAt: Timestamp;
  /** Required: the home screen lists events until they END, so a running event stays visible. */
  endsAt: Timestamp;
  capacity: number | null;
  attendeeIds: string[];
  /** uid → languages that person speaks. The flag row (F11) is counted from this in the browser. */
  attendeeLanguages: Record<string, LanguageCode[]>;
  /** 384 numbers from the local embedding model; null until Track C's model has run on it. */
  embedding: number[] | null;
  createdAt: Timestamp;
}

/** events/{id}/messages/{id} — the group chat (F14) */
export interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  /** Copied from the sender's profile when the message is sent. */
  pronouns: string | null;
  text: string;
  createdAt: Timestamp;
}

/**
 * events/{id}/reviews/{uid} — one per attendee (F12). The average is worked out from these
 * documents when shown, so there are no totals on the event that someone could tamper with.
 */
export interface Review {
  uid: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: Timestamp;
}
