/**
 * The local AI — owned by Track C. PLACEHOLDER: the functions below return "nothing found",
 * so the other tracks can already call them and their screens keep working.
 *
 * This file is the CONTRACT. Tracks A and B import only from here; keep the signatures stable.
 *
 * To build (C3 first — it is the biggest unknown in the project, try it before anything else):
 *  1. Create `worker.ts` next to this file. Inside it:
 *       import { pipeline } from "@huggingface/transformers";
 *       const extractor = await pipeline("feature-extraction", EMBEDDING_MODEL.id, { dtype: EMBEDDING_MODEL.dtype });
 *       const output = await extractor(texts, { pooling: "mean", normalize: true });
 *     Check the Transformers.js 4 docs first — this is the v3 API from memory.
 *  2. Start it from here with `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })`
 *     and talk to it with postMessage. A worker keeps the screen responsive while the model runs.
 *  3. e5 models want a prefix: "query: …" for what the user typed, "passage: …" for stored events.
 *  4. Vectors are normalised, so cosine similarity is just the dot product.
 *  5. findSimilarEvents: show an instant guess first (same category, same day, within 5 km — no
 *     model needed), then re-rank with embeddings once the model has loaded.
 *  6. The chat model (C6) is optional polish. Retrieval alone must answer the question.
 *
 * Not verified yet: that Transformers.js bundles under Next 16 + Turbopack. If the build complains
 * about `onnxruntime-node` or `sharp`, alias them to an empty module in next.config.ts → turbopack.resolveAlias.
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- placeholder: delete this line with the first real implementation */
import type { Meetup, UserProfile } from "../types";

export interface ScoredEvent {
  event: Meetup;
  /** 0–1, higher is closer. */
  score: number;
}

/** F9 — events that look like the one being written. Used by the create-event form (Track B). */
export async function findSimilarEvents(text: string, events: Meetup[], limit = 3): Promise<ScoredEvent[]> {
  return [];
}

/** F16 — free-text search by meaning. Used by the assistant and by search on the home screen. */
export async function searchEvents(query: string, events: Meetup[], limit = 5): Promise<ScoredEvent[]> {
  return [];
}

/** F16 — "Suggest for me": events that fit this person's interests, languages and island. */
export async function recommendEvents(profile: UserProfile, events: Meetup[], limit = 5): Promise<ScoredEvent[]> {
  return [];
}
