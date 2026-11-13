/**
 * One event as a card — SHARED, used by the home list (Track A), "mis chats" (Track B) and the
 * assistant's answers (Track C). Built (not a placeholder).
 *
 * Shows, in this order: the cover image (or the category's icon when there is none), the title,
 * when and where, the "Oficial" badge, the flags of the languages its people speak and the
 * inclusion icons. Presentational: props in, markup out. It never loads anything.
 */
import Link from "next/link";
import { CalendarDaysIcon, GlobeIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { InclusionBadges } from "@/components/shared/InclusionBadges";
import { LanguageFlags } from "@/components/shared/LanguageFlags";
import { PhotoCredit } from "@/components/shared/PhotoCredit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { onlineLabel } from "@/lib/platforms";
import { findCategory } from "@/lib/categories";
import type { Meetup } from "@/lib/types";

const WHEN = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function EventCard({ event, distanceKm }: { event: Meetup; distanceKm?: number }) {
  const category = findCategory(event.category);
  const Icon = category?.icon;

  return (
    <Link href={`/event/?id=${event.id}`} className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="overflow-hidden py-0 transition-colors hover:bg-muted/40">
        <div className="relative flex items-center justify-center bg-muted">
          {event.imageUrl ? (
            // Plain <img>: the site is a static export, so next/image optimisation is off anyway.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt="" className="h-32 w-full object-cover" loading="lazy" />
          ) : (
            Icon && <Icon className="my-8 size-10 text-muted-foreground" aria-hidden />
          )}
          <PhotoCredit credit={event.imageCredit} />
        </div>

        <CardContent className="space-y-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {category && Icon && (
              <Badge variant="secondary">
                <Icon className="size-3.5" aria-hidden /> {category.label}
              </Badge>
            )}
            {event.official && <Badge>Oficial</Badge>}
          </div>

          <h3 className="font-semibold">{event.title}</h3>

          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDaysIcon className="size-4 shrink-0" aria-hidden />
            {WHEN.format(event.startsAt.toDate())}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {event.mode === "online" ? (
              <>
                <GlobeIcon className="size-4 shrink-0" aria-hidden /> {onlineLabel(event.onlinePlatform)}
              </>
            ) : (
              <>
                <MapPinIcon className="size-4 shrink-0" aria-hidden />
                {event.placeName}
                {distanceKm !== undefined && ` · a ${distanceKm.toFixed(1)} km`}
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UsersIcon className="size-4" aria-hidden />
              {event.attendeeIds.length}
              {event.capacity ? ` / ${event.capacity}` : ""}
              <span className="sr-only">
                {event.attendeeIds.length === 1 && !event.capacity ? "persona apuntada" : "personas apuntadas"}
              </span>
            </span>
            <LanguageFlags languages={event.attendeeLanguages} />
            <InclusionBadges features={event.inclusion} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
