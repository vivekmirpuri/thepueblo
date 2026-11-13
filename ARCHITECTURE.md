# flejethepueblo — arquitectura

Qué construimos: [CONTEXT.md](CONTEXT.md). Tareas y orden: [PLAN.md](PLAN.md).

## Visión general

```
 Navegador (móvil / tableta / portátil)
 ┌───────────────────────────────────────────────────────────┐
 │ App estática de Next.js (React)                           │
 │  ├─ Interfaz: shadcn/ui + Tailwind                        │
 │  ├─ Mapa: MapLibre + teselas de OpenFreeMap               │
 │  └─ IA local (Web Worker): Transformers.js                │
 │       ├─ modelo de embeddings → eventos parecidos, búsqueda│
 │       └─ modelo de chat pequeño → redacción (opcional)    │
 └──────────────┬────────────────────────────────────────────┘
                │ SDK web de Firebase (sin servidor propio)
 ┌──────────────▼────────────────────────────────────────────┐
 │ Proyecto Firebase thepueblo-6f94e (plan de pago por uso)  │
 │  Auth (correo + contraseña) · Firestore (datos + chat)    │
 │  Storage (imágenes de eventos)                            │
 │  Hosting (archivos estáticos, CDN)                        │
 └───────────────────────────────────────────────────────────┘
```

**No hay código de servidor.** La app son archivos estáticos; todo acceso a datos va del navegador a Firestore y lo protegen las reglas de seguridad. La IA se ejecuta en el dispositivo del usuario.

## Stack y paquetes

Versiones comprobadas en npm el 12-11-2026. Todas son compatibles con React 19.

| Necesidad | Elección | Por qué |
|---|---|---|
| Framework | **Next.js 16** (instalado), exportación estática | Ya desplegado; hosting gratuito |
| Estilos | **Tailwind 4** (instalado) | — |
| Componentes de interfaz | **[shadcn/ui](https://ui.shadcn.com/docs/components)**, preset `base-nova` (sobre **Base UI**) | Es el valor por defecto actual de shadcn. Los componentes se copian en `src/components/ui/`, así que el código es nuestro y el aspecto sigue siendo minimalista. Instalados: button, input, textarea, label, field, card, badge, dialog, sheet, drawer, tabs, avatar, select, toggle, toggle-group, separator, skeleton, sonner. Añade más con `npx shadcn@latest add <nombre>` |
| Iconos | **lucide-react** | Viene con shadcn |
| Animación | **motion** (`import { motion } from "motion/react"`) | La librería de animación estándar de React (antes Framer Motion). Solo para toques pequeños: elementos de lista que aparecen, transiciones de paneles y tarjetas |
| Avisos (toasts) | **sonner** | A través del componente `sonner` de shadcn |
| Panel inferior en móvil | **drawer** de shadcn | Da la sensación de "app" al previsualizar eventos en el móvil |
| Tipografía | **Atkinson Hyperlegible Next** con `next/font` para todo el texto; **Geist** solo en el logo | Atkinson está diseñada para que las letras no se confundan (baja visión, dislexia) |
| Color principal | Naranja de la marca: `oklch(0.553 0.195 38.4)` en claro, `oklch(0.75 0.183 55.9)` en oscuro | Mismo naranja que el logo, con contraste ≥ 4,5:1 frente a su texto |
| Mapa | **maplibre-gl** + **react-map-gl** (`react-map-gl/maplibre`) | Código abierto, fluido en móviles |
| Teselas del mapa | **OpenFreeMap** — estilo `https://tiles.openfreemap.org/styles/liberty` | Gratis, sin clave de API ni registro |

**El worker del mapa.** MapLibre arranca un Web Worker y deduce su dirección de su propio `import.meta.url`; en cuanto el bundler mete la librería en un chunk, esa dirección no existe y el mapa se queda sin teselas. Por eso `scripts/copy-map-worker.mjs` copia `maplibre-gl-worker.mjs` a `public/` antes de `dev` y de `build` (scripts `predev` y `prebuild`), y `EventMap.tsx` llama a `setWorkerUrl("/maplibre-gl-worker.mjs")`. El archivo copiado está en `.gitignore`: se regenera en cada arranque, así nunca se queda desfasado.

| Auth, base de datos, chat, imágenes | **firebase** (instalado) | `onSnapshot` de Firestore da chat en tiempo real sin otra librería; Cloud Storage guarda las imágenes de los eventos |
| IA local | **@huggingface/transformers** (Transformers.js 4) | Una sola librería para el modelo de embeddings y el de chat; usa WebGPU si existe y WASM si no |
| Formularios | `field` de shadcn + estado de React | Los formularios son pequeños; añade react-hook-form + zod solo si alguno crece |
| Fechas | `Intl.DateTimeFormat` | Viene con el navegador |
| Iconos de categoría | **lucide-react**, uno por categoría en `src/lib/categories.ts` | Se ven en las burbujas de intereses y en cada actividad |
| Iconos de inclusión | **lucide-react** (Accessibility, Hand, EyeOff, Captions, Speech, VenusAndMars) | SVG pequeños que ya vienen instalados; lista en `src/lib/inclusion.ts` |
| Banderas | Emojis de bandera desde una tabla idioma → bandera | Sin paquete. *Límite: Windows muestra letras en vez de banderas; cambia a `flag-icons` si eso importa en la demo* |

**Reglas de aspecto**
- Construye las pantallas primero con `src/components/ui/`; escribe un componente nuevo solo cuando ninguno encaje.
- Los colores salen de los tokens del tema en `globals.css` (`bg-background`, `text-muted-foreground`, `border`, `bg-primary`…). Nada de colores hexadecimales en los componentes.
- Un solo color de acento, mucho espacio en blanco, tarjetas redondeadas, como mucho dos tamaños de texto por pantalla.
- Base UI no es Radix: no existe `asChild`; se compone con la prop `render`.
- Para un elemento de lucimiento (portada, estados vacíos) puedes copiar un único componente de **Magic UI**, **Aceternity UI** o **React Bits**, que también se copian y pegan como shadcn. No instales otro kit de interfaz completo (MUI, Chakra, Mantine, HeroUI): dos kits nunca parecen una sola app.

Se evita **a propósito**: una librería de estado (bastan el estado de React y los listeners de Firestore), un kit de interfaz de chat, una librería de consultas geográficas.

## Idioma

La interfaz está **en español**: todo lo que lee una persona (etiquetas, botones, errores, `aria-label`, textos alternativos) se escribe en español y con lectura fácil. El código, los comentarios y los identificadores (ids de categoría, nombres de variables) están en inglés. `<html lang="es">` está puesto en `layout.tsx`, y las fechas se formatean con `Intl.DateTimeFormat("es-ES", …)`.

No usamos librería de traducción: la app está en un solo idioma. El contenido que escriben las personas (títulos de eventos, mensajes) va en el idioma que cada cual quiera.

## Patrón de código: contenedores y componentes de presentación

- **Las páginas son contenedores.** Un archivo `src/app/**/page.tsx` carga los datos (a través de `src/lib/db.ts`), guarda el estado y pasa props simples hacia abajo.
- **Los componentes son de presentación.** Los archivos de `src/components/` reciben props y pintan. Nunca llaman a Firestore.
- **`src/lib/` es el único sitio que habla con Firebase o con el modelo.**

Cada archivo provisional (marcado PLACEHOLDER) empieza con un comentario que dice qué es, a qué bloque y funcionalidad pertenece y cómo construirlo con las librerías de arriba. Esos comentarios están en inglés, como el resto del código.

## Reglas que impone la exportación estática

- Sin rutas de API, sin server actions, sin `cookies()` / `headers()`.
- **Sin segmentos de ruta dinámicos** (`/event/[id]` no se puede exportar para identificadores desconocidos al compilar). Usa un parámetro de consulta: `/event/?id=abc`, leído con `useSearchParams()` dentro de un `<Suspense>`.
- Todo lo que toque Firebase, el mapa, la ubicación o la IA es un componente `"use client"`. Carga el mapa y la IA de forma diferida (`next/dynamic` con `ssr: false`, o `import()` dentro de un efecto): necesitan `window`.
- Esto es Next.js 16: lee `node_modules/next/dist/docs/` antes de usar una API de memoria (ver [AGENTS.md](AGENTS.md)).

## Rutas y carpetas

| Ruta | Pantalla | Bloque |
|---|---|---|
| `/` | Mapa + botones de categoría + lista de eventos | A |
| `/event/?id=` | Detalle del evento: unirse, banderas, reseñas | B |
| `/event/new/` | Crear evento (+ sugerencias de eventos parecidos) | B |
| `/chats/` y `/chats/?event=` | Mis chats de grupo / un chat | B |
| `/onboarding/` | Intereses, idiomas, isla, preguntas | C |
| `/profile/` | Mi perfil | C |
| `/people/` | Gente como tú | C |
| `/assistant/` | Chatbot | C |
| `/login/` | Acceso | Base |

```
src/
  app/                    una carpeta por ruta de la tabla
  components/
    ui/                   componentes de shadcn            (compartido)
    shared/               AppShell, BottomNav, Logo, Bubble, RequireUser, EventCard,
                          LanguageFlags, InclusionBadges, PersonName (hechos) · EventCard, Placeholder  (compartido)
    map/  discover/       Bloque A
    event/  chat/         Bloque B
    people/  assistant/   Bloque C
  lib/
    firebase.ts           app de Firebase, auth, db, storage    (compartido, hecho)
    firebase.config.json  configuración web pública, la leen también los scripts
    types.ts              UserProfile, Meetup, ChatMessage, Review  (compartido, hecho)
    db.ts                 funciones de Firestore y Storage      (compartido; perfil, unirse/salir y subir imagen hechas)
    auth.tsx              AuthProvider + useUser()              (compartido, hecho)
    categories.ts  languages.ts  islands.ts  geo.ts  inclusion.ts  profile.ts  (compartido, hechos)
    todo.ts               marca las funciones que aún no existen
    ai/                   Bloque C  (config.ts hecho; index.ts es el contrato y aún no devuelve nada)
scripts/rules-check.mjs   prueba las reglas de seguridad desplegadas (hecho)
scripts/seed.mjs          3 personas y 12 actividades de ejemplo (hecho)
scripts/copy-map-worker.mjs  copia el worker de MapLibre a public/ (predev y prebuild)
firestore.rules           reglas de seguridad de la base de datos, se despliegan A MANO (ver Hosting)
storage.rules             reglas de subida de imágenes, se despliegan A MANO
```

Los archivos "compartidos" los usan todos los bloques: cámbialos con commits pequeños y avisa antes.

## Modelo de datos (Firestore)

```
users/{uid}
  displayName, photoURL
  pronouns: string | null        // opcional, texto libre ("she/her")
  role: "user" | "institution"
  verified: boolean              // solo instituciones; se marca a mano en la consola
  bio: string
  interests: string[]            // ids de categoría
  languages: string[]            // códigos ISO 639-1: "es", "en", "ar", "wo"…
  island: string                 // nunca una ubicación exacta
  prefers: "in_person" | "online" | "both"
  availability: string[]         // "weekday_evenings", "weekends"…
  createdAt

events/{eventId}                 // tipo `Meetup` en el código (`Event` ya existe en el navegador)
  title, description
  category: string
  inclusion: string[]            // ids de src/lib/inclusion.ts: "wheelchair", "sign_language"…
  imageUrl: string | null        // enlace de descarga de la portada en Cloud Storage
  official: boolean              // true solo si quien organiza es una institución verificada
  organizerId, organizerName
  mode: "in_person" | "online"
  location: { lat, lng } | null  // null si es en línea
  placeName, island
  onlineUrl: string | null
  startsAt, endsAt               // endsAt es obligatorio (por defecto: inicio + 2 h)
  capacity: number | null
  attendeeIds: string[]
  attendeeLanguages: { uid: ["es", "en"] } // alimenta las banderas; se cuenta en el navegador
  ratingSum, ratingCount         // media = suma / número
  embedding: number[] | null     // 384 números del modelo de embeddings
  createdAt

events/{eventId}/messages/{messageId}     // chat de grupo
  uid, name, pronouns, text, createdAt

events/{eventId}/reviews/{uid}            // una reseña por asistente
  rating: 1..5, text, name, createdAt
```

Unirse y salir son **una sola actualización atómica** cada una (`arrayUnion` / `arrayRemove` más una clave del mapa), así que no hace falta transacción ni hay contadores que se desajusten. Una reseña actualiza a la vez el documento de la reseña y los totales de valoración, así que esa sí usa una transacción.

**Consultas.** La pantalla de inicio carga una vez todos los eventos que no han terminado (`endsAt >= ahora`, ordenados por `endsAt`) y filtra, ordena y calcula distancias en el navegador. "Mis chats" es `where("attendeeIds", "array-contains", uid)`.
*Atajo: vale para unos cientos de eventos (cada uno lleva ~4 KB de embedding). Más allá, añade consultas por geohash con `geofire-common` y saca los embeddings del documento del evento.*

## Reglas de seguridad (resumen)

Están en `firestore.rules`, desplegadas y cubiertas por `node scripts/rules-check.mjs`.

- **users**: cualquier usuario con sesión puede leer; solo puedes escribir tu propio documento; no puedes marcarte `verified`.
- **events**: lectura pública. Con sesión puedes crear con `organizerId == tu uid`; `official: true` solo se permite si tu documento de usuario tiene `verified == true`. Solo quien organiza edita o borra. Cualquier usuario con sesión puede actualizar **solo** `attendeeIds` y `attendeeLanguages` (para unirse o salir), solo añadiéndose o quitándose a sí mismo y nunca por encima de `capacity`.
- **messages**: leer y crear solo si tu uid está en `attendeeIds` del evento; puedes borrar los tuyos.
- **reviews**: lectura pública; crear solo en tu nombre y solo si eres asistente.
- **Storage** (`storage.rules`): las imágenes de eventos van en `events/{uid}/{archivo}`. Lectura pública; solo puedes escribir en tu propia carpeta, solo imágenes y de menos de 5 MB.

## IA local

Todo vive en `src/lib/ai/` y se ejecuta en un único Web Worker para que la interfaz nunca se congele. Los modelos se descargan la primera vez y luego el navegador los guarda en caché.

| Tarea | Modelo | Descarga | Funciona en |
|---|---|---|---|
| Embeddings | `Xenova/multilingual-e5-small` (cuantizado, 384 dims, ~100 idiomas) | 118 MB | Cualquier dispositivo (WASM) |
| Chat, por defecto | `onnx-community/LFM2-350M-ONNX` (`q4f16`) | 255 MB | Dispositivos con WebGPU |
| Chat, portátil de la demo | `onnx-community/gemma-3-1b-it-ONNX-GQA` (`q4f16`) | 763 MB | Portátil con WebGPU |

El modelo de chat es una constante en `src/lib/ai/config.ts`; alternativas de tamaño parecido: `onnx-community/gemma-3-270m-it-ONNX` (273 MB) y `onnx-community/Qwen3-0.6B-ONNX` (570 MB).

**Cómo lo usa cada funcionalidad**

- **Aviso de eventos parecidos (F9).** Primero una sugerencia instantánea (misma categoría, mismo día, a menos de 5 km: sin modelo ni descarga). Cuando el modelo ha cargado: calcula el embedding de `título + descripción`, compáralo por similitud de coseno con el `embedding` de cada evento próximo cargado y muestra los 3 mejores por encima de un umbral. El embedding se guarda en el evento nuevo al publicarlo.
- **xatsí (F16).** Hoy busca **por palabras** (sin modelo ni descarga: responde al instante en cualquier móvil; ignora tildes y mayúsculas). El modelo de embeddings, cuando se conecte, reordenará esos mismos resultados por significado. Primero buscar, después redactar:
  1. Construir la consulta: el texto del usuario o, para "Sugiéreme algo", una frase hecha a partir de su perfil.
  2. Calcular su embedding y tomar los eventos más cercanos (prefiltrados por isla, fecha e idiomas).
  3. Mostrar esos eventos como tarjetas. **Este paso por sí solo ya responde.**
  4. Si el dispositivo puede ejecutar el modelo de chat, este escribe dos o tres frases amables sobre esos eventos en el idioma del usuario. Si no puede (sin WebGPU, poca memoria, aún descargando), se muestra una frase fija.

  Las tarjetas siempre salen de datos reales, así que un modelo pequeño que redacte mal nunca puede inventarse un evento.
- **Gente como tú (F15).** Sin modelo: puntuación = intereses en común + idiomas en común (+ misma isla), ordenada. Añade embeddings de la bio más adelante solo si la puntuación simple se queda corta.

Nota para los modelos e5: antepón `query: ` (búsquedas) o `passage: ` (eventos guardados) al texto antes de calcular el embedding.

**Sin verificar todavía:** que Transformers.js 4 se empaquete bien con Next 16 + Turbopack, y la velocidad y calidad reales de los modelos de chat en un móvil. Es lo primero que hay que probar en la fase base; el diseño de arriba sigue funcionando aunque se quite del todo el modelo de chat.

## Mapa y ubicación

- La vista inicial encuadra el archipiélago: límites `[[-18.3, 27.5], [-13.2, 29.5]]`.
- Un marcador por evento presencial, con color según la categoría; al pulsarlo se abre una tarjeta pequeña con enlace al evento.
- Los eventos en línea no tienen pin; aparecen en la lista con la insignia "En línea".
- La ubicación del dispositivo viene de la API de geolocalización del navegador y solo se guarda en memoria. Si se deniega el permiso, la distancia se mide desde el centro de la isla del usuario.
- Elegir el lugar al crear un evento = pulsar en el mapa. Sin búsqueda de direcciones (necesitaría un servicio de geocodificación).

## Hosting, ramas y despliegues

| Rama | Para qué | Se despliega en |
|---|---|---|
| `main` | Lo que ve el jurado. Solo recibe fusiones desde `develop`. | **Producción** — https://thepueblo-6f94e.web.app |
| `develop` | Integración: aquí se junta el trabajo de todos. Rama por defecto. | **Pruebas** — https://thepueblo-6f94e--develop-1ttzfnbg.web.app |
| Cualquier rama con pull request (opcional) | Para revisar algo antes de subirlo. | Una URL de vista previa temporal por pull request |

Un único workflow, [.github/workflows/deploy.yml](.github/workflows/deploy.yml), ejecuta lint + build y luego despliega. No hay protección de ramas: se hace push directo a `develop`, y `develop` pasa a `main` con `git push origin develop:main`. Un push con la compilación rota no se despliega, pero tampoco se bloquea. La clave de la cuenta de servicio es el secreto de GitHub `FIREBASE_SERVICE_ACCOUNT`; nunca está en el repositorio. Bórrala en la consola de Firebase después del hackathon.

**Imágenes.** El formulario de crear evento sube el archivo con `uploadEventImage(uid, file)` (`src/lib/db.ts`), que lo guarda en `events/{uid}/…` y devuelve un enlace de descarga; ese enlace se guarda en el evento como `imageUrl`. El bucket está en `US-EAST1` (ubicación sin coste del plan Blaze); Firestore sigue en Madrid.

**El CI no despliega las reglas de seguridad.** Producción, pruebas y vistas previas comparten una misma base de datos, así que un cambio de reglas llega a todos a la vez. La persona responsable del proyecto las despliega a mano y comprueba:

```bash
firebase deploy --only firestore,storage && node scripts/rules-check.mjs
```

Las reglas nuevas pueden tardar unos minutos en estar activas en todas partes; si la comprobación falla justo después de desplegar, espera y vuelve a ejecutarla.

Firestore: la base de datos `(default)` está en **`europe-southwest1` (Madrid)**, la región más cercana a las islas.
