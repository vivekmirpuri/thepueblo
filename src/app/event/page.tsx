/**
 * One event: details, join / leave, language flags, reviews — Track B. PLACEHOLDER.
 * Pattern: this page is the CONTAINER (loads data, holds state); components under
 * src/components/ only receive props and draw.
 *
 * To build (B2, B3, B6, B7):
 *  - Read the id from `?id=` with `useSearchParams()` inside a <Suspense> (no /event/[id] routes
 *    in a static export). Load with `getEvent(id)` from "@/lib/db".
 *  - Image, title, "Official" badge, date, place (small map) or online link, description.
 *  - Join / Leave <Button> → `joinEvent` / `leaveEvent` (already built in "@/lib/db").
 *  - <LanguageFlags languages={event.attendeeLanguages} /> (already built).
 *  - "Open chat" → `/chats/?event=<id>` once joined. Reviews list and form after the event has started.
 */
import { Placeholder } from "@/components/shared/Placeholder";

export default function EventPage() {
  return (
    <Placeholder title="Event" track="B" features="F10 · F11 · F12 · F13" />
  );
}
