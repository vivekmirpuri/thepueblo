/**
 * Client for the xatsí Cloudflare Worker AI endpoint — owned by Track C.
 *
 * The Worker writes 2-3 friendly sentences about events the CLIENT already found.
 * It never searches or invents events. If the Worker is unreachable, the caller
 * gets a fixed fallback sentence — the event cards still show, so nothing breaks.
 */
import { XATSI_WORKER_URL } from "./config";

// ── Types sent to the Worker (kept small: no embeddings, no full attendee lists) ─

export interface EventSummary {
  title: string;
  category: string;
  startsAt: string;
  placeName: string;
  island: string | null;
  attendeeCount: number;
  languages: string[];
}

export interface ProfileSummary {
  displayName: string;
  interests: string[];
  languages: string[];
  island: string;
}

export type XatsiMode = "search" | "suggest" | "similar";

// ── Fallbacks when the Worker is down ────────────────────────────────────────

const FALLBACK: Record<XatsiMode, string> = {
  search: "Estas son las actividades que he encontrado para ti.",
  suggest: "Aquí tienes actividades que pueden gustarte.",
  similar: "Ya hay actividades parecidas. ¿Por qué no te unes a una?",
};

// ── SSE stream parser ────────────────────────────────────────────────────────

/** A chat turn sent to the Worker (text only). */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/** One activity in the catalogue xatsí may cite, by its number, as [[ref]]. */
export interface CatalogItem {
  ref: number;
  title: string;
  category: string;
  when: string;
  where: string;
  people: string;
  languages: string[];
  inclusion: string[];
}

/** POSTs to the Worker and passes each streamed token to `onToken`; returns the whole text, or `fallback`. */
async function streamFromWorker(body: unknown, fallback: string, onToken: (token: string) => void): Promise<string> {
  const fail = () => {
    onToken(fallback);
    return fallback;
  };
  if (!XATSI_WORKER_URL) return fail();

  try {
    const response = await fetch(`${XATSI_WORKER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok || !response.body) return fail();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") return full || fail();

        try {
          const parsed = JSON.parse(data) as {
            response?: string;
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const chunk = parsed.response || parsed.choices?.[0]?.delta?.content || "";
          if (chunk) {
            full += chunk;
            onToken(chunk);
          }
        } catch {
          // Ignore malformed SSE chunks.
        }
      }
    }

    return full || fail();
  } catch {
    return fail();
  }
}

/**
 * Calls the xatsí Worker and yields tokens as they arrive (one-shot comment on found events).
 *
 * @param onToken Called once per token with the new text fragment.
 * @returns The full accumulated response, or a fallback if the Worker failed.
 */
export function streamXatsiChat(
  params: {
    prompt: string;
    events: EventSummary[];
    profile: ProfileSummary | null;
    mode: XatsiMode;
  },
  onToken: (token: string) => void,
): Promise<string> {
  return streamFromWorker(params, FALLBACK[params.mode], onToken);
}

/**
 * xatsí as a chatbot: sends the conversation, a catalogue of real activities it may cite as
 * [[ref]], and the profile WITHOUT the person's name. The legacy `prompt`/`events` fields go too,
 * so an older deployed Worker (which ignores `messages`) still answers in its one-shot style.
 */
export function streamXatsiConversation(
  params: {
    messages: ChatTurn[];
    catalog: CatalogItem[];
    profile: Omit<ProfileSummary, "displayName"> & { prefers?: string } | null;
    events: EventSummary[];
  },
  onToken: (token: string) => void,
): Promise<string> {
  const prompt = [...params.messages].reverse().find((turn) => turn.role === "user")?.content ?? "";
  return streamFromWorker(
    { ...params, prompt, mode: "search", profile: params.profile && { displayName: "", ...params.profile } },
    "Ahora mismo no puedo responder. Mira las actividades de abajo o inténtalo en un momento.",
    onToken,
  );
}
