/**
 * A person's name with their pronouns, when they chose to add them (F18) — SHARED. Built.
 *
 * Use it everywhere a name appears: chat messages, attendee lists, "People like you", profile.
 * Renders "Ana" or "Ana · ella".
 */
export function PersonName({ name, pronouns }: { name: string; pronouns?: string | null }) {
  return (
    <span>
      {name}
      {pronouns && <span className="text-muted-foreground"> · {pronouns}</span>}
    </span>
  );
}
