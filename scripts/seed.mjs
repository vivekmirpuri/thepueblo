/**
 * Fills the database with fake people and events for the demo. PLACEHOLDER — nothing is written yet.
 *
 * Wait until the data model has settled (src/lib/types.ts), then build it like scripts/rules-check.mjs:
 *  - Use the normal web SDK, not the admin key: `createUserWithEmailAndPassword` for each fake
 *    person, then write their users/{uid} profile and their events while signed in as them.
 *    That way the seed data passes through the same security rules as real users.
 *  - ~20 people across the islands with different `languages` and `interests`.
 *  - ~30 events: every category, every island, a few online, a few already full.
 *  - Give fake accounts emails ending in @example.com so they are easy to find and delete.
 *  - Do not commit real passwords. Read one from an environment variable: SEED_PASSWORD=… node scripts/seed.mjs
 *  - Official events need a verified institution: create the account, then tick `verified`
 *    on its users/{uid} document by hand in the Firebase console.
 */
console.log("seed.mjs is a placeholder. See the comment at the top of the file.");
