/**
 * Small inclusion and accessibility icons on an event (F17) — SHARED. Built (not a placeholder).
 *
 * Sits next to <LanguageFlags>. Each icon has a tooltip and a screen-reader label, so it is
 * understandable without seeing it. Presentational: give it `event.inclusion`.
 */
import { INCLUSION, type InclusionId } from "@/lib/inclusion";

export function InclusionBadges({ features }: { features: InclusionId[] }) {
  const shown = INCLUSION.filter((item) => features.includes(item.id));
  if (shown.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2 text-muted-foreground" aria-label="Inclusion and accessibility">
      {shown.map(({ id, label, icon: Icon }) => (
        <li key={id} title={label}>
          <Icon className="size-4" aria-hidden />
          <span className="sr-only">{label}</span>
        </li>
      ))}
    </ul>
  );
}
