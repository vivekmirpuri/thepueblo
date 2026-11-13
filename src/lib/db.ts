/**
 * Firestore reads and writes — SHARED file. Every screen goes through these functions instead
 * of calling Firestore directly, so the document shapes live in one place.
 *
 * Built:      joinEvent, leaveEvent, uploadEventImage (all verified by scripts/rules-check.mjs)
 * Not built:  everything that calls todo() — the task id says who picks it up (see PLAN.md)
 *
 * Notes for whoever fills these in:
 *  - Reads for lists: `getDocs(query(collection(db, "events"), where("endsAt", ">=", Timestamp.now()), orderBy("endsAt")))`.
 *  - Realtime (the chat): `onSnapshot(query(collection(db, "events", id, "messages"), orderBy("createdAt")), cb)`
 *    and return its unsubscribe function from the component's effect.
 *  - Add the document id yourself: `{ id: snap.id, ...snap.data() } as Meetup`.
 */
import { arrayRemove, arrayUnion, deleteField, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import { todo } from "./todo";
import type { ChatMessage, Meetup, Review, UserProfile } from "./types";

// ── Profiles (Track C) ────────────────────────────────────────────────────────
export const getProfile = (uid: string): Promise<UserProfile | null> => todo("C1 getProfile", uid);
export const saveProfile = (profile: UserProfile): Promise<void> => todo("C1 saveProfile", profile);
export const listProfiles = (): Promise<UserProfile[]> => todo("C7 listProfiles");

// ── Events (Track A reads, Track B writes) ────────────────────────────────────
export const listUpcomingEvents = (): Promise<Meetup[]> => todo("A1 listUpcomingEvents");
export const getEvent = (id: string): Promise<Meetup | null> => todo("B2 getEvent", id);
export const createEvent = (event: Omit<Meetup, "id" | "createdAt">): Promise<string> => todo("B1 createEvent", event);

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
export const sendMessage = (eventId: string, me: Pick<UserProfile, "uid" | "displayName">, text: string): Promise<void> =>
  todo("B4 sendMessage", eventId, me, text);
export const listReviews = (eventId: string): Promise<Review[]> => todo("B6 listReviews", eventId);
export const saveReview = (eventId: string, review: Omit<Review, "createdAt">): Promise<void> =>
  todo("B6 saveReview", eventId, review);
