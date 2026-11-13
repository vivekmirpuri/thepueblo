/**
 * Checks the DEPLOYED Firestore and Storage rules with three throwaway accounts, then deletes
 * everything it made. Run after every change to firestore.rules or storage.rules (new rules can
 * take a few minutes to become active):
 *   firebase deploy --only firestore,storage && node scripts/rules-check.mjs
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from "firebase/auth";
import { getFirestore, doc, collection, setDoc, updateDoc, deleteDoc, getDoc, getDocs, addDoc, arrayUnion, arrayRemove, deleteField } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import config from "../src/lib/firebase.config.json" with { type: "json" };

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// One app, one signed-in user at a time, switched with as().
const signUp = async () => {
  const email = `rules-${randomUUID()}@example.com`, password = randomUUID();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return { email, password, uid: user.uid };
};
const as = (who) => (who ? signInWithEmailAndPassword(auth, who.email, who.password) : signOut(auth));
const allowed = (promise, what) => promise.catch((e) => { throw new Error(`should be allowed: ${what} (${e.code})`); });
const denied = (promise, what, code = "permission-denied") => assert.rejects(promise, { code }, `should be denied: ${what}`);

const a = await signUp(), b = await signUp(), c = await signUp();
const eventRef = doc(db, "events", `rules-check-${randomUUID()}`);
const messages = collection(eventRef, "messages");
const event = { title: "rules check", organizerId: a.uid, official: false, capacity: 2, attendeeIds: [a.uid], attendeeLanguages: { [a.uid]: ["es"] } };
const join = (uid) => updateDoc(eventRef, { attendeeIds: arrayUnion(uid), [`attendeeLanguages.${uid}`]: ["en"] });
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const image = ref(storage, `events/${a.uid}/rules-check.png`);
let message, uploaded;

try {
  await as(a);
  await allowed(setDoc(doc(db, "users", a.uid), { displayName: "A", verified: false }), "create your own profile");
  await denied(updateDoc(doc(db, "users", a.uid), { verified: true }), "verify yourself");
  await denied(setDoc(eventRef, { ...event, official: true }), "post an official event when not verified");
  await allowed(setDoc(eventRef, event), "create an event");

  await as(null);
  await allowed(getDoc(eventRef), "read events without an account");
  await denied(getDoc(doc(db, "users", a.uid)), "read profiles without an account");

  await as(b);
  await denied(updateDoc(eventRef, { title: "hacked" }), "edit someone else's event");
  await denied(getDocs(messages), "read a chat before joining");
  await denied(join("someone-else"), "add another person to an event");
  await allowed(join(b.uid), "join an event");
  message = await allowed(addDoc(messages, { uid: b.uid, text: "hi" }), "post in the chat after joining");
  await denied(addDoc(messages, { uid: b.uid, text: "" }), "post an empty message");
  await denied(addDoc(messages, { uid: b.uid, text: "x".repeat(1001) }), "post a message over 1000 characters");

  await as(c);
  await denied(join(c.uid), "join a full event (capacity 2)");

  await as(a);
  assert.equal((await allowed(getDocs(messages), "read the chat as an attendee")).size, 1);

  await as(b);
  await allowed(updateDoc(eventRef, { attendeeIds: arrayRemove(b.uid), [`attendeeLanguages.${b.uid}`]: deleteField() }), "leave an event");

  // Storage: event images
  await as(a);
  await allowed(uploadBytes(image, png, { contentType: "image/png" }), "upload an image to your own folder");
  uploaded = true;
  await denied(uploadBytes(ref(storage, `events/${a.uid}/notes.txt`), png, { contentType: "text/plain" }), "upload a non-image", "storage/unauthorized");
  await as(b);
  await denied(uploadBytes(ref(storage, `events/${a.uid}/intruder.png`), png, { contentType: "image/png" }), "upload into someone else's folder", "storage/unauthorized");
  await as(null);
  await allowed(getDownloadURL(image), "see an event image without an account");

  console.log("rules OK: 20 checks passed");
} finally {
  if (uploaded) await as(a).then(() => deleteObject(image)).catch(() => {});
  if (message) await as(b).then(() => deleteDoc(message)).catch(() => {});
  await as(a).then(() => Promise.all([deleteDoc(eventRef), deleteDoc(doc(db, "users", a.uid))])).catch(() => {});
  for (const who of [a, b, c]) await as(who).then(({ user }) => deleteUser(user)).catch(() => {});
}
process.exit(0);
