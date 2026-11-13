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

/**
 * Calls the xatsí Worker and yields tokens as they arrive.
 *
 * @param onToken Called once per token with the new text fragment.
 * @returns The full accumulated response, or a fallback if the Worker failed.
 */
export async function streamXatsiChat(
  params: {
    prompt: string;
    events: EventSummary[];
    profile: ProfileSummary | null;
    mode: XatsiMode;
  },
  onToken: (token: string) => void,
): Promise<string> {
  if (!XATSI_WORKER_URL) {
    const fb = FALLBACK[params.mode];
    onToken(fb);
    return fb;
  }

  try {
    const response = await fetch(`${XATSI_WORKER_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok || !response.body) {
      const fb = FALLBACK[params.mode];
      onToken(fb);
      return fb;
    }

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
        if (data === "[DONE]") return full;

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

    return full || FALLBACK[params.mode];
  } catch {
    const fb = FALLBACK[params.mode];
    onToken(fb);
    return fb;
  }
}
