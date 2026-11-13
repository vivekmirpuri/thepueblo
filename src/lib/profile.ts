/**
 * The short questions of the profile — SHARED file.
 *
 * Used by the onboarding form, the profile screen and later by "Gente como tú" (F15).
 * `id` is code (English); `label` is shown to people (Spanish).
 */
export const PREFERS = [
  { id: "in_person", label: "En persona" },
  { id: "online", label: "En línea" },
  { id: "both", label: "Las dos cosas" },
] as const;

export const AVAILABILITY = [
  { id: "weekday_mornings", label: "Mañanas entre semana" },
  { id: "weekday_evenings", label: "Tardes entre semana" },
  { id: "weekends", label: "Fines de semana" },
] as const;

export type AvailabilityId = (typeof AVAILABILITY)[number]["id"];
