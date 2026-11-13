/**
 * xatsí — Cloudflare Worker AI endpoint.
 *
 * Receives a list of already-matched events (the client searched them) and the user's profile,
 * then asks a lightweight LLM to write 2-3 friendly sentences about those events. The Worker
 * NEVER searches or invents events — it only comments on what the client found.
 *
 * Endpoint: POST /chat
 * Response: text/event-stream (SSE), same format as Workers AI streaming.
 */

export interface Env {
  AI: {
    run: (model: string, options: Record<string, unknown>) => Promise<unknown>;
  };
}

// ── Request / response shapes ────────────────────────────────────────────────

interface EventSummary {
  title: string;
  category: string;
  startsAt: string;
  placeName: string;
  island: string | null;
  attendeeCount: number;
  languages: string[];
}

interface ProfileSummary {
  displayName: string;
  interests: string[];
  languages: string[];
  island: string;
}

interface ChatRequest {
  /** What the user typed, or a generated phrase for "Sugiéreme algo". */
  prompt: string;
  /** Events the client already found (stripped down, no embeddings). */
  events: EventSummary[];
  /** null when the user is not logged in. */
  profile: ProfileSummary | null;
  /** Controls the tone of the response. */
  mode: "search" | "suggest" | "similar";
}

// ── Prompts ──────────────────────────────────────────────────────────────────

const BASE_SYSTEM = `Eres xatsí, el asistente de thepueblo, una app para conocer gente en las Islas Canarias.

REGLAS ESTRICTAS:
- Responde SOLO en español.
- NUNCA inventes actividades. Solo puedes hablar de las que te paso a continuación.
- Escribe como máximo 2-3 frases cortas, en un tono cercano y animado.
- Usa lectura fácil: frases cortas, palabras corrientes, sin tecnicismos.
- Si el perfil indica idiomas o intereses que coinciden con alguna actividad, menciónalo brevemente.
- Si no hay actividades, anima a la persona a crear una.
- No repitas los títulos exactos de las actividades: el usuario ya los ve en las tarjetas.`;

function buildSystemPrompt(req: ChatRequest): string {
  const parts = [BASE_SYSTEM];

  // Mode-specific instruction
  if (req.mode === "similar") {
    parts.push(
      "\nCONTEXTO: La persona está creando una actividad nueva. Ya existen actividades parecidas. " +
        "Avísale con amabilidad y sugiérele unirse a una de las que ya existen.",
    );
  } else if (req.mode === "suggest") {
    parts.push(
      "\nCONTEXTO: La persona ha pulsado \"Sugiéreme algo\". Recomiéndale las actividades " +
        "que mejor encajen con su perfil.",
    );
  } else {
    parts.push(
      "\nCONTEXTO: La persona busca actividades. Comenta brevemente lo que se ha encontrado.",
    );
  }

  // Profile
  if (req.profile) {
    parts.push(
      `\nPERFIL DE LA PERSONA:\n- Nombre: ${req.profile.displayName}\n- Intereses: ${req.profile.interests.join(", ") || "no indicados"}\n- Idiomas: ${req.profile.languages.join(", ")}\n- Isla: ${req.profile.island}`,
    );
  }

  // Events
  if (req.events.length > 0) {
    const list = req.events
      .map(
        (e, i) =>
          `${i + 1}. "${e.title}" — ${e.category}, ${e.startsAt}, ${e.placeName || "en línea"}` +
          (e.attendeeCount > 0 ? `, ${e.attendeeCount} apuntados` : "") +
          (e.languages.length > 0 ? `, idiomas: ${e.languages.join(", ")}` : ""),
      )
      .join("\n");
    parts.push(`\nACTIVIDADES ENCONTRADAS:\n${list}`);
  } else {
    parts.push("\nNo se han encontrado actividades.");
  }

  return parts.join("\n");
}

// ── CORS ─────────────────────────────────────────────────────────────────────

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsResponse(body: BodyInit | null, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(CORS)) headers.set(key, value);
  return new Response(body, { ...init, headers });
}

// ── Handler ──────────────────────────────────────────────────────────────────

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Preflight
    if (request.method === "OPTIONS") return corsResponse(null, { status: 204 });

    // Only POST /chat
    const url = new URL(request.url);
    if (url.pathname !== "/chat" || request.method !== "POST") {
      return corsResponse("Not found", { status: 404 });
    }

    let body: ChatRequest;
    try {
      body = (await request.json()) as ChatRequest;
    } catch {
      return corsResponse("Invalid JSON", { status: 400 });
    }

    if (!body.prompt || !Array.isArray(body.events)) {
      return corsResponse("Missing prompt or events", { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(body);

    try {
      const stream = (await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: body.prompt },
        ],
        stream: true,
        max_tokens: 256,
      })) as ReadableStream;

      // Workers AI with stream:true returns a ReadableStream in SSE format.
      return corsResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error("AI error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return corsResponse(JSON.stringify({ error: "AI model error", details: message }), { status: 502 });
    }
  },
};

export default worker;
