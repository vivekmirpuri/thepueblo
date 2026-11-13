/**
 * Meetup categories — SHARED file.
 *
 * `id` is code and stays English; `label` is shown to people, so it is Spanish.
 *
 * The single list behind three things: a user's interests (onboarding), the chip bar above the
 * map (F5) and the category field of the event form (F8). Add or rename a category only here.
 */
export const CATEGORIES = [
  { id: "sport", label: "Deporte", emoji: "⚽" },
  { id: "outdoors", label: "Aire libre y senderismo", emoji: "🥾" },
  { id: "languages", label: "Intercambio de idiomas", emoji: "💬" },
  { id: "debate", label: "Política y debate", emoji: "🗳️" },
  { id: "improv", label: "Impro y teatro", emoji: "🎭" },
  { id: "music", label: "Música", emoji: "🎶" },
  { id: "food", label: "Comida y cocina", emoji: "🍲" },
  { id: "tech", label: "Tecnología", emoji: "💻" },
  { id: "arts", label: "Arte y manualidades", emoji: "🎨" },
  { id: "games", label: "Juegos", emoji: "🎲" },
  { id: "volunteering", label: "Voluntariado", emoji: "🤝" },
  { id: "families", label: "Familias", emoji: "👨‍👩‍👧" },
  { id: "wellbeing", label: "Bienestar", emoji: "🧘" },
  { id: "culture", label: "Cultura y patrimonio", emoji: "🏛️" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
