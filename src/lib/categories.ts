/**
 * Meetup categories — SHARED file.
 *
 * The single list behind three things: a user's interests (onboarding), the chip bar above the
 * map (F5) and the category field of the event form (F8). Add or rename a category only here.
 */
export const CATEGORIES = [
  { id: "sport", label: "Sport", emoji: "⚽" },
  { id: "outdoors", label: "Outdoors & hiking", emoji: "🥾" },
  { id: "languages", label: "Language exchange", emoji: "💬" },
  { id: "debate", label: "Politics & debate", emoji: "🗳️" },
  { id: "improv", label: "Improv & theatre", emoji: "🎭" },
  { id: "music", label: "Music", emoji: "🎶" },
  { id: "food", label: "Food & cooking", emoji: "🍲" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "arts", label: "Arts & crafts", emoji: "🎨" },
  { id: "games", label: "Games", emoji: "🎲" },
  { id: "volunteering", label: "Volunteering", emoji: "🤝" },
  { id: "families", label: "Families", emoji: "👨‍👩‍👧" },
  { id: "wellbeing", label: "Wellbeing", emoji: "🧘" },
  { id: "culture", label: "Culture & heritage", emoji: "🏛️" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
