/**
 * The row of category buttons above the map (F5) — Track A. PLACEHOLDER.
 *
 * To build (A2):
 *  - Horizontal scrolling row of shadcn <ToggleGroup> items, one per entry in CATEGORIES ("@/lib/categories").
 *  - Props: `selected: CategoryId | null`, `onChange(next)`. Tapping the active chip clears the filter.
 *  - Keep it one line tall with `overflow-x-auto`, like the chips in Google Maps.
 *  - Presentational: it only reports the choice; the page filters the events.
 */
import { Placeholder } from "@/components/shared/Placeholder";

export function CategoryChips() {
  return <Placeholder title="CategoryChips" track="A" features="F5" />;
}
