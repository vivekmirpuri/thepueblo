"use client";
/**
 * A round, tappable option — SHARED. Built (not a placeholder).
 *
 * The one control behind every multiple-choice question in the app: interests, languages,
 * islands, when you are free. Big enough to tap (min 44px), with a clear chosen state instead
 * of colour alone, and an optional line of explanation so nobody has to guess what it means.
 */
import { Toggle } from "@/components/ui/toggle";
import { Flag } from "@/components/shared/LanguageFlags";
import { cn } from "@/lib/utils";

export function Bubble({
  pressed,
  onPressedChange,
  icon: Icon,
  label,
  description,
  className,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  /** A lucide icon, or an emoji/flag string. */
  icon?: React.ComponentType<{ className?: string }> | string;
  label: string;
  description?: string;
  className?: string;
}) {
  return (
    <Toggle
      variant="outline"
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(
        "h-auto min-h-11 w-full flex-col items-start gap-1 rounded-xl px-3 py-2.5 text-left whitespace-normal",
        "aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-foreground",
        className,
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        {typeof Icon === "string" ? (
          <Flag flag={Icon} className="text-base leading-none" />
        ) : Icon ? (
          <Icon className="size-4 shrink-0" aria-hidden />
        ) : null}
        {label}
      </span>
      {description && <span className="text-xs font-normal text-muted-foreground">{description}</span>}
    </Toggle>
  );
}
