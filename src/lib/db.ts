/**
 * Firestore reads and writes — SHARED file. Every screen goes through these functions instead
 * of calling Firestore directly, so the document shapes live in one place.
 *
 * Built:      profiles, events, join/leave, image upload, group chat
 * Not built:  everything that calls todo() — the task id says who picks it up (see PLAN.md)
 *
 * Notes for whoever fills these in:
 *  - Reads for lists: `getDocs(query(collection(db, "events"), where("endsAt", ">=", Timestamp.now()), orderBy("endsAt")))`.
 *  - Realtime (the chat): `onSnapshot(query(collection(db, "events", id, "messages"), orderBy("createdAt")), cb)`
 *    and return its unsubscribe function from the component's effect.
 *  - Add the document id yourself: `{ id: snap.id, ...snap.data() } as Meetup`.
 */
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import { todo } from "./todo";
import type { ChatMessage, Meetup, ProfileDraft, Review, UserProfile } from "./types";

// ── Profiles ──────────────────────────────────────────────────────────────────

/** The users/{uid} document, or null when the person has not finished onboarding. */
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? ({ verified: false, ...snap.data(), uid } as UserProfile) : null;
}

/**
 * Saves the fields a person can edit. `verified` is never written here: only an admin sets it
 * by hand in the Firebase console, and firestore.rules refuse any client that tries.
 */
export async function saveProfile(uid: string, draft: ProfileDraft): Promise<void> {
  const target = doc(db, "users", uid);
  if ((await getDoc(target)).exists()) await updateDoc(target, { ...draft });
  else await setDoc(target, { ...draft, verified: false, createdAt: serverTimestamp() });
}

export const listProfiles = (): Promise<UserProfile[]> => todo("C7 listProfiles");

// ── Events ───────────────────────────────────────────────────────────────────

const toMeetup = (snap: QueryDocumentSnapshot) => ({ id: snap.id, ...snap.data() }) as Meetup;

/**
 * Every event that has not ended yet, soonest first. The home screen loads this once and then
 * filters, sorts and measures distances in the browser — see ARCHITECTURE → Consultas.
 */
export async function listUpcomingEvents(): Promise<Meetup[]> {
  const upcoming = query(
    collection(db, "events"),
    where("endsAt", ">=", Timestamp.now()),
    orderBy("endsAt"),
  );
  return (await getDocs(upcoming)).docs.map(toMeetup);
}

export async function getEvent(id: string): Promise<Meetup | null> {
  const snap = await getDoc(doc(db, "events", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Meetup) : null;
}

/** Returns the new event's id. The rules check that `organizerId` is you. */
export async function createEvent(event: Omit<Meetup, "id" | "createdAt">): Promise<string> {
  const created = await addDoc(collection(db, "events"), { ...event, createdAt: serverTimestamp() });
  return created.id;
}

/**
 * Uploads a cover image and returns its download link; save that link as `imageUrl` on the event.
 * storage.rules allow images only, under 5 MB, and only inside your own `events/{uid}/` folder.
 * shortcut: the image of a deleted or edited event is left behind in the bucket; clean up by hand if it grows.
 */
export async function uploadEventImage(uid: string, file: Blob & { name?: string }): Promise<string> {
  const target = ref(storage, `events/${uid}/${crypto.randomUUID()}-${file.name ?? "image"}`);
  await uploadBytes(target, file);
  return getDownloadURL(target);
}

/** One atomic update, no transaction needed. The rules only let you add yourself, and not past capacity. */
export const joinEvent = (eventId: string, me: Pick<UserProfile, "uid" | "languages">) =>
  updateDoc(doc(db, "events", eventId), {
    attendeeIds: arrayUnion(me.uid),
    [`attendeeLanguages.${me.uid}`]: me.languages,
  });

export const leaveEvent = (eventId: string, uid: string) =>
  updateDoc(doc(db, "events", eventId), {
    attendeeIds: arrayRemove(uid),
    [`attendeeLanguages.${uid}`]: deleteField(),
  });

// ── Group chat (F14) ──────────────────────────────────────────────────────────

/** Activities I have joined, soonest first — the list on /chats/. */
export async function listMyEvents(uid: string): Promise<Meetup[]> {
  const mine = query(collection(db, "events"), where("attendeeIds", "array-contains", uid));
  return (await getDocs(mine)).docs
    .map(toMeetup)
    .sort((a, b) => a.startsAt.toMillis() - b.startsAt.toMillis());
}

/** Max length of one message; firestore.rules refuse longer ones. */
export const MESSAGE_MAX = 1000;

/**
 * Live messages of one activity, oldest first. Calls `onChange` every time someone writes.
 * Returns the unsubscribe function: call it when the screen closes.
 * Only attendees can read (firestore.rules); anyone else gets `onError`.
 */
export function watchMessages(
  eventId: string,
  onChange: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return onSnapshot(
    query(collection(db, "events", eventId, "messages"), orderBy("createdAt")),
    (snap) =>
      onChange(
        // "estimate" fills in the time of a message that is still on its way to the server.
        snap.docs.map((found) => ({ id: found.id, ...found.data({ serverTimestamps: "estimate" }) }) as ChatMessage),
      ),
    onError,
  );
}

export async function sendMessage(
  eventId: string,
  me: Pick<UserProfile, "uid" | "displayName" | "pronouns">,
  text: string,
): Promise<void> {
  await addDoc(collection(db, "events", eventId, "messages"), {
    uid: me.uid,
    name: me.displayName,
    pronouns: me.pronouns ?? null,
    text,
    createdAt: serverTimestamp(),
  });
}

// ── Reviews (F12) ─────────────────────────────────────────────────────────────

/** Max length of a review comment; firestore.rules refuse longer ones. */
export const REVIEW_MAX = 500;

/** Every review of one activity, newest first. */
export async function listReviews(eventId: string): Promise<Review[]> {
  const snap = await getDocs(collection(db, "events", eventId, "reviews"));
  return snap.docs
    .map((found) => found.data({ serverTimestamps: "estimate" }) as Review)
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

/** Creates or replaces my review (one per person). The rules only allow it once the activity has started. */
export async function saveReview(eventId: string, review: Omit<Review, "createdAt">): Promise<void> {
  await setDoc(doc(db, "events", eventId, "reviews", review.uid), { ...review, createdAt: serverTimestamp() });
}
