# The Pueblo — implementation plan

Product: [CONTEXT.md](CONTEXT.md) (feature IDs F1–F16). Design: [ARCHITECTURE.md](ARCHITECTURE.md).

## Phase 0 — Foundation (one person, before anyone else starts)

Everything three people would otherwise fight over is laid down once, in one PR to `develop`.

**Console steps (project owner, by hand)**
- [ ] Authentication → enable **Google** sign-in.
- [ ] Firestore → create database, region **europe-southwest1**, production mode.
- [ ] Add `thepueblo-6f94e.web.app` staging/preview domains to Authentication → Settings → Authorized domains if sign-in fails on previews.

**Code**
- [ ] **AI spike first** (30 min, biggest unknown): load Transformers.js in a Web Worker under Next 16, embed one sentence, generate one reply. If the chat model won't run, keep embeddings only and ship the assistant without generated wording.
- [ ] `npx shadcn@latest init` and add the components listed in ARCHITECTURE.
- [ ] Install `maplibre-gl`, `react-map-gl`, `@huggingface/transformers`.
- [ ] `src/lib/`: `types.ts`, `db.ts`, `auth.tsx`, `categories.ts`, `languages.ts`, `islands.ts`, `geo.ts` (haversine).
- [ ] `src/lib/ai/index.ts` with the **contract** below, returning empty results until Track C fills it in.
- [ ] `src/components/shared/`: `AppShell`, `BottomNav` (Map · Chats · Assistant · People · Profile), `EventCard`, `LanguageFlags`.
- [ ] `/login/` and a redirect to `/onboarding/` when the profile is incomplete.
- [ ] Empty placeholder page for every route, so the navigation works from day one.
- [ ] `firestore.rules` + deploy step for rules in the workflow.
- [ ] `scripts/seed.mjs`: ~30 sample events across the islands, with embeddings.

**Contracts between tracks** (agree once, then don't change without telling the others)

```ts
// src/lib/ai — owned by Track C, used by Track B (create event) and Track A (search)
embed(text: string, kind: "query" | "passage"): Promise<number[]>
findSimilarEvents(text: string, events: Event[], limit?: number): Promise<{ event: Event; score: number }[]>

// src/components/shared — owned by Foundation, used by everyone
<EventCard event={event} distanceKm={number | undefined} />
<LanguageFlags counts={{ es: 4, en: 2 }} />

// src/lib/db.ts — owned by Foundation
listUpcomingEvents(): Promise<Event[]>
joinEvent(eventId, user) / leaveEvent(eventId, user)   // transactions
```

## Phase 1 — Three tracks in parallel

Each track owns its folders (see ARCHITECTURE → Routes and folders) and never edits another track's.

### Track A — Discover (`team/member-1.md`)
| # | Task | Feature |
|---|---|---|
| A1 | Canary Islands map with event pins, tap → mini card | F4 |
| A2 | Category chip bar filtering map and list | F5 |
| A3 | Event list under the map using `EventCard` | F7 |
| A4 | Ask for location; sort by nearby / soonest / most joined | F6 |
| A5 | Filters: official, online, "speaks my languages" | F6, F13 |

### Track B — Events and chat (`team/member-2.md`)
| # | Task | Feature |
|---|---|---|
| B1 | Create-event form, place picked by tapping the map | F8 |
| B2 | Event detail page: info, join / leave | F10 |
| B3 | Language flags on detail and cards (data via `languageCounts`) | F11 |
| B4 | Group chat per event + "my chats" list | F14 |
| B5 | Show similar events in the form (calls `findSimilarEvents`) | F9 |
| B6 | Reviews: stars + comment, average on the event | F12 |
| B7 | Official badge; institutions publish official events | F13 |

### Track C — People and AI (`team/member-3.md`)
| # | Task | Feature |
|---|---|---|
| C1 | Onboarding: interests, languages, island, questions, institution toggle | F2, F3 |
| C2 | Profile page (view and edit) | F2 |
| C3 | AI worker: embedding model, `embed`, `findSimilarEvents` | F9 |
| C4 | Assistant: free search → event cards | F16 |
| C5 | Assistant: "Suggest for me" from the profile | F16 |
| C6 | Chat model wording on capable devices, fixed sentence otherwise | F16 |
| C7 | People like you | F15 |

**Order inside each track is priority order.** A1–A3, B1–B4 and C1–C4 are the demo; the rest is depth.

## Phase 2 — Integrate and rehearse

- [ ] Merge everything to `develop`, test on staging on a real phone and a laptop.
- [ ] Run the seed script; create two test accounts with different languages.
- [ ] Open the assistant once on the demo laptop beforehand so the models are already cached.
- [ ] PR `develop` → `main`.
- [ ] Rehearse the demo below twice.

## Demo script (≈3 minutes)

1. Sign in → onboarding: pick interests and languages.
2. Map of the islands → tap the **Language exchange** chip → pins filter.
3. Sort by **nearby**.
4. Create an event → the app says "there's a similar one 2 km away" → open it instead.
5. Join → the flags row gains your languages.
6. Second device joins the same event → messages appear live in the group chat.
7. Assistant: "something outdoors this weekend, in English" → cards + a short answer, with the laptop offline to prove it is local.
8. An institution's official event with its badge.
9. People like you.

## If time runs out, cut in this order

1. C7 embeddings for profiles (the simple score is enough)
2. B6 reviews
3. C6 chat-model wording (keep search-by-meaning; it is the impressive part)
4. A5 extra filters
5. B7 institution publishing (seed two official events instead)

## How we work

- Branch from `develop`: `git switch -c <name>/<task-id>-<short>` e.g. `ana/b4-group-chat`.
- PR into `develop` → wait for the green check → open the preview URL → **Squash and merge**.
- `develop` → `main` only when staging works; use **Create a merge commit** (not squash) so the two branches don't drift.
- Tick tasks and write blockers in your own `team/<name>.md`.
