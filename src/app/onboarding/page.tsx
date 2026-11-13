/**
 * First-time setup: interests, languages, island and a few questions — Track C. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build (C1):
 *  - Short steps, one question per screen: name → pronouns (optional, skippable: chips from
 *    PRONOUN_SUGGESTIONS in "@/lib/inclusion" plus a free-text field) → languages (required, from "@/lib/languages")
 *    → interests (CATEGORIES) → island → in person / online / both → when you are usually free.
 *  - "I represent an institution" switch sets `role: "institution"`; `verified` stays false
 *    until someone ticks it in the Firebase console.
 *  - Save with `saveProfile` from "@/lib/db", then go to "/".
 */
import { Placeholder } from "@/components/shared/Placeholder";

export default function OnboardingPage() {
  return (
    <Placeholder title="Te damos la bienvenida" track="C" features="F2 · F3" />
  );
}
