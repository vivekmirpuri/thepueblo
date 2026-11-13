/**
 * Inclusion and accessibility features an event can offer — SHARED file.
 *
 * `id` is code and stays English; `label` is shown to people, so it is Spanish.
 * The organiser ticks them when creating an event (F17); they show as small icons next to the
 * language flags, and the home screen can filter by them. Icons are lucide-react SVGs.
 * We never store a person's disability: filtering happens in the moment, not on the profile.
 */
import { AccessibilityIcon, CaptionsIcon, EyeOffIcon, HandIcon, RainbowIcon, SpeechIcon, VenusAndMarsIcon } from "lucide-react";

export const INCLUSION = [
  { id: "wheelchair", label: "Accesible en silla de ruedas", icon: AccessibilityIcon },
  { id: "sign_language", label: "Lengua de signos", icon: HandIcon },
  { id: "low_vision", label: "Adaptado a personas ciegas o con baja visión", icon: EyeOffIcon },
  { id: "captions", label: "Subtítulos o bucle magnético", icon: CaptionsIcon },
  { id: "inclusive_language", label: "Lenguaje inclusivo", icon: SpeechIcon },
  { id: "gender_perspective", label: "Perspectiva de género", icon: VenusAndMarsIcon },
  { id: "lgtbiq", label: "Espacio seguro LGTBIQ+", icon: RainbowIcon },
] as const;

export type InclusionId = (typeof INCLUSION)[number]["id"];

/** Suggestions shown in onboarding, in Spanish like the rest of the interface; people can also type their own. */
// "elle" is the neutral pronoun used in Spanish by many non-binary people.
export const PRONOUN_SUGGESTIONS = ["ella", "él", "elle", "ella/elle", "él/elle"] as const;
