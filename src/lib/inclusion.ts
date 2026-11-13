/**
 * Inclusion and accessibility features an event can offer — SHARED file.
 *
 * The organiser ticks them when creating an event (F17); they show as small icons next to the
 * language flags, and the home screen can filter by them. Icons are lucide-react SVGs.
 * We never store a person's disability: filtering happens in the moment, not on the profile.
 */
import { AccessibilityIcon, CaptionsIcon, EyeOffIcon, HandIcon, SpeechIcon, VenusAndMarsIcon } from "lucide-react";

export const INCLUSION = [
  { id: "wheelchair", label: "Wheelchair accessible", icon: AccessibilityIcon },
  { id: "sign_language", label: "Sign language", icon: HandIcon },
  { id: "low_vision", label: "Blind and low-vision friendly", icon: EyeOffIcon },
  { id: "captions", label: "Captions or hearing loop", icon: CaptionsIcon },
  { id: "inclusive_language", label: "Inclusive language", icon: SpeechIcon },
  { id: "gender_perspective", label: "Gender perspective", icon: VenusAndMarsIcon },
] as const;

export type InclusionId = (typeof INCLUSION)[number]["id"];

/** Suggestions shown in onboarding; people can also type their own. */
export const PRONOUN_SUGGESTIONS = ["she/her", "he/him", "they/them", "she/they", "he/they"] as const;
