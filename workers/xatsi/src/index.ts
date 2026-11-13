/**
 * xatsí — Cloudflare Worker AI endpoint.
 *
 * Two ways to call POST /chat (response: text/event-stream, Workers AI streaming format):
 *
 *  1. Conversation (`messages` present) — xatsí as a real chatbot. The client sends the chat so
 *     far, a CATALOGUE of real upcoming activities (already pre-ranked, each with a number) and the
 *     person's profile without their name. xatsí answers normal questions too, and when it
 *     recommends something it cites the activity as [[n]]; the app turns those into real cards.
 *     It can only cite what is in the catalogue, so it cannot invent an activity.
 *
 *  2. Legacy (`prompt` + `events`) — 2-3 sentences about events the client found. Still used by the
 *     "similar activities" warning in the create form.
 *
 * Deploy: cd workers/xatsi && npx wrangler login && npx wrangler deploy
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

interface CatalogItem {
  ref: number;
  title: string;
  category: string;
  when: string;
  where: string;
  people: string;
  languages: string[];
  inclusion: string[];
}

interface ConversationRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  catalog: CatalogItem[];
  profile: Omit<ProfileSummary, "displayName"> & { prefers?: string } | null;
  mode?: "chat";
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

const CHAT_SYSTEM = `Eres xatsí, el asistente de FlejeThePueblo: una app para conocer gente y hacer actividades en las Islas Canarias, pensada para personas de cualquier origen, idioma, edad, cuerpo o identidad.

CÓMO HABLAS
- Responde en el idioma en que te escriban. Si no está claro, en español.
- Lectura fácil: frases cortas, palabras corrientes. Tono cercano y respetuoso.
- Lenguaje inclusivo: si no sabes el género de alguien, usa formas neutras ("cada persona", "quien quiera").
- Normalmente menos de 90 palabras, salvo que te pidan más detalle.

QUÉ HACES
- Conversas con normalidad: saludos, dudas sobre cómo usar la app, sobre las islas, sobre cómo conocer gente, ideas de planes.
- Recomiendas actividades del CATÁLOGO cuando la persona busca planes o te pide ideas.

CÓMO RECOMIENDAS
- Solo puedes recomendar actividades del CATÁLOGO. Cítalas escribiendo su número así: [[3]]. La app muestra la tarjeta, así que no copies el título entero.
- Como máximo 4 actividades. Di en pocas palabras por qué encaja cada una (tema, isla, fecha, idiomas de quien va, accesibilidad).
- Si nada del catálogo encaja, dilo con sinceridad y anima a crear la actividad con el botón "Crear".
- NUNCA inventes actividades, fechas, lugares, precios ni enlaces.

LÍMITES
- No das consejos médicos, legales ni económicos: recomienda hablar con profesionales.
- Emergencias: 112. Si alguien habla de hacerse daño, responde con calma y recomienda el 024 (atención a la conducta suicida) o el 112.
- No pidas datos personales.

FUNCIONES DE LA APP (por si preguntan)
Mapa con actividades y filtros por tema; "Descubrir" para deslizar tarjetas; crear actividades con foto y accesibilidad; chat de grupo al apuntarte; reseñas después de ir; perfil con idiomas, intereses, pronombres y avatar canario; banderas que muestran qué idiomas habla la gente que va.`;

function buildConversationSystem(req: ConversationRequest): string {
  const parts = [CHAT_SYSTEM];
  if (req.profile) {
    parts.push(
      `\nPERFIL DE LA PERSONA (no lo repitas, úsalo para recomendar):\n- Intereses: ${req.profile.interests.join(", ") || "no indicados"}\n- Idiomas: ${req.profile.languages.join(", ") || "no indicados"}\n- Vive en: ${req.profile.island || "no indicado"}` +
        (req.profile.prefers ? `\n- Prefiere: ${req.profile.prefers}` : ""),
    );
  } else {
    parts.push("\nLa persona no ha entrado en su cuenta: no conoces su perfil.");
  }
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "Atlantic/Canary" });
  parts.push(`\nHoy es ${today}.`);
  if (req.catalog.length) {
    const lines = req.catalog.map(
      (item) =>
        `[[${item.ref}]] ${item.title} · ${item.category} · ${item.when} · ${item.where} · ${item.people}` +
        (item.languages.length ? ` · idiomas de quien va: ${item.languages.join(", ")}` : "") +
        (item.inclusion.length ? ` · accesibilidad: ${item.inclusion.join(", ")}` : ""),
    );
    parts.push(`\nCATÁLOGO (actividades reales que puedes citar):\n${lines.join("\n")}`);
  } else {
    parts.push("\nCATÁLOGO: vacío. No hay actividades que citar ahora mismo.");
  }
  return parts.join("\n");
}

/** Keeps requests small and well-formed: last 10 turns, text only, bounded length. */
function cleanConversation(body: ConversationRequest): ConversationRequest | null {
  if (!Array.isArray(body.messages) || !Array.isArray(body.catalog)) return null;
  const messages = body.messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return null;
  const catalog = body.catalog.slice(0, 30).map((item, index) => ({
    ref: Number(item.ref) || index + 1,
    title: String(item.title ?? "").slice(0, 120),
    category: String(item.category ?? "").slice(0, 40),
    when: String(item.when ?? "").slice(0, 60),
    where: String(item.where ?? "").slice(0, 100),
    people: String(item.people ?? "").slice(0, 40),
    languages: Array.isArray(item.languages) ? item.languages.slice(0, 15).map(String) : [],
    inclusion: Array.isArray(item.inclusion) ? item.inclusion.slice(0, 8).map(String) : [],
  }));
  return { messages, catalog, profile: body.profile ?? null };
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

    let aiMessages: { role: string; content: string }[];
    let maxTokens = 256;
    const conversation = "messages" in body ? cleanConversation(body as unknown as ConversationRequest) : null;
    if (conversation) {
      aiMessages = [{ role: "system", content: buildConversationSystem(conversation) }, ...conversation.messages];
      maxTokens = 450;
    } else {
      if (!body.prompt || !Array.isArray(body.events)) {
        return corsResponse("Missing prompt or events", { status: 400 });
      }
      aiMessages = [
        { role: "system", content: buildSystemPrompt(body) },
        { role: "user", content: body.prompt },
      ];
    }

    try {
      const stream = (await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
        messages: aiMessages,
        stream: true,
        max_tokens: maxTokens,
        temperature: 0.6,
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
