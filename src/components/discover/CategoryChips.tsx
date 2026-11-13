"use client";
/**
 * The row of category buttons above the map (F5) — Track A. Built (not a placeholder).
 *
 * Like the "Restaurantes / Supermercados" row in Google Maps: one line that scrolls sideways,
 * each chip showing the category's icon and name. Tapping the chosen one again clears the filter.
 * Presentational: it only reports the choice; the page filters the activities.
 */
import { Toggle } from "@/components/ui/toggle";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoryChips({
  selected,
  onChange,
  className,
}: {
  selected: CategoryId | null;
  onChange: (next: CategoryId | null) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      role="group"
      aria-label="Filtrar por tema"
    >
      <div className="flex w-max gap-2 py-1">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <Toggle
            key={id}
            variant="outline"
            pressed={selected === id}
            onPressedChange={(on) => onChange(on ? id : null)}
            className="h-10 shrink-0 rounded-full px-3 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-foreground"
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Toggle>
        ))}
      </div>
    </div>
  );
}
