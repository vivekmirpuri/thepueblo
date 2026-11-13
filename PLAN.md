# flejethepueblo — plan de implementación

Producto: [CONTEXT.md](CONTEXT.md) (funcionalidades F1–F16). Diseño: [ARCHITECTURE.md](ARCHITECTURE.md).

## Fase 0 — Base

Todo lo que de otro modo pisaríamos entre varias personas se prepara una sola vez.

**Hecho**
- [x] Base de datos Firestore creada (Madrid) y acceso con correo y contraseña activado.
- [x] `firestore.rules` desplegado y probado (`node scripts/rules-check.mjs`).
- [x] shadcn/ui, `motion`, `maplibre-gl`, `react-map-gl` y `@huggingface/transformers` instalados.
- [x] `src/lib/`: `types.ts`, `categories.ts`, `languages.ts`, `islands.ts`, `geo.ts`, `firebase.ts`; `joinEvent` / `leaveEvent` / `uploadEventImage` en `db.ts`.
- [x] `AppShell`, `BottomNav`, `LanguageFlags`, `InclusionBadges`, `PersonName`.
- [x] Interfaz en español (`<html lang="es">`, categorías, navegación, iconos de inclusión).
- [x] Una página provisional por ruta y un componente provisional por bloque, cada uno con un comentario inicial que dice qué construir.

**Responsable del proyecto, en la consola de Firebase**
- [x] Plan Blaze, bucket de Storage creado y reglas desplegadas (18 comprobaciones en verde).
- [ ] Poner una alerta de presupuesto en la cuenta de facturación.

**Pendiente antes de repartir los bloques (una persona)**
- [ ] **Prueba de IA primero** (30 min, la mayor incógnita): cargar Transformers.js en un Web Worker con Next 16 y calcular el embedding de una frase. Si el modelo de chat no funciona, quedarse solo con los embeddings.
- [x] `src/lib/auth.tsx` (`AuthProvider` / `useUser`) y `/login/` (entrar y crear cuenta con correo).
- [x] Alta (`/onboarding/`) en 7 pasos cortos, y perfil (`/profile/`) en una sola página para editar.
- [x] `EventCard` con imagen, icono de categoría, banderas e iconos de inclusión.
- [x] `getProfile` y `saveProfile` en `src/lib/db.ts`.
- [x] Funciones de eventos en `db.ts`: `listUpcomingEvents`, `getEvent`, `createEvent`.
- [x] `scripts/seed.mjs`: 3 personas y 12 actividades de ejemplo.
- [ ] Opcional, en la consola de Firebase: acceso con Google; añadir los dominios de vista previa en Authentication → Settings → Authorized domains si el acceso falla en una URL de vista previa.

**Contratos entre bloques** (se acuerdan una vez; no se cambian sin avisar)

```ts
// src/lib/ai — del Bloque C, lo usan el Bloque B (crear evento) y el Bloque A (búsqueda)
findSimilarEvents(text: string, events: Meetup[], limit?: number): Promise<ScoredEvent[]>
searchEvents(query: string, events: Meetup[], limit?: number): Promise<ScoredEvent[]>
recommendEvents(profile: UserProfile, events: Meetup[], limit?: number): Promise<ScoredEvent[]>

// src/components/shared — los usan todos
<EventCard event={event} distanceKm={number | undefined} />
<LanguageFlags languages={event.attendeeLanguages} />

// src/lib/db.ts
listUpcomingEvents(): Promise<Meetup[]>
joinEvent(eventId, me) / leaveEvent(eventId, uid)   // hechas
```

## Fase 1 — Tres bloques en paralelo

Cada bloque agrupa tareas que tocan carpetas distintas (ver ARCHITECTURE → Rutas y carpetas), para que se puedan hacer a la vez sin conflictos.

### Bloque A — Descubrir
| # | Tarea | Funcionalidad |
|---|---|---|
| ~~A1~~ | ~~Mapa con pines por categoría y tarjeta al pulsar~~ **hecho** | F4 |
| ~~A2~~ | ~~Botones de categoría que filtran mapa y lista~~ **hecho** | F5 |
| ~~A3~~ | ~~Lista de actividades bajo el mapa~~ **hecho** | F7 |
| ~~A4~~ | ~~Ubicación y orden por cercanía / fecha / más gente~~ **hecho** | F6 |
| ~~A5~~ | ~~Filtros: oficiales, en línea, idiomas, accesibilidad~~ **hecho** | F6, F13, F17 |

### Bloque B — Eventos y chat
| # | Tarea | Funcionalidad |
|---|---|---|
| ~~B1~~ | ~~Formulario de crear actividad: lugar en el mapa y foto~~ **hecho** | F8 |
| ~~B2~~ | ~~Detalle: información, unirse / salir~~ **hecho** | F10 |
| ~~B3~~ | ~~Banderas de idiomas en detalle y tarjetas~~ **hecho** | F11 |
| B4 | Chat de grupo por evento + lista "mis chats" | F14 |
| B5 | Mostrar eventos parecidos en el formulario (llama a `findSimilarEvents`) | F9 |
| B6 | Reseñas: estrellas + comentario, media en el evento | F12 |
| B7 | Insignia oficial; las instituciones publican eventos oficiales | F13 |
| ~~B8~~ | ~~Iconos de inclusión en formulario, tarjeta y detalle~~ **hecho** | F17 |

### Bloque C — Personas e IA
| # | Tarea | Funcionalidad |
|---|---|---|
| ~~C1~~ | ~~Alta: pronombres, intereses, idiomas, isla, preguntas, institución~~ **hecho** | F2, F3, F18 |
| ~~C2~~ | ~~Página de perfil (ver y editar)~~ **hecho** | F2 |
| C3 | Worker de IA: modelo de embeddings, `embed`, `findSimilarEvents` | F9 |
| ~~C4~~ | ~~xatsí: búsqueda libre → tarjetas (por palabras; el modelo reordenará después)~~ **hecho** | F16 |
| ~~C5~~ | ~~xatsí: "Sugiéreme algo" a partir del perfil~~ **hecho** | F16 |
| C6 | Redacción con el modelo de chat en dispositivos capaces; frase fija en el resto | F16 |
| C7 | Gente como tú | F15 |

**El orden dentro de cada bloque es el de prioridad.** A1–A3, B1–B4 y C1–C4 son la demo; el resto es profundidad.

## Fase 2 — Integrar y ensayar

- [ ] Fusionar todo en `develop` y probar en el entorno de pruebas con un móvil real y un portátil.
- [x] Datos de ejemplo cargados (3 personas con idiomas distintos, 12 actividades).
- [ ] Abrir el asistente una vez en el portátil de la demo antes de empezar, para que los modelos ya estén en caché.
- [ ] Pasar `develop` a `main`: `git push origin develop:main`.
- [ ] Ensayar dos veces la demo de abajo.

## Guion de la demo (≈3 minutos)

1. Acceder → alta: elegir intereses e idiomas.
2. Mapa de las islas → pulsar el botón **Intercambio de idiomas** → los pines se filtran.
3. Ordenar por **cercanía**.
4. Crear un evento → la app avisa "hay uno parecido a 2 km" → abrir ese en su lugar.
5. Unirse → la fila de banderas gana tus idiomas; el evento muestra sus iconos de accesibilidad y en el chat aparecen los pronombres.
6. Un segundo dispositivo se une al mismo evento → los mensajes aparecen en directo en el chat de grupo.
7. Asistente: "algo al aire libre este fin de semana, en inglés" → tarjetas + una respuesta corta, con el portátil sin conexión para demostrar que es local.
8. Un evento oficial de una institución, con su insignia.
9. Gente como tú.

## Si falta tiempo, recortar en este orden

1. C7 con embeddings de perfiles (basta la puntuación simple)
2. B6 reseñas
3. C6 redacción con el modelo de chat (mantener la búsqueda por significado: es lo que impresiona)
4. A5 filtros extra
5. B7 publicación de instituciones (en su lugar, crear dos eventos oficiales con el script de datos)

## Cómo trabajamos

Ramas, despliegues y archivos compartidos: [README.md](README.md).
