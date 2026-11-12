# The Pueblo — architecture

What we are building: [CONTEXT.md](CONTEXT.md). Who builds what: [PLAN.md](PLAN.md).

## Overview

```
 Browser (phone / tablet / laptop)
 ┌───────────────────────────────────────────────────────────┐
 │ Next.js static app (React)                                │
 │  ├─ UI: shadcn/ui + Tailwind                              │
 │  ├─ Map: MapLibre + OpenFreeMap tiles                     │
 │  └─ Local AI (Web Worker): Transformers.js                │
 │       ├─ embedding model  → similar events, search        │
 │       └─ small chat model → assistant wording (optional)  │
 └──────────────┬────────────────────────────────────────────┘
                │ Firebase web SDK (no server of our own)
 ┌──────────────▼────────────────────────────────────────────┐
 │ Firebase project thepueblo-6f94e                          │
 │  Auth (Google) · Firestore (data + realtime chat)         │
 │  Hosting (static files, CDN)                              │
 └───────────────────────────────────────────────────────────┘
```

There is **no backend code**. The app is static files; all data access goes from the browser to Firestore and is guarded by security rules. The AI runs on the user's device.

## Stack and packages

Versions checked on npm on 2026-11-12. All support React 19.

| Need | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (already installed), static export | Already deployed; free hosting |
| Styling | **Tailwind 4** (already installed) | — |
| UI components | **shadcn/ui** (`npx shadcn@latest add …`) | Components are copied into `src/components/ui/`, so no heavy dependency and the look stays minimal. Use: button, input, textarea, card, badge, dialog, sheet, tabs, avatar, select, toggle-group, form, sonner, skeleton |
| Icons | **lucide-react** | Comes with shadcn |
| Map | **maplibre-gl** + **react-map-gl** (`react-map-gl/maplibre`) | Open source, smooth on phones |
| Map tiles | **OpenFreeMap** — style `https://tiles.openfreemap.org/styles/liberty` | Free, no API key, no signup |
| Auth, database, chat | **firebase** (already installed) | Firestore `onSnapshot` gives realtime chat with no extra library |
| Local AI | **@huggingface/transformers** (Transformers.js 4) | One library for both the embedding model and the chat model; WebGPU when available, WASM otherwise |
| Forms / validation | shadcn `form` (react-hook-form + zod) | Comes with shadcn |
| Dates | `Intl.DateTimeFormat` | Built into the browser |
| Flags | Emoji flags from a language → flag table | No package. *Limit: Windows shows letters instead of flags; swap to `flag-icons` if that matters for the demo* |

Deliberately **not** used: a state library (React state + Firestore listeners are enough), a chat UI kit, a geo-query library, Firebase Storage (needs the paid plan on new projects — so no image uploads; avatars come from the Google account).

## Rules that come from the static export

- No API routes, no server actions, no `cookies()` / `headers()`.
- **No dynamic route segments** (`/event/[id]` cannot be exported for IDs unknown at build time). Use a query parameter: `/event/?id=abc`, read with `useSearchParams()` inside a `<Suspense>`.
- Anything touching Firebase, the map, location or the AI is a `"use client"` component. Load the map and the AI lazily (`next/dynamic` with `ssr: false`, or `import()` inside an effect) — they need `window`.
- This is Next.js 16: read `node_modules/next/dist/docs/` before using an API from memory (see [AGENTS.md](AGENTS.md)).

## Routes and folders

| Route | Screen | Track |
|---|---|---|
| `/` | Map + category chips + event list | A |
| `/event/?id=` | Event detail: join, flags, reviews | B |
| `/event/new/` | Create event (+ similar-event suggestions) | B |
| `/chats/` and `/chats/?event=` | My group chats / one chat | B |
| `/onboarding/` | Interests, languages, island, questions | C |
| `/profile/` | My profile | C |
| `/people/` | People like you | C |
| `/assistant/` | Chatbot | C |
| `/login/` | Sign in | Foundation |

```
src/
  app/                    one folder per route above
  components/
    ui/                   shadcn components        (shared — add via PR to develop)
    shared/               AppShell, BottomNav, EventCard, LanguageFlags  (shared)
    map/  discover/       Track A
    event/  chat/         Track B
    people/  assistant/   Track C
  lib/
    firebase.ts           Firebase app, auth, db                (shared)
    types.ts              User, Event, Message, Review types    (shared)
    db.ts                 Firestore read/write helpers          (shared)
    auth.tsx              AuthProvider + useUser()              (shared)
    categories.ts  languages.ts  islands.ts  geo.ts             (shared)
    ai/                   Track C  (worker, embed, similar, chat)
scripts/seed.mjs          sample events for the demo
firestore.rules           security rules, deployed by CI
```

"Shared" files are built once in the foundation phase and afterwards change only through small, announced PRs.

## Data model (Firestore)

```
users/{uid}
  displayName, photoURL
  role: "user" | "institution"
  verified: boolean              // institutions only; set by hand in the console
  bio: string
  interests: string[]            // category ids
  languages: string[]            // ISO 639-1 codes: "es", "en", "ar", "wo"…
  island: string                 // never an exact location
  prefers: "in_person" | "online" | "both"
  availability: string[]         // "weekday_evenings", "weekends"…
  createdAt

events/{eventId}
  title, description
  category: string
  official: boolean              // true only if the organiser is a verified institution
  organizerId, organizerName
  mode: "in_person" | "online"
  location: { lat, lng } | null  // null for online
  placeName, island
  onlineUrl: string | null
  startsAt, endsAt
  capacity: number | null
  attendeeIds: string[]
  languageCounts: { es: 4, en: 2 } // drives the flags; updated on join/leave
  ratingSum, ratingCount         // average = sum / count
  embedding: number[]            // 384 numbers from the embedding model
  createdAt

events/{eventId}/messages/{messageId}     // group chat
  uid, name, text, createdAt

events/{eventId}/reviews/{uid}            // one review per attendee
  rating: 1..5, text, name, createdAt
```

Join, leave and review each update two things at once (for example `attendeeIds` and `languageCounts`), so they run in a Firestore **transaction**.

**Queries.** The home screen loads all upcoming events (`startsAt >= now`, ordered by `startsAt`) once and filters, sorts and measures distance in the browser. "My chats" is `where("attendeeIds", "array-contains", uid)`.
*Shortcut: fine up to a few thousand events. Beyond that, add geohash queries with `geofire-common`.*

## Security rules (outline)

Written for real in `firestore.rules` during the foundation phase.

- **users**: any signed-in user can read; you can write only your own document; you cannot set `verified` yourself.
- **events**: anyone can read. Signed-in users can create with `organizerId == their uid`; `official: true` is allowed only when the creator's user document has `verified == true`. Only the organiser can edit or delete. Any signed-in user may update **only** `attendeeIds` and `languageCounts` (to join or leave), and only by adding or removing themselves.
- **messages**: read and create only if your uid is in the event's `attendeeIds`.
- **reviews**: anyone can read; create only as yourself, only if you are an attendee.

## Local AI

Everything lives in `src/lib/ai/` and runs in one Web Worker so the interface never freezes. Models are downloaded on first use and then cached by the browser.

| Job | Model | Download | Runs on |
|---|---|---|---|
| Embeddings | `Xenova/multilingual-e5-small` (quantized, 384 dims, ~100 languages) | 118 MB | Any device (WASM) |
| Chat, default | `onnx-community/LFM2-350M-ONNX` (`q4f16`) | 255 MB | Devices with WebGPU |
| Chat, demo laptop | `onnx-community/gemma-3-1b-it-ONNX-GQA` (`q4f16`) | 763 MB | Laptop with WebGPU |

The chat model is one constant in `src/lib/ai/config.ts`; alternatives of similar size are `onnx-community/gemma-3-270m-it-ONNX` (273 MB) and `onnx-community/Qwen3-0.6B-ONNX` (570 MB).

**How each feature uses it**

- **Similar-event check (F9).** While the user fills the form, embed `title + description`, compare by cosine similarity with the `embedding` of every loaded upcoming event, show the top 3 above a threshold. The embedding is saved on the new event when it is posted.
- **Assistant (F16).** Retrieval first, wording second:
  1. Build the query — the user's text, or a sentence made from their profile for "Suggest for me".
  2. Embed it and take the closest events (pre-filtered by island, date, languages).
  3. Show those events as cards. **This step alone answers the question.**
  4. If the device can run the chat model, it writes two or three friendly sentences about those events in the user's language. If it can't (no WebGPU, low memory, still downloading), a fixed sentence is shown instead.

  The cards always come from real data, so a small model that words things badly can never invent an event.
- **People like you (F15).** No model: score = shared interests + shared languages (+ same island), sorted. Add bio embeddings later only if the simple score feels weak.

Note for e5 models: prefix texts with `query: ` (searches) or `passage: ` (stored events) before embedding.

**Not yet verified:** Transformers.js 4 bundling under Next 16 + Turbopack, and the real speed and answer quality of the chat models on a phone. This is the first thing to try in the foundation phase; the design above still works if the chat model is dropped entirely.

## Map and location

- Initial view fits the archipelago: bounds `[[-18.3, 27.5], [-13.2, 29.5]]`.
- One marker per in-person event, coloured by category; tapping opens a small card linking to the event.
- Online events have no pin; they appear in the list with an "Online" badge.
- Device location comes from the browser Geolocation API and stays in memory. If permission is refused, distance is measured from the centre of the user's island.
- Picking a place when creating an event = tapping the map. No address search (would need a geocoding service).

## Hosting, branches and deploys

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | What the judges see. Only receives merges from `develop`. | **Live** — https://thepueblo-6f94e.web.app |
| `develop` | Integration. Everyone's work meets here. Default branch. | **Staging** — https://thepueblo-6f94e--develop-1ttzfnbg.web.app |
| `<name>/<feature>` | One person, one feature. | A temporary preview URL per pull request |

One workflow, [.github/workflows/deploy.yml](.github/workflows/deploy.yml), runs lint + build and then deploys. Both `main` and `develop` require a pull request with a green build. The service-account key is the GitHub secret `FIREBASE_SERVICE_ACCOUNT`; it is never in the repo.

Firestore: create the database in **`europe-southwest1` (Madrid)**, the closest region to the islands. The region cannot be changed later.
