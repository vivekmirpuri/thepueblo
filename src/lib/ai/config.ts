/**
 * Which local models the app downloads — owned by Track C.
 *
 * All run in the browser through Transformers.js (`@huggingface/transformers`). They are fetched
 * from the Hugging Face hub on first use and then cached by the browser. Sizes checked 2026-11-12.
 * Full reasoning: ARCHITECTURE.md → "Local AI".
 */

/** Turns text into 384 numbers. ~118 MB, ~100 languages, runs on any device (WASM). */
export const EMBEDDING_MODEL = { id: "Xenova/multilingual-e5-small", dtype: "q8" } as const;

/** Writes the assistant's sentences. ~255 MB. Needs WebGPU; when it is missing we show a fixed sentence. */
export const CHAT_MODEL = { id: "onnx-community/LFM2-350M-ONNX", dtype: "q4f16" } as const;

/** Heavier, better wording for the demo laptop. ~763 MB. Swap it into CHAT_MODEL to try it. */
export const CHAT_MODEL_LAPTOP = { id: "onnx-community/gemma-3-1b-it-ONNX-GQA", dtype: "q4f16" } as const;

/** Cosine similarity above which two events count as "similar" (F9). Tune with real data. */
export const SIMILAR_THRESHOLD = 0.82;
