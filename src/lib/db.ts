/**
 * Firestore reads and writes — SHARED file. Every screen goes through these functions instead
 * of calling Firestore directly, so the document shapes live in one place.
 *
 * Built:      getProfile, saveProfile, joinEvent, leaveEvent, uploadEventImage
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

// ── Chat and reviews (Track B) ────────────────────────────────────────────────
/** Returns the unsubscribe function. */
export const watchMessages = (eventId: string, onChange: (messages: ChatMessage[]) => void): (() => void) =>
  todo("B4 watchMessages", eventId, onChange);
export const sendMessage = (eventId: string, me: Pick<UserProfile, "uid" | "displayName" | "pronouns">, text: string): Promise<void> =>
  todo("B4 sendMessage", eventId, me, text);
export const listReviews = (eventId: string): Promise<Review[]> => todo("B6 listReviews", eventId);
export const saveReview = (eventId: string, review: Omit<Review, "createdAt">): Promise<void> =>
  todo("B6 saveReview", eventId, review);
