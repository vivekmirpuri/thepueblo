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
 │ Firebase project thepueblo-6f94e (pay-as-you-go plan)     │
 │  Auth (email + password) · Firestore (data + chat)        │
 │  Storage (event images)                                   │
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
| UI components | **[shadcn/ui](https://ui.shadcn.com/docs/components)**, preset `base-nova` (built on **Base UI**) | The current shadcn default. Components are copied into `src/components/ui/`, so we own the code and the look stays minimal. Installed: button, input, textarea, label, field, card, badge, dialog, sheet, drawer, tabs, avatar, select, toggle, toggle-group, separator, skeleton, sonner. Add more with `npx shadcn@latest add <name>` |
| Icons | **lucide-react** | Comes with shadcn |
| Animation | **motion** (`import { motion } from "motion/react"`) | The standard React animation library (formerly Framer Motion). Use it for small touches only: list items appearing, sheet and card transitions |
| Toasts | **sonner** | Via the shadcn `sonner` component |
| Mobile bottom sheet | shadcn **drawer** | Gives the "app" feel for event previews on phones |
| Font | **Geist** via `next/font` | Already wired in `layout.tsx` |
| Map | **maplibre-gl** + **react-map-gl** (`react-map-gl/maplibre`) | Open source, smooth on phones |
| Map tiles | **OpenFreeMap** — style `https://tiles.openfreemap.org/styles/liberty` | Free, no API key, no signup |
| Auth, database, chat, images | **firebase** (already installed) | Firestore `onSnapshot` gives realtime chat with no extra library; Cloud Storage holds event images |
| Local AI | **@huggingface/transformers** (Transformers.js 4) | One library for both the embedding model and the chat model; WebGPU when available, WASM otherwise |
| Forms | shadcn `field` + plain React state | Our forms are small; add react-hook-form + zod only if one grows |
| Dates | `Intl.DateTimeFormat` | Built into the browser |
| Flags | Emoji flags from a language → flag table | No package. *Limit: Windows shows letters instead of flags; swap to `flag-icons` if that matters for the demo* |

**Look and feel rules**
- Build screens from `src/components/ui/` first; write a new component only when none fits.
- Colours come from the theme tokens in `globals.css` (`bg-background`, `text-muted-foreground`, `border`, `bg-primary`…). No hex colours in components.
- One accent colour, generous white space, rounded cards, at most two text sizes per screen.
- Base UI is not Radix: there is no `asChild`; compose with the `render` prop.
- For a showpiece element (landing hero, empty states) you may copy a single component from **Magic UI**, **Aceternity UI** or **React Bits** — they are copy-paste like shadcn. Do not install another full UI kit (MUI, Chakra, Mantine, HeroUI): two kits never look like one app.

Deliberately **not** used: a state library (React state + Firestore listeners are enough), a chat UI kit, a geo-query library.

## Code pattern: containers and presentational components

- **Pages are containers.** A file in `src/app/**/page.tsx` loads data (through `src/lib/db.ts`), holds the state, and passes plain props down.
- **Components are presentational.** Files in `src/components/` receive props and draw. They never call Firestore.
- **`src/lib/` is the only place that talks to Firebase or to the model.**

Every placeholder file starts with a comment that says what it is, which track and feature it belongs to, and how to build it with the libraries above.

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
    shared/               AppShell, BottomNav, LanguageFlags (built) · EventCard, Placeholder  (shared)
    map/  discover/       Track A
    event/  chat/         Track B
    people/  assistant/   Track C
  lib/
    firebase.ts           Firebase app, auth, db, storage       (shared, built)
    firebase.config.json  public web config, also read by scripts
    types.ts              UserProfile, Meetup, ChatMessage, Review  (shared, built)
    db.ts                 Firestore + Storage helpers           (shared; join/leave/upload built, rest todo)
    auth.tsx              AuthProvider + useUser()              (shared, placeholder)
    categories.ts  languages.ts  islands.ts  geo.ts             (shared, built)
    todo.ts               marks functions that are not built yet
    ai/                   Track C  (config.ts built; index.ts is the contract, returns nothing yet)
scripts/rules-check.mjs   tests the deployed security rules (built)
scripts/seed.mjs          fake people and events for the demo (placeholder)
firestore.rules           database security rules, deployed BY HAND (see Hosting)
storage.rules             image upload rules, deployed BY HAND
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

events/{eventId}                 // type `Meetup` in code (`Event` is a browser built-in)
  title, description
  category: string
  imageUrl: string | null        // download link of the cover image in Cloud Storage
  official: boolean              // true only if the organiser is a verified institution
  organizerId, organizerName
  mode: "in_person" | "online"
  location: { lat, lng } | null  // null for online
  placeName, island
  onlineUrl: string | null
  startsAt, endsAt               // endsAt is required (default: start + 2 h)
  capacity: number | null
  attendeeIds: string[]
  attendeeLanguages: { uid: ["es", "en"] } // drives the flags; counted in the browser
  ratingSum, ratingCount         // average = sum / count
  embedding: number[] | null     // 384 numbers from the embedding model
  createdAt

events/{eventId}/messages/{messageId}     // group chat
  uid, name, text, createdAt

events/{eventId}/reviews/{uid}            // one review per attendee
  rating: 1..5, text, name, createdAt
```

Join and leave are **one atomic update** each (`arrayUnion` / `arrayRemove` plus one map key), so no transaction is needed and there are no counters to drift. A review updates the review document and the rating totals together, so that one uses a transaction.

**Queries.** The home screen loads every event that has not ended (`endsAt >= now`, ordered by `endsAt`) once and filters, sorts and measures distance in the browser. "My chats" is `where("attendeeIds", "array-contains", uid)`.
*Shortcut: fine up to a few hundred events (each carries ~4 KB of embedding). Beyond that, add geohash queries with `geofire-common` and move embeddings out of the event document.*

## Security rules (outline)

Live in `firestore.rules`, deployed, and covered by `node scripts/rules-check.mjs` (14 checks).

- **users**: any signed-in user can read; you can write only your own document; you cannot set `verified` yourself.
- **events**: anyone can read. Signed-in users can create with `organizerId == their uid`; `official: true` is allowed only when the creator's user document has `verified == true`. Only the organiser can edit or delete. Any signed-in user may update **only** `attendeeIds` and `attendeeLanguages` (to join or leave), only by adding or removing themselves, and never past `capacity`.
- **messages**: read and create only if your uid is in the event's `attendeeIds`; you can delete your own.
- **reviews**: anyone can read; create only as yourself, only if you are an attendee.
- **Storage** (`storage.rules`): event images live at `events/{uid}/{file}`. Anyone can read; you can write only inside your own folder, images only, under 5 MB.

## Local AI

Everything lives in `src/lib/ai/` and runs in one Web Worker so the interface never freezes. Models are downloaded on first use and then cached by the browser.

| Job | Model | Download | Runs on |
|---|---|---|---|
| Embeddings | `Xenova/multilingual-e5-small` (quantized, 384 dims, ~100 languages) | 118 MB | Any device (WASM) |
| Chat, default | `onnx-community/LFM2-350M-ONNX` (`q4f16`) | 255 MB | Devices with WebGPU |
| Chat, demo laptop | `onnx-community/gemma-3-1b-it-ONNX-GQA` (`q4f16`) | 763 MB | Laptop with WebGPU |

The chat model is one constant in `src/lib/ai/config.ts`; alternatives of similar size are `onnx-community/gemma-3-270m-it-ONNX` (273 MB) and `onnx-community/Qwen3-0.6B-ONNX` (570 MB).

**How each feature uses it**

- **Similar-event check (F9).** Show an instant guess first (same category, same day, within 5 km — no model, no download), then, once the model has loaded: embed `title + description`, compare by cosine similarity with the `embedding` of every loaded upcoming event, show the top 3 above a threshold. The embedding is saved on the new event when it is posted.
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

One workflow, [.github/workflows/deploy.yml](.github/workflows/deploy.yml), runs lint + build and then deploys. Both `main` and `develop` require a pull request with a green build. The service-account key is the GitHub secret `FIREBASE_SERVICE_ACCOUNT`; it is never in the repo. Delete that key in the Firebase console after the hackathon.

**Images.** The create-event form uploads the file with `uploadEventImage(uid, file)` (`src/lib/db.ts`), which stores it at `events/{uid}/…` and returns a download link; that link is saved on the event as `imageUrl`. Storage needs the pay-as-you-go (Blaze) plan and a bucket created once in the console.

**Security rules are not deployed by CI.** Live, staging and previews all share one database, so a rules change reaches everyone at once. The project owner deploys by hand and checks:

```bash
firebase deploy --only firestore,storage && node scripts/rules-check.mjs
```

New rules can take a few minutes to become active everywhere; if the check fails right after a deploy, wait and run it again.

Firestore: the `(default)` database is in **`europe-southwest1` (Madrid)**, the closest region to the islands.
