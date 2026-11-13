/**
 * One event as a card — SHARED, used by the home list (Track A), "my chats" (Track B) and the
 * assistant's answers (Track C). PLACEHOLDER: shows the title only.
 *
 * To build (Foundation or whoever needs it first — tell the others, all three tracks use it):
 *  - shadcn <Card>: image on top (`event.imageUrl`, plain <img> with a category-emoji fallback),
 *    title, date (`Intl.DateTimeFormat("es-ES", …)`), place or an "Online" <Badge>, "Official" <Badge>,
 *    <LanguageFlags languages={event.attendeeLanguages} />, <InclusionBadges features={event.inclusion} />,
 *    people joined / capacity.
 *  - `distanceKm` is optional: show "2.3 km" only when it is given.
 *  - The whole card is a <Link href={`/event/?id=${event.id}`}>.
 *  - Presentational: props in, markup out. No data loading here.
 */
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Meetup } from "@/lib/types";

export function EventCard({ event }: { event: Meetup; distanceKm?: number }) {
  return (
    <Link href={`/event/?id=${event.id}`}>
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}
