/**
 * Checks the DEPLOYED Firestore rules with three throwaway accounts, then deletes everything it made.
 * Run after every change to firestore.rules (new rules can take a minute to become active):
 *   firebase deploy --only firestore && node scripts/rules-check.mjs
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from "firebase/auth";
import { getFirestore, doc, collection, setDoc, updateDoc, deleteDoc, getDoc, getDocs, addDoc, arrayUnion, arrayRemove, deleteField } from "firebase/firestore";
import config from "../src/lib/firebase.config.json" with { type: "json" };

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

// One app, one signed-in user at a time, switched with as().
const signUp = async () => {
  const email = `rules-${randomUUID()}@example.com`, password = randomUUID();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return { email, password, uid: user.uid };
};
const as = (who) => (who ? signInWithEmailAndPassword(auth, who.email, who.password) : signOut(auth));
const allowed = (promise, what) => promise.catch((e) => { throw new Error(`should be allowed: ${what} (${e.code})`); });
const denied = (promise, what) => assert.rejects(promise, { code: "permission-denied" }, `should be denied: ${what}`);

const a = await signUp(), b = await signUp(), c = await signUp();
const eventRef = doc(db, "events", `rules-check-${randomUUID()}`);
const messages = collection(eventRef, "messages");
const event = { title: "rules check", organizerId: a.uid, official: false, capacity: 2, attendeeIds: [a.uid], attendeeLanguages: { [a.uid]: ["es"] } };
const join = (uid) => updateDoc(eventRef, { attendeeIds: arrayUnion(uid), [`attendeeLanguages.${uid}`]: ["en"] });
let message;

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

  await as(c);
  await denied(join(c.uid), "join a full event (capacity 2)");

  await as(a);
  assert.equal((await allowed(getDocs(messages), "read the chat as an attendee")).size, 1);

  await as(b);
  await allowed(updateDoc(eventRef, { attendeeIds: arrayRemove(b.uid), [`attendeeLanguages.${b.uid}`]: deleteField() }), "leave an event");

  console.log("rules OK: 14 checks passed");
} finally {
  if (message) await as(b).then(() => deleteDoc(message)).catch(() => {});
  await as(a).then(() => Promise.all([deleteDoc(eventRef), deleteDoc(doc(db, "users", a.uid))])).catch(() => {});
  for (const who of [a, b, c]) await as(who).then(({ user }) => deleteUser(user)).catch(() => {});
}
process.exit(0);
