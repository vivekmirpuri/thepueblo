/**
 * The row of flags on an event (F11) — SHARED. Built (not a placeholder).
 *
 * Shows which languages the people who joined speak, most common first: "🇪🇸 4  🇬🇧 2".
 * Presentational: give it `event.attendeeLanguages` and it draws; it never loads data itself.
 */
import { LANGUAGES, type LanguageCode } from "@/lib/languages";

export function LanguageFlags({ languages }: { languages: Record<string, LanguageCode[]> }) {
  const counts = new Map<LanguageCode, number>();
  for (const spoken of Object.values(languages))
    for (const code of spoken) counts.set(code, (counts.get(code) ?? 0) + 1);

  return (
    <ul className="flex flex-wrap gap-2 text-sm">
      {[...counts].sort((a, b) => b[1] - a[1]).map(([code, count]) => {
        const language = LANGUAGES.find((l) => l.code === code);
        return (
          <li key={code} title={language?.name ?? code}>
            <span aria-hidden>{language?.flag ?? code}</span>
            <span className="sr-only">{language?.name ?? code}</span> {count}
          </li>
        );
      })}
    </ul>
  );
}
