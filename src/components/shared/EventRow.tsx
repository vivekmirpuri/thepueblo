/**
 * One activity as a compact row — SHARED. Built (not a placeholder).
 *
 * The same row everywhere a list should stay short: "Mis grupos" (links to the chat) and xatsí's
 * answers (link to the activity). Category icon, title, date, place and how many people go, plus
 * the language flags so you can still see who you would understand.
 * Presentational: props in, markup out. Wrap rows in <ul className="divide-y rounded-xl border">.
 */
import Link from "next/link";
import { ChevronRightIcon, MessageCircleIcon } from "lucide-react";
import { LanguageFlags } from "@/components/shared/LanguageFlags";
import { findCategory } from "@/lib/categories";
import type { Meetup } from "@/lib/types";

const WHEN = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" });

export function EventRow({ event, href, showFlags = false }: { event: Meetup; href: string; showFlags?: boolean }) {
  const Icon = findCategory(event.category)?.icon ?? MessageCircleIcon;
  const people = event.attendeeIds.length;
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-16 items-center gap-3 px-3 py-2 outline-none hover:bg-muted/50 focus-visible:bg-muted"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="block truncate font-medium">{event.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {WHEN.format(event.startsAt.toDate())} · {event.mode === "online" ? "En línea" : event.placeName} · {people}{" "}
            {people === 1 ? "persona" : "personas"}
          </span>
          {showFlags && <LanguageFlags languages={event.attendeeLanguages ?? {}} />}
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}
