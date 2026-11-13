/**
 * Fills the database with three fake people, a dozen upcoming activities and two past ones with
 * reviews, so the map is not empty and reviews can be shown during the demo. Safe to run again: each fake person deletes their own activities first.
 *
 *   node --env-file=.env.local scripts/seed.mjs
 *
 * SEED_PASSWORD lives in .env.local (gitignored). Always use the SAME one: the three accounts are
 * created on the first run and signed into on later runs. If you lose it, delete the three
 * *.demo@example.com accounts in Authentication and their activities in Firestore, then run again.
 *
 * It uses the normal web SDK, not an admin key, so everything it writes has to pass the same
 * security rules as a real person. The three accounts speak different languages on purpose:
 * that is what makes the flags on an activity worth looking at.
 *
 * Official activities (F13) are NOT seeded: they need an institution whose `verified` field is
 * ticked by hand in the Firebase console, which no client is allowed to do.
 */
import { randomUUID } from "node:crypto";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import config from "../src/lib/firebase.config.json" with { type: "json" };

const password = process.env.SEED_PASSWORD;
if (!password) {
  console.error("Falta SEED_PASSWORD. Ejemplo: SEED_PASSWORD=... node scripts/seed.mjs");
  process.exit(1);
}

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const PEOPLE = [
  {
    email: "ana.demo@example.com",
    displayName: "Ana",
    pronouns: "ella",
    languages: ["es", "en"],
    island: "tenerife",
    interests: ["outdoors", "languages", "food"],
    bio: "Me encanta caminar y conocer gente nueva.",
    availability: ["weekends"],
  },
  {
    email: "yusuf.demo@example.com",
    displayName: "Yusuf",
    pronouns: null,
    languages: ["ar", "es"],
    island: "gran-canaria",
    interests: ["tech", "games", "volunteering"],
    bio: "Llegué hace un año. Busco gente para practicar español.",
    availability: ["weekday_evenings"],
  },
  {
    email: "nadia.demo@example.com",
    displayName: "Nadia",
    pronouns: "elle",
    languages: ["fr", "es", "wo"],
    island: "lanzarote",
    interests: ["music", "arts", "debate"],
    bio: "Toco la guitarra y organizo quedadas de música.",
    availability: ["weekday_evenings", "weekends"],
  },
];

const day = 24 * 60 * 60 * 1000;
const at = (days, hour) => {
  const when = new Date(Date.now() + days * day);
  when.setHours(hour, 0, 0, 0);
  return when;
};

/** [organizer index, …fields] */
const ACTIVITIES = [
  [0, { title: "Caminata al atardecer por Anaga", category: "outdoors", placeName: "Cruz del Carmen, Anaga", location: { lat: 28.5289, lng: -16.2829 }, days: 1, hour: 18, hours: 3, capacity: 12, inclusion: ["inclusive_language"], description: "Ruta tranquila de dos horas. Llevad agua y calzado cómodo." }],
  [0, { title: "Intercambio de idiomas en la plaza", category: "languages", placeName: "Plaza del Adelantado, La Laguna", location: { lat: 28.4874, lng: -16.3147 }, days: 2, hour: 19, hours: 2, capacity: 20, inclusion: ["inclusive_language", "wheelchair"], description: "Media hora en cada idioma. Vienen personas de muchos países." }],
  [0, { title: "Cocinamos juntas un potaje canario", category: "food", placeName: "Centro ciudadano, Santa Cruz", location: { lat: 28.4636, lng: -16.2546 }, days: 4, hour: 12, hours: 4, capacity: 10, inclusion: ["wheelchair", "gender_perspective"], description: "Traed un ingrediente. Comemos lo que salga." }],
  [0, { title: "Café para recién llegados", category: "languages", placeName: "Puerto de la Cruz", location: { lat: 28.415, lng: -16.5447 }, days: 6, hour: 17, hours: 2, capacity: null, inclusion: ["inclusive_language", "low_vision"], description: "Si acabas de llegar a la isla, este café es para ti." }],

  [1, { title: "Taller de móvil para mayores", category: "tech", placeName: "Biblioteca, Las Palmas", location: { lat: 28.1235, lng: -15.43 }, days: 2, hour: 11, hours: 2, capacity: 8, inclusion: ["wheelchair", "low_vision", "captions"], description: "Aprendemos a usar el móvil sin prisa y sin palabras raras." }],
  [1, { title: "Tarde de juegos de mesa", category: "games", placeName: "Parque San Telmo, Las Palmas", location: { lat: 28.1037, lng: -15.4182 }, days: 3, hour: 17, hours: 4, capacity: 16, inclusion: ["inclusive_language"], description: "Hay juegos para aprender en cinco minutos." }],
  [1, { title: "Limpieza de playa", category: "volunteering", placeName: "Playa de Las Canteras", location: { lat: 28.1427, lng: -15.4383 }, days: 5, hour: 9, hours: 2, capacity: 30, inclusion: ["wheelchair", "sign_language"], description: "Llevamos guantes y bolsas. Vente un rato aunque sea." }],
  [1, { title: "Charla: cómo pedir cita médica", category: "volunteering", placeName: "En línea", location: null, days: 1, hour: 19, hours: 1, capacity: null, inclusion: ["captions", "inclusive_language"], description: "Explicamos paso a paso, con subtítulos.", mode: "online" }],

  [2, { title: "Jam de música abierta", category: "music", placeName: "Charco de San Ginés, Arrecife", location: { lat: 28.963, lng: -13.55 }, days: 2, hour: 20, hours: 3, capacity: null, inclusion: ["inclusive_language", "gender_perspective"], description: "Trae tu instrumento o solo tus ganas de escuchar." }],
  [2, { title: "Taller de acuarela para principiantes", category: "arts", placeName: "Casa de la Cultura, Arrecife", location: { lat: 28.9619, lng: -13.5479 }, days: 7, hour: 17, hours: 2, capacity: 6, inclusion: ["wheelchair", "sign_language"], description: "Ponemos el material. No hace falta saber dibujar." }],
  [2, { title: "Debate: ¿cómo es vivir en las islas?", category: "debate", placeName: "En línea", location: null, days: 3, hour: 19, hours: 2, capacity: 25, inclusion: ["captions", "inclusive_language", "gender_perspective"], description: "Hablamos con respeto y con turnos.", mode: "online" }],
  // Past ones: they only appear in "Mis grupos" and on their own page, with reviews.
  [0, { title: "Paseo por el casco histórico de La Laguna", category: "culture", placeName: "Catedral de La Laguna", location: { lat: 28.4888, lng: -16.3159 }, days: -4, hour: 11, hours: 2, capacity: null, inclusion: ["wheelchair", "inclusive_language"], description: "Recorrido tranquilo por las calles patrimonio de la humanidad.", past: true }],
  [1, { title: "Torneo de dominó en el barrio", category: "games", placeName: "Plaza de Santa Ana, Las Palmas", location: { lat: 28.1004, lng: -15.4157 }, days: -2, hour: 18, hours: 3, capacity: 16, inclusion: ["inclusive_language"], description: "Partidas por parejas. Ganó quien menos se lo esperaba.", past: true }],
  [2, { title: "Yoga suave en el parque", category: "wellbeing", placeName: "Parque Islas Canarias, Arrecife", location: { lat: 28.9579, lng: -13.5586 }, days: 4, hour: 8, hours: 1, capacity: 15, inclusion: ["low_vision", "gender_perspective"], description: "Para todos los cuerpos y todas las edades." }],
];

/** Signs in as a fake person, creating the account the first time. */
async function enter(person) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, person.email, password);
    return user;
  } catch (error) {
    if (error.code !== "auth/invalid-credential" && error.code !== "auth/user-not-found") throw error;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, person.email, password);
      return user;
    } catch (second) {
      if (second.code !== "auth/email-already-in-use") throw second;
      throw new Error(
        `La cuenta ${person.email} ya existe con otra contraseña. Usa el mismo SEED_PASSWORD de la ` +
          `primera vez, o borra las cuentas *.demo@example.com en Authentication y sus actividades ` +
          `en Firestore, y vuelve a ejecutar.`,
      );
    }
  }
}

const created = [];

for (const [index, person] of PEOPLE.entries()) {
  const user = await enter(person);

  await setDoc(
    doc(db, "users", user.uid),
    {
      displayName: person.displayName,
      pronouns: person.pronouns,
      photoURL: null,
      role: "user",
      bio: person.bio,
      interests: person.interests,
      languages: person.languages,
      island: person.island,
      prefers: "both",
      availability: person.availability,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  // Clear what this person seeded before, so running the script again does not pile up copies.
  const mine = await getDocs(query(collection(db, "events"), where("organizerId", "==", user.uid)));
  await Promise.all(mine.docs.map((found) => deleteDoc(found.ref)));

  for (const [owner, activity] of ACTIVITIES) {
    if (owner !== index) continue;
    const startsAt = at(activity.days, activity.hour);
    const reference = await addDoc(collection(db, "events"), {
      title: activity.title,
      description: activity.description,
      category: activity.category,
      imageUrl: null,
      official: false,
      organizerId: user.uid,
      organizerName: person.displayName,
      mode: activity.mode ?? "in_person",
      location: activity.location,
      placeName: activity.placeName,
      island: person.island,
      onlineUrl: activity.mode === "online" ? "https://meet.example.com/" + randomUUID().slice(0, 8) : null,
      startsAt: Timestamp.fromDate(startsAt),
      endsAt: Timestamp.fromDate(new Date(startsAt.getTime() + activity.hours * 60 * 60 * 1000)),
      capacity: activity.capacity,
      inclusion: activity.inclusion,
      attendeeIds: [user.uid],
      attendeeLanguages: { [user.uid]: person.languages },
      embedding: null,
      createdAt: serverTimestamp(),
    });
    created.push({ id: reference.id, owner: index, past: !!activity.past });
  }
}

// Everyone joins two activities of the others, so the flags show more than one language.
for (const [index, person] of PEOPLE.entries()) {
  const user = await enter(person);
  for (const activity of created.filter((item) => item.owner !== index && !item.past).slice(0, 2)) {
    await updateDoc(doc(db, "events", activity.id), {
      attendeeIds: arrayUnion(user.uid),
      [`attendeeLanguages.${user.uid}`]: person.languages,
    });
  }
}

// Past activities: the others joined them and left a review afterwards.
const REVIEWS = [
  [5, "Me encantó, y la guía hablaba muy despacio, se entendía todo."],
  [4, "Muy buen ambiente. Repetiría."],
];
let reviews = 0;
for (const [index, person] of PEOPLE.entries()) {
  const user = await enter(person);
  for (const activity of created.filter((item) => item.past && item.owner !== index)) {
    await updateDoc(doc(db, "events", activity.id), {
      attendeeIds: arrayUnion(user.uid),
      [`attendeeLanguages.${user.uid}`]: person.languages,
    });
    const [rating, text] = REVIEWS[(index + reviews) % REVIEWS.length];
    await setDoc(doc(db, "events", activity.id, "reviews", user.uid), {
      uid: user.uid,
      name: person.displayName,
      rating,
      text,
      createdAt: serverTimestamp(),
    });
    reviews += 1;
  }
}

console.log(`Listo: ${PEOPLE.length} personas, ${created.length} actividades y ${reviews} reseñas.`);
process.exit(0);
