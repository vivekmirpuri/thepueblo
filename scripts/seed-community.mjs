/**
 * Fills the app with a whole community for the demo: 16 fake people across the islands, ~54
 * activities (12 of them LGTBIQ+ safe spaces, written without gendered words) with a cover image, people joining each other's plans, group chats and reviews.
 *
 *   node --env-file=.env.local scripts/seed-community.mjs
 *
 * Safe to run again: everyone deletes the activities they created before and creates them anew.
 * It uses the normal web SDK (no admin key), so every write passes the real security rules.
 * Accounts are *.comunidad@example.com and use SEED_PASSWORD from .env.local (gitignored).
 *
 * Images are drawn here, not downloaded: a gradient in the category's colours with the
 * category's icon, uploaded to Storage like a real photo would be. No stock photos, no licences.
 * Everything is random but seeded, so each run produces the same community.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Icons from "lucide-react";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  Timestamp, addDoc, arrayUnion, collection, deleteDoc, doc, getDocs, getFirestore, query,
  serverTimestamp, setDoc, updateDoc, where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import config from "../src/lib/firebase.config.json" with { type: "json" };

const password = process.env.SEED_PASSWORD;
if (!password) {
  console.error("Falta SEED_PASSWORD en .env.local. Ejemplo: node --env-file=.env.local scripts/seed-community.mjs");
  process.exit(1);
}

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ── Deterministic randomness ──────────────────────────────────────────────────
let state = 20261114;
const random = () => ((state = (state * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (list) => list[Math.floor(random() * list.length)];
const some = (list, count) => [...list].sort(() => random() - 0.5).slice(0, count);

// ── People ────────────────────────────────────────────────────────────────────
const PEOPLE = [
  ["Lucía", "ella", ["es", "en"], "tenerife", ["outdoors", "languages", "culture"], "Nací en La Laguna. Me encanta enseñar la isla a quien llega."],
  ["Omar", null, ["ar", "zgh", "es"], "gran-canaria", ["sport", "volunteering", "food"], "Vine de Agadir hace dos años. Juego al fútbol los domingos."],
  ["Fatou", "ella", ["wo", "fr", "es"], "gran-canaria", ["music", "families", "arts"], "Cantante y mamá. Busco planes con niñas y niños."],
  ["Mateo", "él", ["es", "it"], "lanzarote", ["outdoors", "sport", "wellbeing"], "Surfista. Siempre con ganas de un plan al aire libre."],
  ["Oksana", "ella", ["uk", "ru", "en"], "tenerife", ["languages", "arts", "families"], "Llegué de Kiev. Quiero practicar español y conocer gente."],
  ["Ravi", "él", ["hi", "sd", "en", "es"], "tenerife", ["tech", "food", "culture"], "Mi familia lleva 40 años en Santa Cruz. Cocino muy picante."],
  ["Alex", "elle", ["es", "ca", "en"], "gran-canaria", ["improv", "debate", "music"], "Hago impro y me gusta debatir con respeto."],
  ["Ingrid", null, ["sv", "no", "en"], "la-palma", ["wellbeing", "outdoors", "arts"], "Vivo en La Palma desde hace un año. Yoga y senderos."],
  ["Mamadou", "él", ["ff", "bm", "fr"], "fuerteventura", ["sport", "languages", "volunteering"], "Estudio español en Puerto del Rosario. Me gusta el baloncesto."],
  ["Carmen", "ella", ["es", "ssp"], "tenerife", ["culture", "families", "wellbeing"], "Sorda y profe de lengua de signos. Os enseño encantada."],
  ["Hans", "él", ["de", "en"], "la-gomera", ["outdoors", "food", "culture"], "Jubilado en Valle Gran Rey. Conozco todos los senderos."],
  ["Yasmin", "ella", ["ar", "fr", "es"], "lanzarote", ["arts", "debate", "languages"], "Pinto y escribo. Organizo tertulias en Arrecife."],
  ["Diego", "él", ["es", "pt"], "el-hierro", ["outdoors", "wellbeing", "volunteering"], "Buceador en La Restinga. Cuido el mar."],
  ["Mei", "ella", ["zh", "en", "es"], "gran-canaria", ["food", "games", "tech"], "Tengo una tienda en Las Palmas. Juego al mahjong."],
  ["Bea", "ella/elle", ["it", "es", "en"], "fuerteventura", ["music", "improv", "games"], "Música y teatro. Recién llegada a Corralejo."],
  ["Samir", null, ["ur", "bn", "en"], "tenerife", ["tech", "games", "volunteering"], "Informático. Ayudo con papeles y móviles."],
].map(([displayName, pronouns, languages, island, interests, bio], index) => ({
  email: `${displayName.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()}.comunidad@example.com`,
  displayName, pronouns, languages, island, interests, bio, index,
  availability: some(["weekday_mornings", "weekday_evenings", "weekends"], 1 + (index % 2)),
}));

// ── Places ────────────────────────────────────────────────────────────────────
const PLACES = {
  "tenerife": [["Parque García Sanabria, Santa Cruz", 28.472, -16.2545], ["Plaza del Adelantado, La Laguna", 28.4874, -16.3147], ["Lago Martiánez, Puerto de la Cruz", 28.417, -16.544], ["Playa de Los Cristianos", 28.049, -16.717], ["Cruz del Carmen, Anaga", 28.5289, -16.2829]],
  "gran-canaria": [["Playa de Las Canteras, Las Palmas", 28.1427, -15.4383], ["Plaza de Santa Ana, Vegueta", 28.1004, -15.4157], ["Dunas de Maspalomas", 27.74, -15.58], ["Casco de Agüimes", 27.905, -15.446], ["Parque San Telmo, Las Palmas", 28.1037, -15.4182]],
  "lanzarote": [["Charco de San Ginés, Arrecife", 28.963, -13.55], ["Villa de Teguise", 29.06, -13.56], ["Playa Blanca", 28.863, -13.832]],
  "fuerteventura": [["Puerto del Rosario", 28.5, -13.86], ["Corralejo", 28.73, -13.867]],
  "la-palma": [["Santa Cruz de La Palma", 28.6835, -17.764], ["Los Llanos de Aridane", 28.658, -17.918]],
  "la-gomera": [["San Sebastián de La Gomera", 28.09, -17.11], ["Valle Gran Rey", 28.09, -17.335]],
  "el-hierro": [["Valverde", 27.806, -17.915], ["La Restinga", 27.643, -17.981]],
};

// ── Activities: [organiser, category, title, description, extra] ──────────────
const ACTIVITIES = [
  [0, "outdoors", "Ruta por el bosque de laurisilva", "Sendero fácil de dos horas entre árboles centenarios. Calzado cómodo y agua.", { inclusion: ["inclusive_language"], capacity: 15 }],
  [0, "languages", "Intercambio español–inglés", "Media hora en cada idioma, con café. Todos los niveles.", { inclusion: ["inclusive_language", "wheelchair"] }],
  [0, "culture", "Visita al casco histórico de La Laguna", "Paseamos por las calles patrimonio de la humanidad y contamos su historia.", { inclusion: ["wheelchair"], past: true }],
  [1, "sport", "Fútbol de los domingos", "Partido mixto y abierto. Nadie se queda en el banquillo.", { capacity: 22, inclusion: ["gender_perspective"] }],
  [1, "volunteering", "Limpieza de la playa de Las Canteras", "Ponemos guantes y bolsas. Ven aunque sea media hora.", { inclusion: ["wheelchair", "sign_language"] }],
  [1, "food", "Cuscús de los viernes", "Cocinamos un cuscús marroquí entre todas y lo comemos juntas.", { capacity: 12, inclusion: ["gender_perspective"] }],
  [2, "music", "Tambores y canciones de Senegal", "Taller de percusión para cualquier edad. Los tambores los traigo yo.", { inclusion: ["inclusive_language", "wheelchair"] }],
  [2, "families", "Cuentos del mundo para peques", "Cuentos en wolof, francés y español, con dibujos.", { inclusion: ["low_vision", "inclusive_language"], capacity: 20 }],
  [2, "arts", "Tela y color: taller de wax", "Diseñamos un pañuelo con telas africanas.", { capacity: 10, past: true }],
  [3, "outdoors", "Surf para principiantes", "Primera clase gratis. Tablas y neoprenos para quien no tenga.", { capacity: 8 }],
  [3, "wellbeing", "Yoga al amanecer en la playa", "Sesión suave para todos los cuerpos.", { inclusion: ["low_vision", "gender_perspective"] }],
  [3, "sport", "Vóley playa abierto", "Formamos equipos al llegar.", { capacity: 16 }],
  [4, "languages", "Charlas en español para recién llegadas", "Practicamos español sin prisa y sin vergüenza.", { inclusion: ["inclusive_language", "captions"] }],
  [4, "arts", "Pintura de huevos ucranianos (pysanky)", "Taller de pintura tradicional. Material incluido.", { capacity: 8 }],
  [4, "families", "Tarde de juegos para familias", "Juegos de mesa sencillos para todas las edades.", { inclusion: ["wheelchair"] }],
  [5, "food", "Cocina india sin miedo al picante", "Aprendemos tres recetas fáciles y comemos juntos.", { capacity: 10, inclusion: ["wheelchair"] }],
  [5, "tech", "Taller: tu móvil, paso a paso", "Para personas mayores. Sin palabras raras.", { inclusion: ["wheelchair", "low_vision", "captions"], capacity: 10 }],
  [5, "culture", "Diwali en Santa Cruz", "Celebramos la fiesta de las luces con la comunidad india.", { inclusion: ["wheelchair", "inclusive_language"], past: true }],
  [6, "improv", "Impro para quien nunca ha hecho impro", "Juegos de teatro para perder la vergüenza.", { capacity: 14, inclusion: ["inclusive_language", "gender_perspective"] }],
  [6, "debate", "¿Cómo se vive con un alquiler en las islas?", "Debate con turnos y respeto. Moderamos entre todas.", { inclusion: ["captions", "inclusive_language"], online: true }],
  [6, "music", "Jam abierta en San Telmo", "Trae tu instrumento o solo tus ganas.", {}],
  [7, "wellbeing", "Meditación en el bosque", "Media hora en silencio y un paseo corto.", { inclusion: ["low_vision"] }],
  [7, "outdoors", "Ruta de los volcanes", "Ruta media de 4 horas. Hay que llevar comida.", { capacity: 12 }],
  [8, "sport", "Baloncesto 3x3", "Equipos mixtos. Ven con zapatillas.", { capacity: 12 }],
  [8, "languages", "Francés–español en la biblioteca", "Intercambio de idiomas para estudiantes.", { inclusion: ["inclusive_language"] }],
  [8, "volunteering", "Repartir comida con la asociación", "Ayudamos a preparar y repartir lotes.", { inclusion: ["wheelchair"], past: true }],
  [9, "culture", "Iniciación a la lengua de signos", "Primeras palabras y saludos en LSE. Para todo el mundo.", { inclusion: ["sign_language", "wheelchair", "inclusive_language"], capacity: 20 }],
  [9, "families", "Cuentacuentos signado", "Cuentos en lengua de signos y en voz.", { inclusion: ["sign_language", "captions"] }],
  [10, "outdoors", "Sendero del Garajonay", "Caminata tranquila por el parque nacional.", { capacity: 10 }],
  [10, "food", "Mojo y papas: taller de cocina canaria", "Aprendemos a hacer mojo rojo y verde.", { capacity: 12, past: true }],
  [11, "debate", "Tertulia: ser mujer migrante", "Espacio seguro para hablar y escuchar.", { inclusion: ["gender_perspective", "inclusive_language"], capacity: 15 }],
  [11, "arts", "Escritura creativa en varios idiomas", "Escribe en tu idioma; leemos todas.", { inclusion: ["inclusive_language"], online: true }],
  [12, "volunteering", "Limpieza del fondo marino", "Buceo de limpieza para personas con título.", { capacity: 6 }],
  [12, "wellbeing", "Respiración y relajación junto al mar", "Ejercicios sencillos para soltar el estrés.", { inclusion: ["low_vision", "wheelchair"] }],
  [13, "games", "Mahjong para principiantes", "Os enseño a jugar. Té incluido.", { capacity: 8 }],
  [13, "food", "Dumplings caseros", "Hacemos y comemos jiaozi.", { capacity: 10 }],
  [13, "tech", "Apps útiles para recién llegados", "Citas, transporte y trámites desde el móvil.", { inclusion: ["captions", "inclusive_language"], online: true }],
  [14, "music", "Coro abierto, sin audiciones", "Cantamos canciones de muchos países.", { inclusion: ["inclusive_language", "gender_perspective"] }],
  [14, "improv", "Teatro del oprimido", "Teatro para hablar de lo que nos pasa.", { capacity: 15, past: true }],
  [15, "tech", "Ayuda con papeles en el móvil", "Te ayudo con la cita previa y el certificado digital.", { inclusion: ["captions", "wheelchair"] }],
  [15, "games", "Torneo de ajedrez del barrio", "Todos los niveles. Tableros para todos.", { capacity: 20 }],
  [15, "volunteering", "Clases de refuerzo para peques", "Ayudamos con los deberes los martes.", { inclusion: ["inclusive_language"] }],
  // LGTBIQ+ safe spaces, written without gendered words.
  [6, "debate", "Charla: ser LGTBIQ+ y migrante", "Un espacio para hablar y escuchar sin juicios. Cada persona comparte lo que quiera.", { inclusion: ["lgtbiq", "inclusive_language", "captions"], capacity: 20 }],
  [6, "improv", "Impro queer", "Juegos de teatro para soltarse. No hace falta experiencia.", { inclusion: ["lgtbiq", "inclusive_language"], capacity: 16 }],
  [14, "music", "Karaoke del Orgullo", "Canciones, risas y cero presión. Canta quien quiera.", { inclusion: ["lgtbiq", "inclusive_language", "wheelchair"] }],
  [14, "games", "Noche de juegos de mesa LGTBIQ+", "Juegos fáciles para conocer gente en un ambiente tranquilo.", { inclusion: ["lgtbiq", "inclusive_language"], capacity: 20 }],
  [0, "outdoors", "Ruta arcoíris por Anaga", "Caminata tranquila en un grupo diverso. Ritmo para cualquier persona.", { inclusion: ["lgtbiq", "inclusive_language"], capacity: 15 }],
  [15, "tech", "Ayuda con el cambio de nombre en los papeles", "Acompañamiento paso a paso con los trámites del registro.", { inclusion: ["lgtbiq", "captions", "inclusive_language"], online: true }],
  [11, "arts", "Taller de fanzines queer", "Recortes, dibujos y palabras para contar quién eres.", { inclusion: ["lgtbiq", "inclusive_language"], capacity: 12 }],
  [3, "sport", "Vóley playa abierto y diverso", "Equipos mezclados al llegar. Cada persona juega a su ritmo.", { inclusion: ["lgtbiq", "inclusive_language"], capacity: 16 }],
  [7, "wellbeing", "Yoga en un espacio seguro LGTBIQ+", "Sesión suave, sin espejos y sin comentarios sobre cuerpos.", { inclusion: ["lgtbiq", "low_vision", "inclusive_language"] }],
  [9, "culture", "Signos del Orgullo", "Vocabulario LGTBIQ+ en lengua de signos, para cualquier persona.", { inclusion: ["lgtbiq", "sign_language", "inclusive_language"], capacity: 20 }],
  [2, "families", "Merienda de familias diversas", "Para familias de cualquier forma, con peques o sin peques.", { inclusion: ["lgtbiq", "wheelchair", "inclusive_language"] }],
  [4, "languages", "Intercambio de idiomas en un espacio seguro", "Practica idiomas con gente que respeta quién eres.", { inclusion: ["lgtbiq", "inclusive_language"], past: true }],
];

// Regular activities happened before too: a past edition of each, so there is history and reviews.
for (const [owner, category, title, description, extra] of ACTIVITIES.slice(0, 40)) {
  if (extra.past || extra.online) continue;
  ACTIVITIES.push([owner, category, title, description, { ...extra, past: true }]);
}

const PLATFORM_IDS = ["meet", "zoom", "jitsi", "teams", "whatsapp", "discord"];

const CHAT = [
  "¡Hola! Qué ganas de conoceros.", "¿Alguien viene desde lejos? Puedo llevar a dos personas en coche.",
  "Yo llevo agua para el grupo.", "Es mi primera vez, un poco de nervios 😅", "¿Hay que llevar algo?",
  "Nos vemos allí. Iré con una camiseta naranja.", "Perfecto, gracias por organizar.", "¿Se puede ir con niños?",
  "Llego 10 minutos tarde, ¡no empecéis sin mí!", "¿Dónde aparcamos?", "Yo puedo traer algo de comer.",
  "La última vez fue genial, repito.", "¿Alguien habla francés? Así practico.", "Hace buen tiempo, perfecto para salir.",
  "Gracias por pensar en que sea accesible 🙌", "¿A qué hora terminamos más o menos?", "¡Qué buena idea esta actividad!",
  "Traigo a una amiga que acaba de llegar a la isla.", "Mándame la ubicación exacta, por favor.", "Yo voy en guagua, llego a las 6.",
];
const REVIEWS = [
  [5, "Me encantó. Se notaba que estaba pensado para que cupiera todo el mundo."],
  [5, "Conocí a gente maravillosa. Repetiré seguro."],
  [4, "Muy buen ambiente. Empezó un poco tarde, pero mereció la pena."],
  [4, "Bien organizado y muy accesible."],
  [5, "La persona que lo organizaba explicaba todo muy despacio. Gracias."],
  [5, "Me sentí en casa desde el primer minuto."],
  [4, "Muy bonito. Faltaron algunas sillas, pero todo bien."],
  [5, "Perfecto para practicar idiomas sin vergüenza."],
  [3, "Estuvo bien, aunque éramos muchas personas para el sitio."],
  [5, "Volveré la próxima semana. ¡Gracias por organizarlo!"],
  [4, "Gente muy maja y un ambiente muy respetuoso."],
  [5, "Lo mejor de mi semana."],
  [4, ""],
  [5, ""],
];

// ── Category look for the drawn images ────────────────────────────────────────
const LOOK = {
  sport: ["#0EA5E9", "#1E3A8A", "DumbbellIcon"], outdoors: ["#16A34A", "#064E3B", "MountainIcon"],
  languages: ["#F59E0B", "#B45309", "LanguagesIcon"], debate: ["#8B5CF6", "#4C1D95", "VoteIcon"],
  improv: ["#EC4899", "#831843", "DramaIcon"], music: ["#F97316", "#9A3412", "MusicIcon"],
  food: ["#EF4444", "#7F1D1D", "UtensilsCrossedIcon"], tech: ["#6366F1", "#1E1B4B", "LaptopIcon"],
  arts: ["#D946EF", "#701A75", "PaletteIcon"], games: ["#14B8A6", "#134E4A", "DicesIcon"],
  volunteering: ["#E0572F", "#7C2D12", "HeartHandshakeIcon"], families: ["#FACC15", "#A16207", "BabyIcon"],
  wellbeing: ["#22C55E", "#14532D", "Flower2Icon"], culture: ["#A855F7", "#581C87", "LandmarkIcon"],
};

function drawImage(category, seed) {
  const [light, dark, iconName] = LOOK[category];
  const icon = renderToStaticMarkup(createElement(Icons[iconName], { size: 220, color: "#ffffff", strokeWidth: 1.5 }))
    .replace("<svg", '<svg x="490" y="227"');
  const bubbles = Array.from({ length: 6 }, (_, i) => {
    const x = (seed * 97 + i * 211) % 1200, y = (seed * 53 + i * 131) % 675, r = 40 + ((seed + i * 37) % 120);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="0.08"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
<rect width="1200" height="675" fill="url(#g)"/>${bubbles}${icon}</svg>`;
}

// ── Writes ────────────────────────────────────────────────────────────────────
async function enter(person) {
  try {
    return (await signInWithEmailAndPassword(auth, person.email, password)).user;
  } catch (error) {
    if (error.code !== "auth/invalid-credential" && error.code !== "auth/user-not-found") throw error;
    return (await createUserWithEmailAndPassword(auth, person.email, password)).user;
  }
}

const day = 24 * 60 * 60 * 1000;
const created = []; // { id, owner, past, capacity, attendees: Set<index> }
const uids = [];

for (const person of PEOPLE) {
  const user = await enter(person);
  uids[person.index] = user.uid;
  await setDoc(doc(db, "users", user.uid), {
    displayName: person.displayName, pronouns: person.pronouns, photoURL: null, role: "user",
    bio: person.bio, interests: person.interests, languages: person.languages, island: person.island,
    prefers: pick(["in_person", "both", "both"]), availability: person.availability, createdAt: serverTimestamp(),
  }, { merge: true });

  const mine = await getDocs(query(collection(db, "events"), where("organizerId", "==", user.uid)));
  await Promise.all(mine.docs.map((found) => deleteDoc(found.ref)));

  for (const [owner, category, title, description, extra] of ACTIVITIES) {
    if (owner !== person.index) continue;
    const online = !!extra.online;
    const [placeName, lat, lng] = pick(PLACES[person.island]);
    const startsAt = new Date(Date.now() + (extra.past ? -(2 + Math.floor(random() * 10)) : 1 + Math.floor(random() * 20)) * day);
    startsAt.setHours(pick([10, 11, 17, 18, 19]), pick([0, 30]), 0, 0);
    const hours = pick([1, 2, 2, 3]);

    const image = ref(storage, `events/${user.uid}/seed-${created.length}.svg`);
    await uploadBytes(image, new TextEncoder().encode(drawImage(category, created.length)), { contentType: "image/svg+xml" });

    const event = await addDoc(collection(db, "events"), {
      title, description, category, imageUrl: await getDownloadURL(image), official: false,
      organizerId: user.uid, organizerName: person.displayName,
      mode: online ? "online" : "in_person",
      // A little jitter so pins in the same square do not sit exactly on top of each other.
      location: online ? null : { lat: lat + (random() - 0.5) * 0.01, lng: lng + (random() - 0.5) * 0.01 },
      placeName: online ? "" : placeName, island: online ? null : person.island,
      onlineUrl: online ? "https://meet.example.com/fleje-" + created.length : null,
      onlinePlatform: online ? PLATFORM_IDS[created.length % PLATFORM_IDS.length] : null,
      startsAt: Timestamp.fromDate(startsAt), endsAt: Timestamp.fromDate(new Date(startsAt.getTime() + hours * 60 * 60 * 1000)),
      capacity: extra.capacity ?? null, inclusion: extra.inclusion ?? [],
      attendeeIds: [user.uid], attendeeLanguages: { [user.uid]: person.languages },
      embedding: null, createdAt: serverTimestamp(),
    });
    created.push({ id: event.id, owner: person.index, past: !!extra.past, capacity: extra.capacity ?? null, attendees: new Set([person.index]) });
  }
  console.log(`· ${person.displayName}: ${created.filter((item) => item.owner === person.index).length} actividades`);
}

// Everyone joins activities that fit their interests, plus a couple at random.
let joins = 0;
for (const person of PEOPLE) {
  await enter(person);
  const fitting = created.filter((item, i) => item.owner !== person.index && person.interests.includes(ACTIVITIES[i][1]));
  const chosen = [...new Set([...some(fitting, 7), ...some(created.filter((item) => item.owner !== person.index), 5)])];
  for (const activity of chosen) {
    if (activity.capacity && activity.attendees.size >= activity.capacity) continue;
    await updateDoc(doc(db, "events", activity.id), {
      attendeeIds: arrayUnion(uids[person.index]),
      [`attendeeLanguages.${uids[person.index]}`]: person.languages,
    });
    activity.attendees.add(person.index);
    joins += 1;
  }
}

// Chats in the busiest activities, and reviews of the ones that already happened.
let messages = 0;
let reviews = 0;
const busiest = [...created].filter((item) => !item.past).sort((a, b) => b.attendees.size - a.attendees.size).slice(0, 25);
for (const person of PEOPLE) {
  const user = await enter(person);
  for (const activity of created) {
    if (!activity.attendees.has(person.index)) continue;
    const lines = busiest.includes(activity) ? Math.floor(random() * 3) + (random() < 0.8 ? 1 : 0) : 0;
    for (let line = 0; line < lines; line += 1) {
      await addDoc(collection(db, "events", activity.id, "messages"), {
        uid: user.uid, name: person.displayName, pronouns: person.pronouns, text: pick(CHAT), createdAt: serverTimestamp(),
      });
      messages += 1;
    }
    if (activity.past && activity.owner !== person.index && random() < 0.9) {
      const [rating, text] = pick(REVIEWS);
      await setDoc(doc(db, "events", activity.id, "reviews", user.uid), {
        uid: user.uid, name: person.displayName, rating, text, createdAt: serverTimestamp(),
      });
      reviews += 1;
    }
  }
}

console.log(`Listo: ${PEOPLE.length} personas, ${created.length} actividades con imagen, ${joins} apuntadas, ${messages} mensajes y ${reviews} reseñas.`);
process.exit(0);
